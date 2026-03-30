import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import MainLayout from './components/Navigation/MainLayout'

// Pages
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import DocumentDetail from './pages/DocumentDetail'

// Modals
import AddDocumentModal from './components/Modals/AddDocumentModal'
import IAScanResultModal from './components/Modals/IAScanResultModal'
import QuickShareModal from './components/Modals/QuickShareModal'

function AppContent() {
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState(null) // 'ADD', 'IA_RESULT', 'SHARE'
  const [selectedDoc, setSelectedDoc] = useState(null)

  // Navigation handlers
  const handleDocClick = (doc) => {
    setSelectedDoc(doc)
    navigate('/document-detail')
  }

  const handleBack = () => {
    navigate(-1)
  }

  // Modal handlers
  const openModal = (type) => setActiveModal(type)
  const closeModal = () => setActiveModal(null)

  const handleScanResult = () => {
    // Simulate IA scan taking time
    closeModal()
    setTimeout(() => {
      openModal('IA_RESULT')
    }, 500)
  }

  const handleConfirmSave = () => {
    // Finalize save and go back home
    closeModal()
    navigate('/')
  }

  return (
    <>
      <MainLayout onAddClick={() => openModal('ADD')}>
        <Routes>
          <Route path="/" element={<Dashboard onAddClick={() => openModal('ADD')} />} />
          <Route path="/documents" element={<Library onDocClick={handleDocClick} />} />
          <Route 
            path="/document-detail" 
            element={
              <DocumentDetail 
                doc={selectedDoc} 
                onBack={handleBack} 
                onShare={() => openModal('SHARE')}
                onSummary={() => alert('Résumé IA en cours...')}
                onDelete={() => alert('Confirmation de suppression...')}
              />
            } 
          />
          <Route path="/profile" element={<div className="flex-center h-[50vh] font-headline font-bold text-[#434654]">Page Profil en construction...</div>} />
          <Route path="/notifications" element={<div className="flex-center h-[50vh] font-headline font-bold text-[#434654]">Page Notifications en construction...</div>} />
        </Routes>
      </MainLayout>

      {/* Global Modals overlay */}
      <AddDocumentModal 
        isOpen={activeModal === 'ADD'} 
        onClose={closeModal} 
        onScanResult={handleScanResult}
      />
      
      <IAScanResultModal 
        isOpen={activeModal === 'IA_RESULT'} 
        onClose={closeModal} 
        onConfirm={handleConfirmSave}
      />

      <QuickShareModal 
        isOpen={activeModal === 'SHARE'} 
        onClose={closeModal} 
        doc={selectedDoc}
      />
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
