import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../utils/supabaseClient'
import { PLAN_LIMITS } from '../utils/plans'

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
          plan: 'free'
        })
        
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single()
        if (profile) setAuthUser(prev => ({ ...prev, plan: profile.plan || 'free' }))
      }
      setLoading(false)
    }
    initSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.first_name || 'Utilisateur',
          plan: 'free'
        })
        const { data: profile } = await supabase.from('profiles').select('plan').eq('id', session.user.id).single()
        if (profile) setAuthUser(prev => ({ ...prev, plan: profile.plan || 'free' }))
      } else {
        setAuthUser(null)
        setDocuments([])
      }
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  // 2. Chargement des documents
  useEffect(() => {
    if (!authUser) return

    const loadDocs = async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
      
      if (!error) setDocuments(data)
    }

    loadDocs()

    // Realtime cleanup / subscription if needed
  }, [authUser])

  // ACTIONS
  const addDocument = async (doc) => {
    const { data, error } = await supabase
      .from('documents')
      .insert([{ ...doc, user_id: authUser.id }])
      .select()
    
    if (!error && data) {
      setDocuments(prev => [data[0], ...prev])
      return { success: true, data: data[0] }
    }
    return { success: false, error: error?.message }
  }

  const updateDocument = async (id, updates) => {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (!error && data) {
      setDocuments(prev => prev.map(d => d.id === id ? data[0] : d))
      return { success: true }
    }
    return { success: false, error: error?.message }
  }

  const deleteDocument = async (id) => {
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (!error) {
      setDocuments(prev => prev.filter(d => d.id !== id))
      return { success: true }
    }
    return { success: false, error: error?.message }
  }

  const toggleEmergency = async (id, isEmergency) => {
    return updateDocument(id, { isEmergency })
  }

  // MEMOS
  const filteredDocuments = useMemo(() => {
    if (!searchQuery) return documents
    const q = searchQuery.toLowerCase()
    return documents.filter(d => 
      d.title.toLowerCase().includes(q) || 
      d.type?.toLowerCase().includes(q) ||
      d.category?.toLowerCase().includes(q)
    )
  }, [documents, searchQuery])

  const stats = useMemo(() => ({
    total: documents.length,
    expiring: documents.filter(d => d.expiry_date && (new Date(d.expiry_date) - new Date()) / (1000 * 60 * 60 * 24) < 30).length,
    recent: documents.filter(d => (new Date() - new Date(d.created_at)) / (1000 * 60 * 60 * 24) < 7).length
  }), [documents])

  const expiringDocs = useMemo(() => 
    documents.filter(d => d.expiry_date && (new Date(d.expiry_date) - new Date()) / (1000 * 60 * 60 * 24) < 30)
  , [documents])

  const canAddDoc = useMemo(() => {
    if (!authUser) return false
    const limit = PLAN_LIMITS[authUser.plan]?.maxDocs || 5
    return documents.length < limit
  }, [authUser, documents])

  const value = {
    authUser,
    documents,
    filteredDocuments,
    loading,
    searchQuery,
    setSearchQuery,
    addDocument,
    updateDocument,
    deleteDocument,
    toggleEmergency,
    stats,
    expiringDocs,
    canAddDoc
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
