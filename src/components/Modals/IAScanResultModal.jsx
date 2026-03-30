import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Edit2, Zap, Calendar, User, FileText, ChevronRight } from 'lucide-react'

const IAScanResultModal = ({ isOpen, onClose, onConfirm }) => {
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
                className="p-2 bg-[#eceef0] rounded-full text-[#434654] active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-2 text-[#003d9b]">
                <Zap size={20} className="fill-[#003d9b]" />
                <h2 className="font-headline text-xl font-extrabold text-[#191c1e]">
                  Résultat IA
                </h2>
              </div>
              <button className="p-2 bg-[#dae2ff] text-[#003d9b] rounded-full active:scale-90 transition-all font-bold text-xs px-4">
                 Modifier
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Document Extract Preview */}
              <div className="bg-white p-2 rounded-[2rem] border border-white/50 shadow-soft relative overflow-hidden aspect-[16/10] flex-center flex-col gap-4">
                 <div className="absolute inset-0 bg-[#003d9b]/5 pointer-events-none" />
                 <div className="w-16 h-16 bg-white/50 backdrop-blur-xl rounded-2xl flex-center text-[#003d9b]">
                   <User size={32} />
                 </div>
                 <div className="text-[10px] font-bold uppercase tracking-widest text-[#434654]">Aperçu du Scan</div>
                 
                 {/* IA scanning animation overlay */}
                 <motion.div 
                   animate={{ top: ["10%", "90%"] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                   className="absolute left-0 right-0 h-0.5 bg-[#0052cc]/50 shadow-[0_0_15px_#0052cc]" 
                 />
              </div>

              {/* Data Extraction Section */}
              <div className="space-y-4">
                <h3 className="font-headline font-bold text-[#434654] text-xs uppercase tracking-widest px-2">Données Extraites</h3>
                
                <div className="space-y-2">
                  <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-white/50 shadow-soft">
                     <User size={20} className="text-[#003d9b]" />
                     <div className="flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#434654]/50">Nom du document</div>
                        <div className="text-lg font-headline font-bold">Passeport Français</div>
                     </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-white/50 shadow-soft">
                     <FileText size={20} className="text-[#003d9b]" />
                     <div className="flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#434654]/50">Catégorie</div>
                        <div className="text-lg font-headline font-bold">Identité</div>
                     </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-white/50 shadow-soft">
                     <Calendar size={20} className="text-[#ba1a1a]" />
                     <div className="flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#434654]/50">Date d'expiration</div>
                        <div className="text-lg font-headline font-bold">12 Oct. 2029</div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button 
                onClick={onConfirm}
                className="w-full bg-gradient-to-r from-[#003d9b] to-[#0052cc] p-5 rounded-2xl text-white font-headline font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
              >
                 <Check size={24} />
                 Enregistrer l'extraction
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

export default IAScanResultModal
