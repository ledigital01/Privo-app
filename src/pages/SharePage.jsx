import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { Lock, Download, AlertCircle, FileText, ShieldCheck, Clock, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SharePage = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [shareData, setShareData] = useState(null)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(null)
  const [signedUrl, setSignedUrl] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    fetchShare()
  }, [id])

  const fetchShare = async () => {
    try {
      const { data, error } = await supabase
        .from('document_shares')
        .select(`
          *,
          documents:document_id (
            title,
            type,
            file_path,
            icon_name
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error("Partage introuvable ou expiré.")

      // Check expiry
      if (new Date(data.expires_at) < new Date()) {
        throw new Error("Ce lien de partage a expiré.")
      }

      setShareData(data)
      // Si pas de mot de passe, on authentifie direct
      if (!data.password) {
        setIsAuthenticated(true)
        generateFinalUrl(data.documents.file_path)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateFinalUrl = async (filePath) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600)
    
    if (data) setSignedUrl(data.signedUrl)
  }

  const handleVerify = () => {
    if (password === shareData.password) {
      setIsAuthenticated(true)
      generateFinalUrl(shareData.documents.file_path)
    } else {
      alert("Mot de passe incorrect.")
    }
  }

  const handleDownload = () => {
    if (!signedUrl) return
    setIsDownloading(true)
    const link = document.createElement('a')
    link.href = signedUrl
    link.download = shareData.documents.title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => setIsDownloading(false), 2000)
  }

  if (loading) {
    return (
      <div className="share-loader" style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bg)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--c-primary-soft)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="share-error" style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', background: 'var(--c-bg)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--c-danger-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <AlertCircle size={32} color="var(--c-danger)" />
        </div>
        <h2 className="title-md">Oups !</h2>
        <p className="body-sm" style={{ marginTop: 8, opacity: 0.7 }}>{error}</p>
        <button onClick={() => window.location.href = '/'} className="btn-secondary" style={{ marginTop: 24 }}>Retour à l'accueil</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--c-bg)', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Header / Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
         <img src="/digisafe_official_logo_1775050111054.png" alt="DigiSAFE" style={{ height: 40, filter: 'drop-shadow(0 4px 12px rgba(0,61,155,0.1))' }} />
         <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <ShieldCheck size={16} color="var(--c-primary)" />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-primary)' }}>Partage Sécurisé</span>
         </div>
      </div>

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card"
            style={{ width: '100%', maxWidth: 400, padding: 32, textAlign: 'center' }}
          >
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--c-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={28} color="var(--c-primary)" />
            </div>
            <h2 className="title-sm">Document Protégé</h2>
            <p className="body-sm" style={{ marginTop: 8, marginBottom: 24, opacity: 0.6 }}>Ce document est protégé par un mot de passe. Veuillez le saisir pour y accéder.</p>
            
            <input 
              type="password"
              placeholder="Saisissez le mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              className="input-field"
              style={{ textAlign: 'center', marginBottom: 16 }}
              autoFocus
            />
            
            <button className="btn-primary w-full" onClick={handleVerify}>Accéder au document</button>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{ width: '100%', maxWidth: 450, padding: 0, overflow: 'hidden' }}
          >
            <div style={{ background: 'linear-gradient(135deg, var(--c-primary), var(--c-primary-mid))', padding: '32px 24px', color: 'white', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FileText size={32} />
              </div>
              <h2 className="title-sm" style={{ color: 'white' }}>{shareData.documents.title}</h2>
              <div style={{ marginTop: 8, fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                 <Clock size={12} /> Expire le {new Date(shareData.expires_at).toLocaleDateString()} à {new Date(shareData.expires_at).toLocaleTimeString([], { hour: '2h', minute: '2h' })}
              </div>
            </div>

            <div style={{ padding: 24 }}>
               <div style={{ background: 'var(--c-surface-2)', padding: 16, borderRadius: 'var(--r-md)', marginBottom: 24, textAlign: 'center' }}>
                  <p className="body-xs" style={{ color: 'var(--c-text-muted)', marginBottom: 4 }}>Format du document</p>
                  <p className="title-xs" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>{shareData.documents.type}</p>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="btn-primary" 
                    style={{ width: '100%', height: 54 }}
                  >
                    {isDownloading ? <Check size={20} /> : <Download size={20} />}
                    {isDownloading ? 'Prêt !' : 'Télécharger le document'}
                  </button>
                  <p className="label-xs" style={{ textAlign: 'center', opacity: 0.5 }}>
                    Partagé via DigiSAFE · AES-256 Encrypted
                  </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .card {
          background: var(--c-surface);
          border-radius: var(--r-2xl);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--c-border);
        }
      `}</style>
    </div>
  )
}

export default SharePage
