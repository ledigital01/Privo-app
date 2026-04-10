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
      // On génère une URL signée réelle avec l'expiration choisie
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
    else if (expiryHours === 24) setExpiryHours(168) // 7 jours
    else setExpiryHours(1)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-h-[95vh] bg-[#f7f9fb] rounded-t-[2.5rem] z-[101] shadow-2xl overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="p-6 pb-2 text-center relative flex justify-between items-center">
              <button 
                onClick={onClose}
                className="p-2 bg-[#eceef0] rounded-full text-[#434654] active:scale-90 transition-all font-bold text-xs"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-2 text-[#434654]">
                <Share2 size={20} />
                <h2 className="font-headline text-xl font-extrabold text-[#191c1e]">
                  {t('share_title')}
                </h2>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="p-2 bg-[#dae2ff] text-[#003d9b] rounded-full active:scale-90 transition-all font-bold text-xs px-4 flex items-center gap-2"
              >
                 {isGenerating ? '...' : (generatedLink ? t('save') : 'Générer')}
              </button>
            </div>

            <div className="p-8 space-y-6">
              
              <div className="bg-[#dae2ff]/50 p-6 rounded-3xl border border-[#dae2ff] flex items-center gap-4">
                <ShieldCheck size={32} className="text-[#004e33]" />
                <div className="flex-1">
                   <p className="text-sm font-body text-[#434654] leading-relaxed">
                     {t('share_desc')}
                   </p>
                </div>
              </div>

              {/* Share Options List */}
              <div className="space-y-3">
                <h3 className="font-headline font-bold text-[#434654] text-[10px] uppercase tracking-widest px-2">{t('share_settings')}</h3>
                
                <div 
                  onClick={toggleExpiry}
                  className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-white/50 shadow-soft cursor-pointer group hover:bg-[#dae2ff]/20 transition-all"
                >
                   <div className="w-12 h-12 bg-[#eceef0] rounded-xl flex-center text-[#434654] group-hover:bg-[#003d9b] group-hover:text-white transition-all">
                      <Clock size={20} />
                   </div>
                   <div className="flex-1">
                      <div className="text-lg font-headline font-bold text-[#191c1e]">{t('share_exp')}</div>
                      <div className="text-xs text-[#434654]">
                        {expiryHours === 1 ? '1 heure' : expiryHours === 24 ? '24 heures' : '7 jours'}
                      </div>
                   </div>
                   <div className="text-[#0052cc] font-bold text-sm bg-[#dae2ff] px-3 py-1 rounded-lg">Modifier</div>
                </div>

                <div className="space-y-2">
                  <div 
                    onClick={() => setShowPasswordInput(!showPasswordInput)}
                    className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-white/50 shadow-soft cursor-pointer group hover:bg-[#dae2ff]/20 transition-all"
                  >
                    <div className="w-12 h-12 bg-[#eceef0] rounded-xl flex-center text-[#434654] group-hover:bg-[#003d9b] group-hover:text-white transition-all">
                        <Lock size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="text-lg font-headline font-bold text-[#191c1e]">{t('share_pwd')}</div>
                        <div className="text-xs text-[#434654]">
                          {password ? 'Mot de passe défini' : t('share_pwd_desc')}
                        </div>
                    </div>
                    <ChevronRight size={18} className={`text-[#eceef0] transition-transform ${showPasswordInput ? 'rotate-90' : ''}`} />
                  </div>

                  {showPasswordInput && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-2"
                    >
                      <div className="relative">
                        <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#434654]" />
                        <input 
                          type="text"
                          placeholder="Définir un mot de passe..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white border border-[#eceef0] rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#003d9b]"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Generated Link section */}
              {generatedLink && (
                <div className="space-y-3">
                  <h3 className="font-headline font-bold text-[#434654] text-[10px] uppercase tracking-widest px-2">{t('copy')}</h3>
                  <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-[#003d9b]/20 shadow-soft">
                    <Link size={20} className="text-[#003d9b]" />
                    <div className="flex-1 text-sm font-body text-[#434654] truncate italic">
                        {generatedLink}
                    </div>
                    <button 
                      onClick={handleCopy}
                      className={`flex items-center gap-2 font-headline font-bold text-sm px-4 py-2 rounded-xl transition-all ${copied ? 'bg-[#004e33] text-white' : 'bg-[#dae2ff] text-[#0052cc] active:scale-95'}`}
                    >
                        {copied ? <Check size={16} /> : null}
                        {copied ? 'Copié' : t('copy')}
                    </button>
                  </div>
                </div>
              )}

              <button 
                onClick={onClose}
                className="w-full bg-[#eceef0] p-5 rounded-2xl text-[#191c1e] font-headline font-bold active:scale-[0.98] transition-all"
              >
                 {t('close')}
              </button>
            </div>

            <div className="h-8" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default QuickShareModal
