import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, FileText, UploadCloud, ChevronRight } from 'lucide-react'

const AddDocumentModal = ({ isOpen, onClose, onScanResult, onImportClick, onManualClick }) => {
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
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 200
            }}
          />
          
          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '430px',
              maxHeight: '90vh',
              background: '#f7f9fb',
              borderRadius: '2.5rem 2.5rem 0 0',
              zIndex: 201,
              boxShadow: '0 -8px 32px rgba(0, 61, 155, 0.15)',
              overflow: 'hidden',
              paddingBottom: 'safe-area-inset-bottom'
            }}
          >
            {/* Header / Grabber */}
            <div style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
              <div style={{ width: '48px', height: '6px', background: '#eceef0', borderRadius: '999px', margin: '0 auto 24px' }} />
              <button 
                onClick={onClose}
                style={{
                  position: 'absolute',
                  right: '24px',
                  top: '24px',
                  padding: '8px',
                  background: '#eceef0',
                  borderRadius: '50%',
                  color: '#434654'
                }}
              >
                <X size={20} />
              </button>
              <h2 className="title-lg" style={{ color: '#191c1e' }}>
                Ajouter un document
              </h2>
            </div>

            <div style={{ padding: '0 32px 32px' }}>
              <p style={{ color: '#434654', textAlign: 'center', marginBottom: '24px', fontSize: '0.9rem' }}>
                Choisissez une méthode pour capturer ou importer vos documents importants.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Method Options */}
                <button 
                  onClick={onScanResult}
                  className="action-row"
                  style={{ background: 'white' }}
                >
                  <div className="icon-wrap lg primary">
                    <Camera size={28} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <h3 className="title-md">Scan Intelligent (IA)</h3>
                    <p className="body-sm">Capturez une photo, l'IA s'occupe de tout.</p>
                  </div>
                  <ChevronRight size={20} color="var(--c-border)" />
                </button>

                <button 
                  onClick={onImportClick}
                  className="action-row"
                  style={{ background: 'white' }}
                >
                  <div className="icon-wrap lg primary">
                    <UploadCloud size={28} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <h3 className="title-md">Importer un fichier</h3>
                    <p className="body-sm">PDF, Images (JPEG, PNG) jusqu'à 10MB.</p>
                  </div>
                  <ChevronRight size={20} color="var(--c-border)" />
                </button>
                
                <button 
                  onClick={onManualClick}
                  className="action-row"
                  style={{ background: 'white' }}
                >
                  <div className="icon-wrap lg primary">
                    <FileText size={28} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <h3 className="title-md">Saisie Manuelle</h3>
                    <p className="body-sm">Remplir les informations vous-même.</p>
                  </div>
                  <ChevronRight size={20} color="var(--c-border)" />
                </button>
              </div>
            </div>

            {/* Bottom Safe Area Padding */}
            <div style={{ height: '40px' }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AddDocumentModal
