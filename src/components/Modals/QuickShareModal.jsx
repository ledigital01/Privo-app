import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Link, Lock, Clock, ShieldCheck, ChevronRight, Check, Key } from 'lucide-react'
import { t } from '../../utils/i18n'
import { supabase } from '../../utils/supabaseClient'

const QuickShareModal = ({ isOpen, onClose, doc }) => {
  const [expiryHours, setExpiryHours] = useState(24)
  const [password, setPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!doc?.filePath) return alert("Fichier introuvable.")
    
    setIsGenerating(true)
    setCopied(false)
    
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.filePath, expiryHours * 3600)

      if (error) throw error
      
      setGeneratedLink(data.signedUrl)
    } catch (err) {
      console.error("Erreur de partage:", err)
      alert("Impossible de générer le lien de partage.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!generatedLink) return
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleExpiry = () => {
    if (expiryHours === 1) setExpiryHours(24)
    else if (expiryHours === 24) setExpiryHours(168)
    else setExpiryHours(1)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="modal-sheet"
            style={{ height: 'auto', padding: '0 0 40px' }}
          >
            {/* Header */}
            <div className="modal-header" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="icon-wrap sm primary"><Share2 size={18} /></div>
                <h2 className="title-md">{t('share_title')}</h2>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-primary"
                style={{ height: 36, padding: '0 16px', fontSize: '0.8rem' }}
              >
                 {isGenerating ? '...' : (generatedLink ? t('save') : 'Générer')}
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div className="insight-card" style={{ background: 'var(--c-primary-soft)', border: 'none', display: 'flex', gap: 12 }}>
                <ShieldCheck size={28} color="var(--c-primary)" style={{ flexShrink: 0 }} />
                <p className="body-sm" style={{ color: 'var(--c-primary)', lineHeight: 1.4 }}>
                  {t('share_desc')}
                </p>
              </div>

              {/* Share Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="label-xs" style={{ paddingLeft: 4 }}>{t('share_settings')}</div>
                
                <div 
                  onClick={toggleExpiry}
                  className="action-row"
                  style={{ cursor: 'pointer' }}
                >
                   <div className="icon-wrap md neutral"><Clock size={20} /></div>
                   <div style={{ flex: 1 }}>
                      <div className="action-text">{t('share_exp')}</div>
                      <div className="action-desc">
                        {expiryHours === 1 ? '1 heure' : expiryHours === 24 ? '24 heures' : '7 jours'}
                      </div>
                   </div>
                   <div style={{ color: 'var(--c-primary)', fontWeight: 700, fontSize: '0.8rem', background: 'var(--c-primary-soft)', padding: '4px 10px', borderRadius: 8 }}>Modifier</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div 
                    onClick={() => setShowPasswordInput(!showPasswordInput)}
                    className="action-row"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="icon-wrap md neutral"><Lock size={20} /></div>
                    <div style={{ flex: 1 }}>
                        <div className="action-text">{t('share_pwd')}</div>
                        <div className="action-desc">
                          {password ? 'Mot de passe défini' : t('share_pwd_desc')}
                        </div>
                    </div>
                    <ChevronRight size={18} style={{ color: 'var(--c-text-muted)', transform: showPasswordInput ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>

                  {showPasswordInput && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      style={{ padding: '0 4px' }}
                    >
                      <div style={{ position: 'relative' }}>
                        <Key size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input 
                          type="text"
                          placeholder="Code secret..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input-field"
                          style={{ paddingLeft: 40 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Generated Link */}
              {generatedLink && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="label-xs" style={{ paddingLeft: 4 }}>{t('copy')}</div>
                  <div className="doc-card" style={{ cursor: 'default', background: 'var(--c-surface-2)', border: '1.5px solid var(--c-primary)' }}>
                    <div className="icon-wrap sm primary"><Link size={18} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="body-sm truncate italic" style={{ color: 'var(--c-text-muted)' }}>{generatedLink}</div>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className={copied ? 'btn-success' : 'btn-primary'}
                      style={{ padding: '8px 16px', fontSize: '0.8rem', height: 'auto' }}
                    >
                        {copied ? <Check size={16} /> : t('copy')}
                    </button>
                  </div>
                </div>
              )}

              <button 
                onClick={onClose}
                className="btn-secondary w-full"
                style={{ marginTop: 10 }}
              >
                 {t('close')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default QuickShareModal
