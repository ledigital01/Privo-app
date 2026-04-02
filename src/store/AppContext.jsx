import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../utils/supabaseClient'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  /* ---- PROFILE & DATA LOADING ---- */
  const fetchProfile = async (userId) => {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setAuthUser(prev => ({
          ...prev,
          name: data.first_name || prev?.name,
          lastName: data.last_name || prev?.lastName
        }))
      }
    } catch (err) {
      console.error("Erreur profile:", err)
    }
  }

  const fetchDocuments = async (userId) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) setDocuments(data)
  }

  /* ---- AUTH SESSION ---- */
  useEffect(() => {
    // Initial check
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Auth Session Error:", error)
      }
      if (data && data.session) {
        const user = data.session.user
        setAuthUser({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.first_name || 'Utilisateur',
          lastName: user.user_metadata?.last_name || ''
        })
        fetchProfile(user.id)
        fetchDocuments(user.id)
      }
      setLoading(false)
    }).catch(err => {
      console.error("Erreur critique getSession:", err)
      setLoading(false)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const user = session.user
        setAuthUser({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.first_name || 'Utilisateur',
          lastName: user.user_metadata?.last_name || ''
        })
        fetchProfile(user.id)
        fetchDocuments(user.id)
      } else {
        setAuthUser(null)
        setDocuments([])
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  /* ---- AUTH ACTIONS ---- */
  const sendVerificationCode = useCallback(async (email, password, name, lastName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: name,
          last_name: lastName
        }
      }
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
  }, [])

  const verifyCode = useCallback(async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    })

    if (error) return { success: false, error: error.message }
    return { success: true, user: data.user }
  }, [])

  const register = useCallback(async (name, email, password, lastName = '') => {
    return { success: true }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    return { success: true, data }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setAuthUser(null)
    setDocuments([])
  }, [])

  /* ---- DOC ACTIONS ---- */
  const addDocument = useCallback(async (doc, file) => {
    if (!authUser) return { error: "Déconnecté" }
    
    let fileUrl = null;
    let filePath = null;

    if (file) {
      // 1. Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      filePath = `${authUser.id}/${fileName}`;
      
      // 2. Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error("Erreur d'upload :", uploadError);
        return { error: "Échec de l'upload du fichier." }
      }
      
      // Optional: Get a public or signed URL if you want immediate display
      // const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)
    }

    const newDoc = { 
      ...doc, 
      user_id: authUser.id,
      file_path: filePath, // Requires updating the table schema
    }
    
    // We do not pass `id` to let Postgres generate it
    delete newDoc.id 

    // 3. Save to DB
    const { data, error } = await supabase
      .from('documents')
      .insert([newDoc])
      .select()

    if (error) {
      console.error("Erreur bdd :", error);
      return { error: "Erreur lors de l'enregistrement en BDD." }
    }

    if (data) {
      setDocuments(prev => [data[0], ...prev])
      return { success: true }
    }
  }, [authUser])

  const deleteDocument = useCallback(async (id) => {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
    
    if (!error) setDocuments(prev => prev.filter(d => d.id !== id))
  }, [])

  const updateDocument = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()

    if (data) setDocuments(prev => prev.map(d => d.id === id ? data[0] : d))
  }, [])

  const filteredDocuments = useMemo(() => {
    if (!searchQuery) return documents
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [documents, searchQuery])

  // Calcule les documents expirant dans moins de 30 jours
  const expiringDocs = useMemo(() => {
    const soon = Date.now() + 30 * 24 * 60 * 60 * 1000
    return documents.filter(d => d.expiresAt && new Date(d.expiresAt).getTime() < soon)
  }, [documents])

  const stats = useMemo(() => ({
    total: documents.length,
    recent: documents.filter(d => (Date.now() - new Date(d.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000).length,
    expiringSoon: expiringDocs.length
  }), [documents, expiringDocs])

  return (
    <AppContext.Provider value={{
      /* auth */
      isAuthenticated: !!authUser, authUser, register, login, logout, sendVerificationCode, verifyCode, profileLoading: loading,
      /* docs */
      documents, filteredDocuments, addDocument, deleteDocument, updateDocument,
      /* stats */
      stats, expiringDocs,
      /* search */
      searchQuery, setSearchQuery
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
export const getDocStatus = (expiry) => {
  if (!expiry) return 'normal'
  const days = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'expired'
  if (days <= 30) return 'warn'
  return 'normal'
}
export const formatExpiry = (date) => {
  if (!date) return ''
  return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(
    Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24)),
    'day'
  )
}
