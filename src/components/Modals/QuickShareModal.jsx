import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Link, Lock, Clock, ShieldCheck, ChevronRight } from 'lucide-react'

const QuickShareModal = ({ isOpen, onClose, doc }) => {
  if (!isOpen) return null

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
            {/* Header / Grabber */}
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
                  Partage Rapide
                </h2>
              </div>
              <button className="p-2 bg-[#dae2ff] text-[#003d9b] rounded-full active:scale-90 transition-all font-bold text-xs px-4">
                 Générer
              </button>
            </div>

            <div className="p-8 space-y-8">
              
              <div className="bg-[#dae2ff]/50 p-6 rounded-3xl border border-[#dae2ff] flex items-center gap-4">
                <ShieldCheck size={32} className="text-[#004e33]" />
                <div className="flex-1">
                   <p className="text-sm font-body text-[#434654] leading-relaxed">
                     Le lien de partage sera chiffré de bout en bout et expirera automatiquement.
                   </p>
                </div>
              </div>

              {/* Share Options List */}
              <div className="space-y-3">
                <h3 className="font-headline font-bold text-[#434654] text-[10px] uppercase tracking-widest px-2">Paramètres de sécurité</h3>
                
                <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-white/50 shadow-soft cursor-pointer group hover:bg-[#dae2ff]/20 transition-all">
                   <div className="w-12 h-12 bg-[#eceef0] rounded-xl flex-center text-[#434654] group-hover:bg-[#003d9b] group-hover:text-white transition-all">
                      <Clock size={20} />
                   </div>
                   <div className="flex-1">
                      <div className="text-lg font-headline font-bold text-[#191c1e]">Expiration</div>
                      <div className="text-xs text-[#434654]">Le lien expirera dans 24 heures.</div>
                   </div>
                   <ChevronRight size={18} className="text-[#eceef0] group-hover:translate-x-1" />
                </div>

                <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-white/50 shadow-soft cursor-pointer group hover:bg-[#dae2ff]/20 transition-all">
                   <div className="w-12 h-12 bg-[#eceef0] rounded-xl flex-center text-[#434654] group-hover:bg-[#003d9b] group-hover:text-white transition-all">
                      <Lock size={20} />
                   </div>
                   <div className="flex-1">
                      <div className="text-lg font-headline font-bold text-[#191c1e]">Mot de passe</div>
                      <div className="text-xs text-[#434654]">Ajoutez une couche de protection (facultatif).</div>
                   </div>
                   <ChevronRight size={18} className="text-[#eceef0] group-hover:translate-x-1" />
                </div>
              </div>

              {/* Direct Links section */}
              <div className="space-y-3">
                <h3 className="font-headline font-bold text-[#434654] text-[10px] uppercase tracking-widest px-2">Copier le lien</h3>
                <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-white/50 shadow-soft">
                   <Link size={20} className="text-[#003d9b]" />
                   <div className="flex-1 text-sm font-body text-[#434654] truncate">
                      https://digisafe.sh/s/a7f82b9...
                   </div>
                   <button className="text-[#0052cc] font-headline font-bold text-sm bg-[#dae2ff] px-4 py-2 rounded-xl active:scale-95 transition-all">
                      Copier
                   </button>
                </div>
              </div>

              {/* Final Secondary actions */}
              <button 
                onClick={onClose}
                className="w-full bg-[#eceef0] p-5 rounded-2xl text-[#191c1e] font-headline font-bold transition-all"
              >
                 Fermer
              </button>
            </div>

            {/* Bottom Safe Area Padding */}
            <div className="h-12" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default QuickShareModal
