import React, { useState } from 'react'
import { X, Check } from 'lucide-react'
import BottomSheet from '../BottomSheet'
import { useApp } from '../../store/AppContext'
import { t } from '../../utils/i18n'

const CATEGORIES = ['Identité', 'Finance', 'Santé', 'Contrats', 'Études', 'Autre']

const ManualAddModal = ({ isOpen, onClose }) => {
  const { addDocument } = useApp()
  const [form, setForm] = useState({ title: '', type: 'Identité', expiresAt: '', description: '' })
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Le nom du document est requis.'); return }
    
    setIsSaving(true)
    const result = await addDocument({
      title: form.title.trim(),
      type: form.type,
      expiresAt: form.expiresAt || null,
      description: form.description
    }, null)

    if (result.success) {
      setForm({ title: '', type: 'Identité', expiresAt: '', description: '' })
      onClose()
    } else {
      setError(result.error)
    }
    setIsSaving(false)
  }

  if (!isOpen) return null

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height="auto">
        <div className="modal-header">
          <h2 className="title-md">Saisie Manuelle</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {/* Nom */}
          <div>
            <div className="label-xs" style={{ marginBottom: 8 }}>Nom du document *</div>
            <input
              type="text"
              value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setError('') }}
              placeholder="ex: Passeport, Contrat de travail…"
              className="input-field"
            />
            {error && <p style={{ color: 'var(--c-danger)', fontSize: '0.8rem', marginTop: 6 }}>{error}</p>}
          </div>

          {/* Catégorie */}
          <div style={{ marginTop: 16 }}>
            <div className="label-xs" style={{ marginBottom: 8 }}>Catégorie</div>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="input-field"
              style={{ appearance: 'none' }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Date d'expiration */}
          <div style={{ marginTop: 16 }}>
            <div className="label-xs" style={{ marginBottom: 8 }}>Date d'expiration (optionnel)</div>
            <input
              type="date"
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              className="input-field"
            />
          </div>

          {/* Description */}
          <div style={{ marginTop: 16 }}>
            <div className="label-xs" style={{ marginBottom: 8 }}>Notes / Description</div>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ajoutez des détails sur ce document..."
              className="input-field"
              style={{ minHeight: 80, padding: 12 }}
            />
          </div>

          <button className="btn-primary mt-6" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Enregistrement...' : <><Check size={20} /> Enregistrer le document</>}
          </button>
        </div>
    </BottomSheet>
  )
}

export default ManualAddModal
