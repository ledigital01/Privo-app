import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../utils/supabaseClient'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Initialisation de la session
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.first_name || 'Utilisateur',
          lastName: session.user.user_metadata?.last_name || '',
          initials: (session.user.user_metadata?.first_name?.[0] || 'U').toUpperCase(),
          plan: 'free'
        })
        fetchDocuments(session.user.id)
      }
      setLoading(false)
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.first_name || 'Utilisateur',
          lastName: session.user.user_metadata?.last_name || '',
          initials: (session.user.user_metadata?.first_name?.[0] || 'U').toUpperCase(),
          plan: 'free'
        })
        fetchDocuments(session.user.id)
      } else {
        setAuthUser(null)
        setDocuments([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Charger les documents
  const fetchDocuments = async (userId) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      // Transformation des noms de colonnes SQL -> State React
      const docs = data.map(d => ({
        id: d.id,
        title: d.title,
        type: d.type,
        expiresAt: d.expires_at,
        iconName: d.icon_name || 'file',
        filePath: d.file_path,
        createdAt: d.created_at
      }))
      setDocuments(docs)
    }
  }

  // 3. AJOUTER UN DOCUMENT (CORRIGÉ ✅)
  const addDocument = async (docData, file) => {
    if (!authUser) return { error: "Non authentifié" }

    try {
      let filePath = null

      // Upload du fichier si présent
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const path = `${authUser.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(path, file)

        if (uploadError) throw uploadError
        filePath = path
      }

      // Insertion en BDD
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          user_id: authUser.id,
          title: docData.title,
          type: docData.type,
          expires_at: docData.expiresAt,
          icon_name: docData.iconName,
          file_path: filePath
        }])
        .select()

      if (error) throw error

      // --- LA CORRECTION EST ICI ---
      // On transforme le résultat de Supabase pour correspondre à notre state
      const newDoc = {
        id: data[0].id,
        title: data[0].title,
        type: data[0].type,
        expiresAt: data[0].expires_at,
        iconName: data[0].icon_name || 'file',
        filePath: data[0].file_path,
        createdAt: data[0].created_at
      }

      // On ajoute le nouveau document en haut de la liste locale immédiatement !
      setDocuments(prev => [newDoc, ...prev])

      return { success: true, data: newDoc }

    } catch (err) {
      console.error("Erreur addDoc:", err)
      return { error: err.message }
    }
  }

  // 4. Supprimer un document
  const deleteDocument = async (id) => {
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (!error) {
      setDocuments(prev => prev.filter(d => d.id !== id))
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setAuthUser(null)
    setDocuments([])
  }

  // Stats calculées
  const stats = useMemo(() => {
    const now = new Date()
    const soon = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
    return {
      total: documents.length,
      expiringSoon: documents.filter(d => d.expiresAt && new Date(d.expiresAt) < soon).length,
      recent: documents.filter(d => new Date(d.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
    }
  }, [documents])

  const expiringDocs = useMemo(() => {
    const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return documents.filter(d => d.expiresAt && new Date(d.expiresAt) < soon)
  }, [documents])

  const filteredDocuments = useMemo(() => {
    return documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [documents, searchQuery])

  const value = {
    authUser, documents, loading, stats, expiringDocs, searchQuery, filteredDocuments,
    setSearchQuery, addDocument, deleteDocument, logout, isAuthenticated: !!authUser
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)

// Helpers
export const getDocStatus = (expiry) => {
  if (!expiry) return 'ok'
  const diff = (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'danger'
  if (diff < 30) return 'warn'
  return 'ok'
}

export const formatExpiry = (date) => {
  if (!date) return 'Pas d\'expiration'
  const d = new Date(date)
  const diff = (d - new Date()) / (1000 * 60 * 60 * 24)
  const str = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  if (diff < 0) return `Expiré (${str})`
  if (diff < 30) return `⚠️ Expire dans ${Math.ceil(diff)}j`
  return `Expire le ${str}`
}
