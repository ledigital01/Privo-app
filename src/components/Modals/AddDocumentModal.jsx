import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, FileText, UploadCloud, ChevronRight } from 'lucide-react'

const AddDocumentModal = ({ isOpen, onClose, onScanResult }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-[#f7f9fb] rounded-t-[2.5rem] z-[101] shadow-2xl overflow-hidden"
          >
            {/* Header / Grabber */}
            <div className="p-6 pb-2 text-center relative">
              <div className="w-12 h-1.5 bg-[#eceef0] rounded-full mx-auto mb-6" />
              <button 
                onClick={onClose}
                className="absolute right-6 top-6 p-2 bg-[#eceef0] rounded-full text-[#434654]"
              >
                <X size={20} />
              </button>
              <h2 className="font-headline text-2xl font-extrabold text-[#191c1e]">
                Ajouter un document
              </h2>
            </div>

            <div className="p-8 space-y-4">
              <p className="text-[#434654] text-center mb-6">
                Choisissez une méthode pour capturer ou importer vos documents importants.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {/* Method Options */}
                <button 
                  onClick={onScanResult}
                  className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-transparent hover:border-[#003d9b]/20 active:scale-95 transition-all group"
                >
                  <div className="w-14 h-14 bg-[#dae2ff] flex-center rounded-xl text-[#003d9b] group-hover:bg-[#003d9b] group-hover:text-white transition-colors">
                    <Camera size={28} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-headline font-bold text-lg">Scan Intelligent (IA)</h3>
                    <p className="text-sm text-[#434654]">Capturez une photo, l'IA s'occupe de tout.</p>
                  </div>
                  <ChevronRight size={20} className="text-[#eceef0] group-hover:text-[#003d9b] transition-colors" />
                </button>

                <button className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-transparent hover:border-[#003d9b]/20 active:scale-95 transition-all group">
                  <div className="w-14 h-14 bg-[#dae2ff] flex-center rounded-xl text-[#003d9b] group-hover:bg-[#003d9b] group-hover:text-white transition-colors">
                    <UploadCloud size={28} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-headline font-bold text-lg">Importer un fichier</h3>
                    <p className="text-sm text-[#434654]">PDF, Images (JPEG, PNG) jusqu'à 10MB.</p>
                  </div>
                  <ChevronRight size={20} className="text-[#eceef0] group-hover:text-[#003d9b] transition-colors" />
                </button>
                
                <button className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-transparent hover:border-[#003d9b]/20 active:scale-95 transition-all group">
                  <div className="w-14 h-14 bg-[#dae2ff] flex-center rounded-xl text-[#003d9b] group-hover:bg-[#003d9b] group-hover:text-white transition-colors">
                    <FileText size={28} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-headline font-bold text-lg">Saisie Manuelle</h3>
                    <p className="text-sm text-[#434654]">Remplir les informations vous-même.</p>
                  </div>
                  <ChevronRight size={20} className="text-[#eceef0] group-hover:text-[#003d9b] transition-colors" />
                </button>
              </div>

            </div>

            {/* Bottom Safe Area Padding */}
            <div className="h-12" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AddDocumentModal
