import React, { useState } from 'react'
import { useApp, getDocStatus, formatExpiry } from '../store/AppContext'
import { ShieldAlert, AlertTriangle, ChevronRight, Phone, Heart, Activity, FileText, Download, Share2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import BottomSheet from '../components/BottomSheet'

const EmergencyPage = ({ isOpen, onClose }) => {
  const { documents } = useApp()
  const emergencyDocs = documents.filter(d => d.isEmergency)
  const [selectedDoc, setSelectedDoc] = useState(null)

  console.log("DEBUG: EmergencyPage render, isOpen =", isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" style={{ zIndex: 2000, background: 'var(--c-danger)', display: 'flex' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="emergency-container"
            style={{ width: '100%', height: '100%', padding: '20px', overflowY: 'auto', position: 'relative' }}
          >
            {/* Header Urgence */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, marginTop: 20 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="pulse-slow" style={{ width: 48, height: 48, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-danger)' }}>
                    <ShieldAlert size={28} />
                  </div>
                  <div>
                    <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>Mode Urgence</h1>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>Accès critique immédiat</p>
                  </div>
               </div>
               <button onClick={onClose} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={24} />
               </button>
            </div>

            {/* Contacts d'Urgence */}
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 'var(--r-xl)', padding: 20, marginBottom: 24, border: '1px solid rgba(255,255,255,0.2)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'white' }}>
                  <Heart size={18} />
                  <h2 className="title-xs" style={{ color: 'white' }}>Contacts Prioritaires</h2>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                     <div>
                        <div style={{ fontWeight: 700 }}>Samira (Épouse)</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>+33 6 12 34 56 78</div>
                     </div>
                     <a href="tel:+33612345678" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--c-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Phone size={18} />
                     </a>
                  </div>
               </div>
            </div>

            {/* Documents d'Urgence */}
            <div className="space-y-3">
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'white' }}>
                  <FileText size={18} />
                  <h2 className="title-xs" style={{ color: 'white' }}>Documents de Secours ({emergencyDocs.length})</h2>
               </div>
               
               {emergencyDocs.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--r-lg)', border: '1.5px dashed rgba(255,255,255,0.3)' }}>
                    <AlertTriangle size={32} color="white" style={{ marginBottom: 12, opacity: 0.6 }} />
                    <p style={{ color: 'white', fontSize: '0.9rem', opacity: 0.8 }}>Aucun document marqué "Urgence". Ajoutez-en depuis votre bibliothèque.</p>
                 </div>
               ) : (
                 emergencyDocs.map(doc => (
                   <div 
                     key={doc.id} 
                     onClick={() => setSelectedDoc(doc)}
                     style={{ background: 'white', borderRadius: 'var(--r-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                   >
                      <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-primary)' }}>
                         <FileText size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                         <div className="title-xs">{doc.title}</div>
                         <div className="body-xs" style={{ opacity: 0.6 }}>{doc.type}</div>
                      </div>
                      <ChevronRight size={20} color="var(--c-text-muted)" />
                   </div>
                 ))
               )}
            </div>

            {/* Pied de page Info Santé */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 'var(--r-lg)', marginTop: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
               <Activity size={24} color="white" />
               <div style={{ color: 'white' }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>Données Médicales</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Groupe O+ · Allergie Pénicilline</div>
               </div>
            </div>

            {/* Modal Détail en Urgence */}
            <BottomSheet isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} height="auto">
               {selectedDoc && (
                 <div className="modal-body" style={{ paddingBottom: 40 }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                       <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--c-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--c-primary)' }}>
                          <FileText size={32} />
                       </div>
                       <h2 className="title-md">{selectedDoc.title}</h2>
                       <p className="body-sm">{selectedDoc.type}</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 12 }}>
                       <button className="btn-primary" style={{ flex: 1, height: 50 }}>
                          <Download size={20} /> Télécharger
                       </button>
                       <button className="btn-secondary" style={{ flex: 1, height: 50 }}>
                          <Share2 size={20} /> Partager
                       </button>
                    </div>
                    <button className="btn-secondary w-full mt-4" onClick={() => setSelectedDoc(null)}>Fermer</button>
                 </div>
               )}
            </BottomSheet>

            <style>{`
              .pulse-slow {
                animation: pulse-border 3s infinite;
              }
              @keyframes pulse-border {
                0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
                70% { box-shadow: 0 0 0 15px rgba(255,255,255,0); }
                100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
              }
            `}</style>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default EmergencyPage
