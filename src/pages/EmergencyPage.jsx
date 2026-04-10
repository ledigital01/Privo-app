import React, { useState, useEffect } from 'react'
import { useApp, getDocStatus, formatExpiry } from '../store/AppContext'
import { ShieldAlert, AlertTriangle, ChevronRight, Phone, Heart, Activity, FileText, Download, Share2, X, Edit3, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../utils/supabaseClient'
import BottomSheet from '../components/BottomSheet'

const EmergencyPage = ({ isOpen, onClose }) => {
  const { documents, authUser } = useApp()
  const emergencyDocs = documents.filter(d => d.isEmergency)
  const [selectedDoc, setSelectedDoc] = useState(null)
  
  // États dynamiques pour les infos vitales
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [medicalInfo, setMedicalInfo] = useState('Groupe O+ · Allergie Pénicilline')
  const [emergencyContact, setEmergencyContact] = useState({ name: 'Samira (Épouse)', phone: '+33 6 12 34 56 78' })

  // Charger les infos depuis le profil au démarrage
  useEffect(() => {
    if (authUser?.id) {
       // On pourrait fetcher ici si on avait des colonnes dédiées, 
       // mais on va simuler le dynamisme avec le localStorage pour le test utilisateur immédiat
       const savedContact = localStorage.getItem(`emergency_contact_${authUser.id}`)
       const savedMedical = localStorage.getItem(`medical_info_${authUser.id}`)
       if (savedContact) setEmergencyContact(JSON.parse(savedContact))
       if (savedMedical) setMedicalInfo(savedMedical)
    }
  }, [authUser])

  const handleSaveInfo = () => {
    if (authUser?.id) {
      localStorage.setItem(`emergency_contact_${authUser.id}`, JSON.stringify(emergencyContact))
      localStorage.setItem(`medical_info_${authUser.id}`, medicalInfo)
    }
    setIsEditingInfo(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay" 
          style={{ zIndex: 2000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex' }}
        >
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="emergency-container"
            style={{ 
              width: '100%', 
              height: '100%', 
              background: '#FFFFFF', // FOND BLANC DEMANDÉ
              padding: '0 0 40px', 
              overflowY: 'auto', 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header SOS Premium */}
            <div style={{ 
              background: 'linear-gradient(to bottom, #FFF5F5, #FFFFFF)', 
              padding: '40px 24px 24px', 
              borderBottom: '1px solid #FEE2E2',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="pulse-red" style={{ width: 56, height: 56, borderRadius: 20, background: 'var(--c-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(220, 38, 38, 0.3)' }}>
                      <ShieldAlert size={32} />
                    </div>
                    <div>
                      <h1 style={{ color: 'var(--c-text)', fontSize: '1.6rem', fontWeight: 900, marginBottom: 4 }}>SOS Urgence</h1>
                      <p style={{ color: 'var(--c-danger)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Accès Prioritaire</p>
                    </div>
                  </div>
                  <button onClick={onClose} style={{ width: 44, height: 44, borderRadius: '50%', background: '#F3F4F6', color: '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={24} />
                  </button>
               </div>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Infos Médicales (Dynamique) */}
              <div style={{ background: '#FFF1F2', borderRadius: 'var(--r-xl)', padding: 20, marginBottom: 24, border: '1px solid #FECACA' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--c-danger)' }}>
                       <Activity size={18} />
                       <h2 style={{ fontSize: '0.9rem', fontWeight: 800 }}>DONNÉES VITALES</h2>
                    </div>
                    <button onClick={() => isEditingInfo ? handleSaveInfo() : setIsEditingInfo(true)} style={{ color: 'var(--c-danger)', display: 'flex', alignItems: 'center', gap: 4, background: 'white', padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, border: '1px solid #FECACA' }}>
                       {isEditingInfo ? <><Save size={14} /> Sauver</> : <><Edit3 size={14} /> Modifier</>}
                    </button>
                 </div>
                 
                 {isEditingInfo ? (
                   <textarea 
                     value={medicalInfo}
                     onChange={e => setMedicalInfo(e.target.value)}
                     style={{ width: '100%', background: 'white', border: '1px solid #FECACA', borderRadius: 8, padding: 12, fontSize: '0.9rem', minHeight: 60 }}
                   />
                 ) : (
                   <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991B1B' }}>
                      {medicalInfo}
                   </div>
                 )}
              </div>

              {/* Contacts d'Urgence (Dynamique) */}
              <div style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-xl)', padding: 20, marginBottom: 32 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, color: '#4B5563' }}>
                    <Heart size={18} />
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 800 }}>CONTACT PRIORITAIRE</h2>
                 </div>
                 
                 {isEditingInfo ? (
                   <div className="space-y-2">
                     <input 
                       value={emergencyContact.name} 
                       onChange={e => setEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
                       placeholder="Nom du proche"
                       style={{ width: '100%', padding: '10px', border: '1px solid var(--c-border)', borderRadius: 8 }}
                     />
                     <input 
                       value={emergencyContact.phone} 
                       onChange={e => setEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
                       placeholder="Téléphone"
                       style={{ width: '100%', padding: '10px', border: '1px solid var(--c-border)', borderRadius: 8 }}
                     />
                   </div>
                 ) : (
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                         <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--c-text)' }}>{emergencyContact.name}</div>
                         <div style={{ fontSize: '0.9rem', color: 'var(--c-text-muted)', marginTop: 2 }}>{emergencyContact.phone}</div>
                      </div>
                      <a href={`tel:${emergencyContact.phone}`} style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--c-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)' }}>
                         <Phone size={22} />
                      </a>
                   </div>
                 )}
              </div>

              {/* Documents d'Urgence (Dynamique) */}
              <div className="space-y-4">
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <FileText size={18} color="var(--c-text-muted)" />
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--c-text)' }}>Documents de Secours ({emergencyDocs.length})</h2>
                 </div>
                 
                 {emergencyDocs.length === 0 ? (
                   <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--c-bg)', borderRadius: 'var(--r-xl)', border: '2px dashed var(--c-border)' }}>
                      <AlertTriangle size={32} color="var(--c-text-muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
                      <p style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem' }}>Aucun document marqué "Urgence". Ajoutez-les depuis votre bibliothèque.</p>
                   </div>
                 ) : (
                   emergencyDocs.map(doc => (
                     <motion.div 
                       key={doc.id} 
                       whileTap={{ scale: 0.97 }}
                       onClick={() => setSelectedDoc(doc)}
                       style={{ background: 'white', border: '1.5px solid var(--c-border)', borderRadius: 'var(--r-xl)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow-sm)' }}
                     >
                        <div style={{ width: 48, height: 48, borderRadius: 16, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-danger)' }}>
                           <FileText size={24} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                           <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--c-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
                           <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>{doc.type}</div>
                        </div>
                        <ChevronRight size={20} color="#CBD5E1" />
                     </motion.div>
                   ))
                 )}
              </div>
            </div>

            {/* Modal Détail en Urgence */}
            <BottomSheet isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} height="auto">
               {selectedDoc && (
                 <div className="modal-body" style={{ paddingBottom: 40, paddingTop: 20 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                       <div style={{ width: 80, height: 80, borderRadius: 24, background: '#FFF1F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--c-danger)' }}>
                          <FileText size={40} />
                       </div>
                       <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--c-text)' }}>{selectedDoc.title}</h2>
                       <p className="body-sm">{selectedDoc.type}</p>
                    </div>
                    
                    <div className="space-y-3">
                       <button className="btn-primary" style={{ width: '100%', height: 56, background: 'var(--c-primary)', borderRadius: 16, fontSize: '1rem', fontWeight: 800 }}>
                          <Download size={20} /> Télécharger maintenant
                       </button>
                       <button className="btn-secondary" style={{ width: '100%', height: 56, borderRadius: 16, fontSize: '1rem', fontWeight: 800 }}>
                          <Share2 size={20} /> Partager en urgence
                       </button>
                       <button className="btn-secondary" style={{ width: '100%', height: 50, border: 'none' }} onClick={() => setSelectedDoc(null)}>Fermer</button>
                    </div>
                 </div>
               )}
            </BottomSheet>

            <style>{`
              .pulse-red {
                animation: pulse-red-shadow 2s infinite;
              }
              @keyframes pulse-red-shadow {
                0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
                70% { box-shadow: 0 0 0 15px rgba(220, 38, 38, 0); }
                100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EmergencyPage
