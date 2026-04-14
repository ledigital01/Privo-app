import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, FileText, UploadCloud, ChevronRight } from 'lucide-react'

const AddDocumentModal = ({ isOpen, onClose, onFileSelect, onScanRequest }) => {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      onFileSelect(file)
    }
  }

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
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(6px)',
              zIndex: 200
            }}
          />
          
          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%", x: "-50%" }}
            animate={{ y: 0, x: "-50%" }}
            exit={{ y: "100%", x: "-50%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              width: '94%',
              maxWidth: '400px',
              background: 'var(--c-surface)',
              borderRadius: '2rem 2rem 0 0',
              zIndex: 201,
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              paddingBottom: '20px'
            }}
          >
            {/* Header / Grabber */}
            <div style={{ padding: '16px 20px 8px', textAlign: 'center', position: 'relative' }}>
              <div style={{ width: '36px', height: '4px', background: 'var(--c-border)', borderRadius: '999px', margin: '0 auto 16px' }} />
              <button 
                onClick={onClose}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '16px',
                  padding: '6px',
                  background: 'var(--c-surface-2)',
                  borderRadius: '50%',
                  color: 'var(--c-text-muted)'
                }}
              >
                <X size={18} />
              </button>
              <h2 className="title-md" style={{ color: 'var(--c-text)', fontSize: '1.2rem' }}>
                Ajouter un document
              </h2>
            </div>

            <div style={{ padding: '0 20px 20px' }}>
              <p style={{ color: 'var(--c-text-muted)', textAlign: 'center', marginBottom: '20px', fontSize: '0.8rem' }}>
                Choisissez une méthode pour capturer vos fichiers.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Inputs cachés */}
                <input 
                  type="file" 
                  ref={cameraInputRef} 
                  hidden 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleFileChange} 
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  onChange={handleFileChange} 
                />

                {/* Scan Intelligent (IA) */}
                <button 
                  onClick={onScanRequest}
                  className="action-row"
                  style={{ padding: '12px 16px', minHeight: 'auto', background: 'white' }}
                >
                  <div className="icon-wrap md primary" style={{ width: 44, height: 44 }}>
                    <Camera size={22} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div className="title-sm" style={{ fontSize: '0.9rem' }}>Scan Intelligent (IA)</div>
                    <div className="body-sm" style={{ fontSize: '0.7rem' }}>Capturez une photo.</div>
                  </div>
                  <ChevronRight size={18} color="var(--c-border)" />
                </button>

                {/* Importer un fichier */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="action-row"
                  style={{ padding: '12px 16px', minHeight: 'auto', background: 'white' }}
                >
                  <div className="icon-wrap md primary" style={{ width: 44, height: 44 }}>
                    <UploadCloud size={22} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div className="title-sm" style={{ fontSize: '0.9rem' }}>Importer un fichier</div>
                    <div className="body-sm" style={{ fontSize: '0.7rem' }}>PDF ou Images.</div>
                  </div>
                  <ChevronRight size={18} color="var(--c-border)" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AddDocumentModal
