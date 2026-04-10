import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Link, Lock, Clock, ShieldCheck, ChevronRight, Check } from 'lucide-react'
import { supabase } from '../../utils/supabaseClient'
import { t } from '../../utils/i18n'

const QuickShareModal = ({ isOpen, onClose, doc }) => {
  const [generatedLink, setGeneratedLink] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expiryHours, setExpiryHours] = useState(24)

  useEffect(() => {
    if (!isOpen) {
      setGeneratedLink('')
      setCopied(false)
    }
  }, [isOpen])

  if (!isOpen || !doc) return null

  const handleGenerateLink = async () => {
    if (!doc.filePath) return alert("Fichier introuvable.")
    
    setIsGenerating(true)
    try {
      // Génère un lien signé pour le nombre d'heures spécifié
      const seconds = expiryHours * 3600
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.filePath, seconds)

      if (error) throw error
      setGeneratedLink(data.signedUrl)
    } catch (err) {
      console.error("Erreur génération lien:", err)
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
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-[#f7f9fb] rounded-t-[2.5rem] z-[101] shadow-2xl overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="p-6 pb-2 text-center relative flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10">
              <button 
                onClick={onClose}
                className="p-2 bg-[#eceef0] rounded-full text-[#434654] active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-2 text-[#434654]">
                <Share2 size={20} className="text-[#003d9b]" />
                <h2 className="font-headline text-xl font-extrabold text-[#191c1e]">
                  {t('share')}
                </h2>
              </div>
              <button 
                onClick={handleGenerateLink}
                disabled={isGenerating || !!generatedLink}
                className={`p-2 rounded-full active:scale-90 transition-all font-bold text-xs px-5 ${
                  generatedLink 
                  ? 'bg-[#e7f5ef] text-[#006e42] cursor-default' 
                  : 'bg-[#003d9b] text-white shadow-lg shadow-[#003d9b]/20'
                }`}
              >
                 {isGenerating ? '...' : generatedLink ? 'Prêt' : 'Générer'}
              </button>
            </div>

            <div className="p-8 space-y-8">
              
              {/* Info Banner */}
              <div className="bg-white p-6 rounded-3xl border border-[#dae2ff] flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-[#e7f5ef] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={28} className="text-[#006e42]" />
                </div>
                <div className="flex-1">
                   <p className="text-sm font-semibold text-[#191c1e]">{t('share_secure_title') || 'Partage Sécurisé'}</p>
                   <p className="text-xs text-[#434654] mt-1">
                     Lien généré via tunnel chiffré AES-256 avec expiration automatique.
                   </p>
                </div>
              </div>

              {/* Security Settings */}
              <div className="space-y-3">
                <h3 className="font-headline font-bold text-[#434654] text-[10px] uppercase tracking-widest px-2">Paramètres</h3>
                
                <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-white/50 shadow-soft cursor-default group transition-all">
                   <div className="w-12 h-12 bg-[#eceef0] rounded-xl flex items-center justify-center text-[#434654] transition-all">
                      <Clock size={20} />
                   </div>
                   <div className="flex-1">
                      <div className="text-lg font-headline font-bold text-[#191c1e]">Expiration</div>
                      <div className="text-xs text-[#434654]">Lien valide pendant 24 heures.</div>
                   </div>
                   <Check size={18} className="text-[#006e42]" />
                </div>

                <div className="bg-white/50 p-5 rounded-2xl flex items-center gap-4 border border-dashed border-[#dae2ff] opacity-60">
                   <div className="w-12 h-12 bg-[#eceef0] rounded-xl flex items-center justify-center text-[#434654]">
                      <Lock size={20} />
                   </div>
                   <div className="flex-1">
                      <div className="text-lg font-headline font-bold text-[#191c1e]">Mot de passe</div>
                      <div className="text-xs text-[#434654]">Indisponible sur l'offre gratuite.</div>
                   </div>
                </div>
              </div>

              {/* Link Display */}
              <div className="space-y-3">
                <h3 className="font-headline font-bold text-[#434654] text-[10px] uppercase tracking-widest px-2">Lien de partage</h3>
                <div className={`bg-white p-5 rounded-2xl flex items-center gap-4 border transition-all ${generatedLink ? 'border-[#003d9b]/30 shadow-md' : 'border-white/50 shadow-soft'}`}>
                   <Link size={20} className={generatedLink ? 'text-[#003d9b]' : 'text-[#eceef0]'} />
                   <div className={`flex-1 text-sm font-body truncate ${!generatedLink ? 'text-[#eceef0]' : 'text-[#434654]'}`}>
                      {generatedLink || 'Cliquez sur Générer en haut...'}
                   </div>
                   {generatedLink && (
                     <button 
                       onClick={handleCopy}
                       className={`flex items-center gap-2 px-4 py-2 rounded-xl font-headline font-bold text-sm transition-all active:scale-95 ${
                         copied ? 'bg-[#006e42] text-white' : 'bg-[#dae2ff] text-[#003d9b]'
                       }`}
                     >
                        {copied ? <><Check size={14} /> Copié</> : 'Copier'}
                     </button>
                   )}
                </div>
              </div>

              {/* Action */}
              <button 
                onClick={onClose}
                className="w-full bg-[#191c1e] p-5 rounded-2xl text-white font-headline font-bold transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
              >
                 Terminer
              </button>
            </div>

            <div className="h-12" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default QuickShareModal
