import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { supabase } from '../utils/supabaseClient'
import { canAddDocument, canShareDocument, hasFeature, getPlanLimits } from '../utils/plans'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null)
  const [documents, setDocuments] = useState([])
  const [profileLoading, setProfileLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [planStatus, setPlanStatus] = useState(null) // { doc_count, shares_this_month, plan, ... }

  // ----------------------------------------------------------------
  // 1. Initialisation de la session + récupération du profil complet
  // ----------------------------------------------------------------
  const buildUserFromSession = async (session) => {
    let plan = 'free'
    let sharesThisMonth = 0
    let profileName = session.user.user_metadata?.first_name || 'Utilisateur'
    let profileLastName = session.user.user_metadata?.last_name || ''
    let profileInitials = (profileName[0] || 'U').toUpperCase()

    try {
      // Timeout de sécurité : si Supabase ne répond pas en 5s, on continue quand même
      const profilePromise = supabase
        .from('profiles')
        .select('first_name, last_name, initials, plan, shares_this_month')
        .eq('id', session.user.id)
        .single()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      )

      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise])

      if (!error && profile) {
        plan = profile.plan || 'free'
        sharesThisMonth = profile.shares_this_month || 0
        profileName = profile.first_name || profileName
        profileLastName = profile.last_name || profileLastName
        profileInitials = profile.initials || profileInitials
      }
    } catch (err) {
      // Silently fall back to metadata if profiles table is unavailable
      console.warn('Profile fetch failed, using metadata fallback:', err.message)
    }

    setAuthUser({
      id: session.user.id,
      email: session.user.email,
      name: profileName,
      lastName: profileLastName,
      initials: profileInitials,
      plan,
      sharesThisMonth,
    })

    return { userId: session.user.id, plan }
  }

  useEffect(() => {
    let mounted = true

    // SÉCURITÉ ABSOLUE : Force la fin du chargement après 8 secondes quoi qu'il arrive
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        setProfileLoading(prev => {
          if (prev) console.warn("SÉCURITÉ : Fin du chargement forcée par timeout global")
          return false
        })
      }
    }, 8000)

    const handleAuth = async (session) => {
      if (!mounted) return
      try {
        if (session) {
          const { userId } = await buildUserFromSession(session)
          await fetchDocuments(userId)
        } else {
          setAuthUser(null)
          setDocuments([])
          setPlanStatus(null)
        }
      } catch (err) {
        console.error("Erreur Auth Handler:", err)
      } finally {
        if (mounted) setProfileLoading(false)
      }
    }

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuth(session)
    }).catch(err => {
      console.error("Erreur getSession:", err)
      if (mounted) setProfileLoading(false)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuth(session)
    })

    return () => {
      mounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  // ----------------------------------------------------------------
  // 2. Charger les documents
  // ----------------------------------------------------------------
  const fetchDocuments = async (userId) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const docs = data.map(d => ({
        id: d.id,
        title: d.title,
        type: d.type,
        expiresAt: d.expires_at,
        iconName: d.icon_name || 'file',
        filePath: d.file_path,
        description: d.description || '',
        isEmergency: d.is_emergency || false,
        createdAt: d.created_at
      }))
      setDocuments(docs)
    }
  }

  // ----------------------------------------------------------------
  // 3. Ajouter un document — avec vérification du plan
  // ----------------------------------------------------------------
  const addDocument = async (docData, file) => {
    if (!authUser) return { error: "Non authentifié" }

    // ✅ GARDE DU PLAN GRATUIT — vérification côté client (rapide)
    const { canAdd, reason } = canAddDocument(authUser.plan, documents.length)
    if (!canAdd) {
      return { error: reason, planLimitReached: true }
    }

    try {
      let filePath = docData.filePath || null

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

      const insertPayload = {
        user_id: authUser.id,
        title: docData.title,
        type: docData.category || docData.type || 'Autre',
        expires_at: docData.expiresAt || null,
        icon_name: docData.iconName || 'file',
        file_path: filePath,
        description: docData.description || null
      }

      const { data, error } = await supabase
        .from('documents')
        .insert([insertPayload])
        .select()

      // ✅ Capturer l'erreur PLAN_LIMIT_REACHED du backend (trigger SQL)
      if (error) {
        if (error.message?.includes('PLAN_LIMIT_REACHED')) {
          return { error: error.message.replace('PLAN_LIMIT_REACHED: ', ''), planLimitReached: true }
        }
        throw error
      }

      const newDoc = {
        id: data[0].id,
        title: data[0].title,
        type: data[0].type,
        expiresAt: data[0].expires_at,
        iconName: data[0].icon_name || 'file',
        filePath: data[0].file_path,
        description: data[0].description || '',
        isEmergency: data[0].is_emergency || false,
        createdAt: data[0].created_at
      }

      setDocuments(prev => [newDoc, ...prev])
      return { success: true, data: newDoc }

    } catch (err) {
      console.error("Erreur addDoc:", err)
      return { error: err.message }
    }
  }

  // ----------------------------------------------------------------
  // 4. Partager un document — avec vérification du plan
  // ----------------------------------------------------------------
  const canShare = () => {
    const { canShare: ok, reason } = canShareDocument(
      authUser?.plan || 'free',
      authUser?.sharesThisMonth || 0
    )
    return { ok, reason }
  }

  // ----------------------------------------------------------------
  // 5. Vérifier l'accès aux fonctionnalités
  // ----------------------------------------------------------------
  const checkFeature = (feature) => hasFeature(authUser?.plan || 'free', feature)

  // ----------------------------------------------------------------
  // 6. Auth
  // ----------------------------------------------------------------
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const sendVerificationCode = async (email, password, firstName, lastName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName }
        }
      })
      if (error) throw error
      return { success: true, user: data.user }
    } catch (err) {
      console.error("Erreur sendVerificationCode:", err)
      return { success: false, error: err.message }
    }
  }

  const verifyCode = async (email, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      })
      if (error) throw error
      return { success: true, user: data.user }
    } catch (err) {
      console.error("Erreur verifyCode:", err)
      return { success: false, error: err.message }
    }
  }

  const register = async (firstName, email, password, lastName) => {
    // Dans notre flux, le compte est déjà créé par sendVerificationCode
    // Cette fonction ne sert qu'à mettre à jour l'état local si besoin
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setAuthUser(null)
    setDocuments([])
    setPlanStatus(null)
  }

  // ----------------------------------------------------------------
  // 7. CRUD Documents
  // ----------------------------------------------------------------
  const deleteDocument = async (id) => {
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (!error) {
      setDocuments(prev => prev.filter(d => d.id !== id))
    }
  }

  const updateDocument = async (id, updates) => {
    const sqlUpdates = {}
    if (updates.title !== undefined) sqlUpdates.title = updates.title
    if (updates.type !== undefined) sqlUpdates.type = updates.type
    if (updates.expiresAt !== undefined) sqlUpdates.expires_at = updates.expiresAt
    if (updates.iconName !== undefined) sqlUpdates.icon_name = updates.iconName
    if (updates.description !== undefined) sqlUpdates.description = updates.description
    if (updates.isEmergency !== undefined) sqlUpdates.is_emergency = updates.isEmergency

    const { data, error } = await supabase
      .from('documents')
      .update(sqlUpdates)
      .eq('id', id)
      .select()

    if (!error && data) {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
      return { success: true }
    }
    return { error: error?.message }
  }

  const toggleEmergency = async (id, status) => {
    return updateDocument(id, { isEmergency: status })
  }

  // ----------------------------------------------------------------
  // 8. Stats & Computed values
  // ----------------------------------------------------------------
  const planLimits = useMemo(() => getPlanLimits(authUser?.plan || 'free'), [authUser?.plan])

  const stats = useMemo(() => {
    const now = new Date()
    const soon = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
    return {
      total: documents.length,
      expiringSoon: documents.filter(d => d.expiresAt && new Date(d.expiresAt) < soon).length,
      recent: documents.filter(d => new Date(d.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      // Infos plan
      docsUsed: documents.length,
      docsMax: planLimits.maxDocuments,
      docsPercent: planLimits.maxDocuments === Infinity ? 0 : Math.round((documents.length / planLimits.maxDocuments) * 100),
      sharesUsed: authUser?.sharesThisMonth || 0,
      sharesMax: planLimits.maxSharesPerMonth,
    }
  }, [documents, authUser, planLimits])

  const expiringDocs = useMemo(() => {
    const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return documents.filter(d => d.expiresAt && new Date(d.expiresAt) < soon)
  }, [documents])

  const filteredDocuments = useMemo(() => {
    return documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [documents, searchQuery])

  const value = {
    authUser,
    documents,
    profileLoading,
    stats,
    expiringDocs,
    searchQuery,
    filteredDocuments,
    planLimits,
    setSearchQuery,
    addDocument,
    deleteDocument,
    updateDocument,
    toggleEmergency,
    logout,
    login,
    register,
    sendVerificationCode,
    verifyCode,
    canShare,
    checkFeature,
    hasAlerts: expiringDocs.length > 0 && planLimits.features.expiryAlerts,
    isAuthenticated: !!authUser
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
export const getDocStatus = (expiry) => {
  if (!expiry) return 'ok'
  const diff = (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'danger'
  if (diff < 30) return 'warn'
  return 'ok'
}

export const formatExpiry = (date) => {
  if (!date) return "Pas d'expiration"
  const d = new Date(date)
  const diff = (d - new Date()) / (1000 * 60 * 60 * 24)
  const str = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  if (diff < 0) return `Expiré (${str})`
  if (diff < 30) return `⚠️ Expire dans ${Math.ceil(diff)}j`
  return `Expire le ${str}`
}
