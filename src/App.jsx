import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import {
  Home, FolderOpen, Plus, User, Bell,
  Shield, Clock, Zap, AlertCircle, ChevronRight,
  Search, Filter, Share2, Download, Trash2, Edit2, ChevronLeft,
  Camera, UploadCloud, FileText, ShieldCheck, Calendar,
  Lock, Link, X, Check, CreditCard, Settings, HelpCircle, LogOut, GraduationCap,
  Sparkles, MessageSquare, Send
} from 'lucide-react'

import { AppProvider, useApp, getDocStatus, formatExpiry } from './store/AppContext'
import SubscriptionPage from './pages/SubscriptionPage'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import './index.css'

/* ================================================================
   ICON MAP — converts stored string → JSX icon
   ================================================================ */
const ICON_MAP = {
  user:   (s) => <User size={s || 22} />,
  file:   (s) => <FileText size={s || 22} />,
  card:   (s) => <CreditCard size={s || 22} />,
  shield: (s) => <Shield size={s || 22} />,
}
const getIcon = (name, size) => (ICON_MAP[name] || ICON_MAP.file)(size)

/* ================================================================
   BOTTOM NAVIGATION
   ================================================================ */
function BottomNav({ onAddClick }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const isActive  = (path) => location.pathname === path

  return (
    <nav className="bottom-nav">
      <button className={`nav-item${isActive('/') ? ' active' : ''}`} onClick={() => navigate('/')}>
        <Home size={22} />Accueil
      </button>
      <button className={`nav-item${isActive('/documents') ? ' active' : ''}`} onClick={() => navigate('/documents')}>
        <FolderOpen size={22} />Docs
      </button>
      <button className="nav-add-btn" onClick={onAddClick} aria-label="Ajouter un document">
        <Plus size={26} strokeWidth={2.5} />
      </button>
      <button className={`nav-item${isActive('/notifications') ? ' active' : ''}`} onClick={() => navigate('/notifications')}>
        <Bell size={22} />Alertes
      </button>
      <button className={`nav-item${isActive('/profile') ? ' active' : ''}`} onClick={() => navigate('/profile')}>
        <User size={22} />Profil
      </button>
    </nav>
  )
}

/* ================================================================
   MODAL — ADD DOCUMENT (real form)
   ================================================================ */
const CATEGORIES = ['Identité', 'Finance', 'Santé', 'Contrats', 'Études', 'Autre']

function AddDocumentModal({ isOpen, onClose, onScanClick }) {
  const { addDocument } = useApp()
  const [step, setStep]       = useState('method') // 'method' | 'form'
  const [form, setForm]       = useState({ title: '', type: 'Identité', expiresAt: '', iconName: 'file' })
  const [error, setError]     = useState('')

  const reset = () => { setStep('method'); setForm({ title: '', type: 'Identité', expiresAt: '', iconName: 'file' }); setError('') }
  const handleClose = () => { reset(); onClose() }

  const handleSubmit = () => {
    if (!form.title.trim()) { setError('Le nom du document est requis.'); return }
    addDocument({
      title:     form.title.trim(),
      type:      form.type,
      expiresAt: form.expiresAt || null,
      iconName:  form.iconName,
    })
    handleClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        {/* STEP: METHOD */}
        {step === 'method' && (
          <>
            <div className="modal-header">
              <h2 className="title-md">Ajouter un document</h2>
              <button className="modal-close-btn" onClick={handleClose}><X size={18} /></button>
            </div>
            <p className="body-sm" style={{ padding: '4px 24px 0' }}>Choisissez une méthode.</p>
            <div className="modal-body">
              <button className="action-row" onClick={() => { onClose(); onScanClick() }}>
                <div className="icon-wrap md primary"><Camera size={24} /></div>
                <div style={{ flex: 1 }}>
                  <div className="action-text">Scan Intelligent (IA)</div>
                  <div className="action-desc">Capturez une photo, l'IA extrait les données.</div>
                </div>
                <ChevronRight size={18} color="var(--c-text-muted)" />
              </button>
              <button className="action-row" onClick={() => setStep('form')}>
                <div className="icon-wrap md primary"><UploadCloud size={24} /></div>
                <div style={{ flex: 1 }}>
                  <div className="action-text">Importer / Saisir</div>
                  <div className="action-desc">Remplissez les informations manuellement.</div>
                </div>
                <ChevronRight size={18} color="var(--c-text-muted)" />
              </button>
            </div>
          </>
        )}

        {/* STEP: FORM */}
        {step === 'form' && (
          <>
            <div className="modal-header">
              <button className="modal-close-btn" onClick={() => setStep('method')}><ChevronLeft size={18} /></button>
              <h2 className="title-md">Nouveau document</h2>
              <button className="modal-close-btn" onClick={handleClose}><X size={18} /></button>
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
                  style={{
                    width: '100%', padding: '14px 16px',
                    background: 'var(--c-surface-2)', border: '1.5px solid var(--c-border)',
                    borderRadius: 'var(--r-md)', fontSize: '0.9rem',
                    color: 'var(--c-text)', fontFamily: 'Inter',
                  }}
                />
                {error && <p style={{ color: 'var(--c-danger)', fontSize: '0.8rem', marginTop: 6 }}>{error}</p>}
              </div>

              {/* Catégorie */}
              <div>
                <div className="label-xs" style={{ marginBottom: 8 }}>Catégorie</div>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{
                    width: '100%', padding: '14px 16px',
                    background: 'var(--c-surface-2)', border: '1.5px solid var(--c-border)',
                    borderRadius: 'var(--r-md)', fontSize: '0.9rem',
                    color: 'var(--c-text)', fontFamily: 'Inter', appearance: 'none',
                  }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Icône */}
              <div>
                <div className="label-xs" style={{ marginBottom: 8 }}>Type d'icône</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[['file', <FileText size={20} />], ['user', <User size={20} />], ['card', <CreditCard size={20} />]].map(([name, icon]) => (
                    <button
                      key={name}
                      onClick={() => setForm(f => ({ ...f, iconName: name }))}
                      style={{
                        flex: 1, padding: '14px', borderRadius: 'var(--r-md)',
                        border: `2px solid ${form.iconName === name ? 'var(--c-primary)' : 'var(--c-border)'}`,
                        background: form.iconName === name ? 'var(--c-primary-soft)' : 'var(--c-surface-2)',
                        color: form.iconName === name ? 'var(--c-primary)' : 'var(--c-text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date d'expiration */}
              <div>
                <div className="label-xs" style={{ marginBottom: 8 }}>Date d'expiration (optionnel)</div>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  style={{
                    width: '100%', padding: '14px 16px',
                    background: 'var(--c-surface-2)', border: '1.5px solid var(--c-border)',
                    borderRadius: 'var(--r-md)', fontSize: '0.9rem',
                    color: 'var(--c-text)', fontFamily: 'Inter',
                  }}
                />
              </div>

              <button className="btn-primary mt-4" onClick={handleSubmit}>
                <Check size={20} /> Enregistrer le document
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   MODAL — EDIT DOCUMENT
   ================================================================ */
function EditDocumentModal({ isOpen, onClose, doc }) {
  const { updateDocument } = useApp()
  const [form, setForm] = useState({ title: '', type: 'Identité', expiresAt: '', iconName: 'file' })
  const [error, setError] = useState('')

  // Sync form with doc when opened
  React.useEffect(() => {
    if (doc) {
      setForm({
        title: doc.title,
        type: doc.type,
        expiresAt: doc.expiresAt || '',
        iconName: doc.iconName || 'file'
      })
    }
  }, [doc, isOpen])

  const handleSubmit = () => {
    if (!form.title.trim()) { setError('Le nom du document est requis.'); return }
    updateDocument(doc.id, {
      title: form.title.trim(),
      type: form.type,
      expiresAt: form.expiresAt || null,
      iconName: form.iconName,
    })
    onClose()
  }

  if (!isOpen || !doc) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <h2 className="title-md">Modifier le document</h2>
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
              style={{
                width: '100%', padding: '14px 16px',
                background: 'var(--c-surface-2)', border: '1.5px solid var(--c-border)',
                borderRadius: 'var(--r-md)', fontSize: '0.9rem',
                color: 'var(--c-text)', fontFamily: 'Inter',
              }}
            />
            {error && <p style={{ color: 'var(--c-danger)', fontSize: '0.8rem', marginTop: 6 }}>{error}</p>}
          </div>

          {/* Catégorie */}
          <div>
            <div className="label-xs" style={{ marginBottom: 8 }}>Catégorie</div>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              style={{
                width: '100%', padding: '14px 16px',
                background: 'var(--c-surface-2)', border: '1.5px solid var(--c-border)',
                borderRadius: 'var(--r-md)', fontSize: '0.9rem',
                color: 'var(--c-text)', fontFamily: 'Inter', appearance: 'none',
              }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Date d'expiration */}
          <div>
            <div className="label-xs" style={{ marginBottom: 8 }}>Date d'expiration (optionnel)</div>
            <input
              type="date"
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              style={{
                width: '100%', padding: '14px 16px',
                background: 'var(--c-surface-2)', border: '1.5px solid var(--c-border)',
                borderRadius: 'var(--r-md)', fontSize: '0.9rem',
                color: 'var(--c-text)', fontFamily: 'Inter',
              }}
            />
          </div>

          <button className="btn-primary mt-4" onClick={handleSubmit}>
            <Check size={20} /> Appliquer les modifications
          </button>
        </div>
      </div>
    </div>
  )
}


/* ================================================================
   MODAL — IA SCAN (saves a real document)
   ================================================================ */
function IAScanModal({ isOpen, onClose }) {
  const { addDocument } = useApp()
  const [done, setDone] = useState(false)

  const handleConfirm = () => {
    addDocument({
      title: 'Passeport Français',
      type: 'Identité',
      expiresAt: '2029-10-12',
      iconName: 'user',
    })
    setDone(true)
    setTimeout(() => { setDone(false); onClose() }, 1500)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={20} color="var(--c-primary-mid)" />
            <h2 className="title-md">Résultat IA</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {done ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--c-success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={36} color="var(--c-success)" />
              </div>
              <p className="title-sm">Document enregistré !</p>
            </div>
          ) : (
            <>
              <div className="doc-preview" style={{ marginBottom: 4 }}>
                <div className="icon-wrap lg primary"><User size={30} /></div>
                <span className="label-xs">Aperçu du scan</span>
                <div className="scan-line" />
              </div>
              <div className="label-xs" style={{ paddingLeft: 4, marginTop: 8 }}>Données extraites</div>
              {[
                { icon: <User size={18} color="var(--c-primary-mid)" />, label: 'Nom', value: 'Passeport Français' },
                { icon: <FileText size={18} color="var(--c-primary-mid)" />, label: 'Catégorie', value: 'Identité' },
                { icon: <Calendar size={18} color="var(--c-warn)" />, label: 'Expiration', value: '12 Oct. 2029' },
              ].map((row, i) => (
                <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                  {row.icon}
                  <div>
                    <div className="label-xs">{row.label}</div>
                    <div className="title-sm">{row.value}</div>
                  </div>
                </div>
              ))}
              <button className="btn-primary mt-4" onClick={handleConfirm}>
                <Check size={20} /> Enregistrer le document
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* Petit CheckCircle inline */
function CheckCircle({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

/* ================================================================
   MODAL — DELETE CONFIRMATION
   ================================================================ */
function DeleteModal({ isOpen, doc, onClose, onConfirm }) {
  if (!isOpen || !doc) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '40vh' }}>
        <div className="modal-handle" />
        <div className="modal-body" style={{ paddingTop: 24, alignItems: 'center', textAlign: 'center', gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--c-danger-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Trash2 size={28} color="var(--c-danger)" />
          </div>
          <div>
            <p className="title-sm">Supprimer ce document ?</p>
            <p className="body-sm" style={{ marginTop: 6 }}>«&nbsp;{doc.title}&nbsp;» sera définitivement supprimé.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Annuler</button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1, padding: '13px 0', borderRadius: 'var(--r-lg)',
                background: 'var(--c-danger)', color: 'white',
                fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.9rem',
                border: 'none', cursor: 'pointer',
              }}
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   MODAL — QUICK SHARE
   ================================================================ */
function QuickShareModal({ isOpen, onClose }) {
  if (!isOpen) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Share2 size={20} color="var(--c-primary)" />
            <h2 className="title-md">Partage rapide</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="insight-card" style={{ background: 'var(--c-primary-soft)', border: 'none', gap: 12 }}>
            <ShieldCheck size={22} color="var(--c-primary)" style={{ flexShrink: 0 }} />
            <p className="body-sm" style={{ color: 'var(--c-primary)' }}>Lien chiffré de bout en bout. Expiration automatique garantie.</p>
          </div>
          <div className="label-xs" style={{ paddingLeft: 4, marginTop: 8 }}>Paramètres de sécurité</div>
          <button className="action-row">
            <div className="icon-wrap md neutral"><Clock size={22} /></div>
            <div style={{ flex: 1 }}>
              <div className="action-text">Expiration</div>
              <div className="action-desc">Le lien expire dans 24 heures.</div>
            </div>
            <ChevronRight size={18} color="var(--c-text-muted)" />
          </button>
          <button className="action-row">
            <div className="icon-wrap md neutral"><Lock size={22} /></div>
            <div style={{ flex: 1 }}>
              <div className="action-text">Mot de passe</div>
              <div className="action-desc">Protection supplémentaire (facultatif).</div>
            </div>
            <ChevronRight size={18} color="var(--c-text-muted)" />
          </button>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px' }}>
            <Link size={18} color="var(--c-primary-mid)" style={{ flexShrink: 0 }} />
            <span className="body-sm truncate" style={{ flex: 1 }}>https://digisafe.app/s/a7f82b9...</span>
            <button style={{ background: 'var(--c-primary-soft)', color: 'var(--c-primary)', fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.8rem', padding: '7px 14px', borderRadius: 'var(--r-sm)', whiteSpace: 'nowrap' }}>
              Copier
            </button>
          </div>
          <button className="btn-secondary mt-4" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   PAGE — DASHBOARD (dynamic)
   ================================================================ */
function Dashboard({ onAddClick }) {
  const { authUser, stats, expiringDocs, documents } = useApp()
  const navigate = useNavigate()
  const recentDocs = documents.slice(0, 3)
  const isEmpty = documents.length === 0

  const STAT_CARDS = [
    { label: 'Total',    value: stats.total,       icon: <FolderOpen size={20} />, type: 'primary' },
    { label: 'Expirant', value: stats.expiringSoon, icon: <Clock size={20} />,      type: stats.expiringSoon > 0 ? 'warn' : 'success' },
    { label: 'Récents',  value: stats.recent,       icon: <Zap size={20} />,        type: 'success' },
  ]

  return (
    <div className="page-enter">
      <div className="top-bar">
        <div>
          <div className="hero-greeting">Bienvenue 👋</div>
          <h1 className="hero-title">Bonjour, <span className="accent">{authUser?.name || 'Utilisateur'}</span></h1>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'white', border: '1.5px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <img src="/digisafe_official_logo_1775050111054.png" alt="Privo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      <div className="page-content" style={{ paddingTop: 8 }}>

        {/* Search shortcut */}
        <button
          className="search-bar"
          style={{ marginBottom: 28, width: '100%', textAlign: 'left', cursor: 'pointer' }}
          onClick={() => navigate('/documents')}
        >
          <Search size={18} color="var(--c-primary-mid)" />
          <span style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem' }}>Rechercher dans vos documents…</span>
        </button>

        {/* EMPTY STATE — new user */}
        {isEmpty ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Hero empty card */}
            <div style={{
              background: 'linear-gradient(145deg, var(--c-primary), #0066ff)',
              borderRadius: 'var(--r-2xl)', padding: '32px 24px', textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,61,155,0.3)', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ width: 72, height: 72, borderRadius: 'var(--r-lg)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Shield size={36} color="white" />
              </div>
              <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: 10, position: 'relative', zIndex: 1 }}>
                Votre coffre-fort est prêt 🔐
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 24, position: 'relative', zIndex: 1 }}>
                Ajoutez votre premier document sécurisé. Privo le protège avec un chiffrement AES-256.
              </p>
              <button
                onClick={() => navigate('/documents')}
                style={{ background: 'white', color: 'var(--c-primary)', fontFamily: 'Manrope', fontWeight: 800, fontSize: '0.9rem', padding: '12px 28px', borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}
              >
                <Plus size={18} /> Explorer la bibliothèque
              </button>
            </div>

            {/* Quick actions for new user */}
            <div className="section-header" style={{ marginTop: 8 }}>
              <h2>Par où commencer ?</h2>
            </div>

            {[
              { icon: <User size={22} />,     title: "Ajouter ma pièce d'identité",  desc: 'CNI, passeport, permis de conduire',   color: 'primary' },
              { icon: <FileText size={22} />, title: 'Importer un contrat',           desc: 'Bail, travail, assurance…',             color: 'success' },
              { icon: <CreditCard size={22}/>, title: 'Sécuriser mes finances',       desc: 'Fiches de paie, relevés bancaires',     color: 'warn'    },
              { icon: <GraduationCap size={22}/>, title: 'Dossier étudiant',           desc: 'Diplômes, relevés, attestations',       color: 'primary' },
            ].map((item, i) => (
              <button
                key={i}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                  background: 'var(--c-surface)', borderRadius: 'var(--r-xl)',
                  padding: '18px', border: '1.5px solid var(--c-border)',
                  boxShadow: 'var(--shadow-xs)', textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onClick={onAddClick}
              >
                <div className={`icon-wrap md ${item.color}`}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.95rem', color: 'var(--c-text)' }}>{item.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--c-text-muted)', marginTop: 2 }}>{item.desc}</div>
                </div>
                <ChevronRight size={18} color="var(--c-text-muted)" />
              </button>
            ))}

            {/* Security reassurance */}
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 12, 
              background: 'transparent', borderRadius: 'var(--r-md)', 
              padding: '10px 14px', border: '1px solid var(--c-border)', 
              marginTop: 8, opacity: 0.8
            }}>
              <ShieldCheck size={18} color="var(--c-primary)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.8rem', color: 'var(--c-text)' }}>Données 100% privées et sécurisées</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--c-text-muted)', marginTop: 2 }}>Chiffrement AES-256 · Aucune revente · RGPD</div>
              </div>
            </div>
          </div>

        ) : (
          /* NORMAL STATE — user has documents */
          <>
            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
              {STAT_CARDS.map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className={`icon-wrap sm ${s.type}`} style={{ margin: '0 auto 10px' }}>{s.icon}</div>
                  <div className="value">{s.value}</div>
                  <div className="label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* IA Insights — only if expiring docs */}
            {expiringDocs.length > 0 && (
              <>
                <div className="section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2>Insights IA</h2>
                    <span className="pulse-dot" />
                  </div>
                  <span className="see-all" onClick={() => navigate('/documents')}>Voir tout</span>
                </div>
                <div className="space-y-3" style={{ marginBottom: 28 }}>
                  {expiringDocs.map(doc => (
                    <div className="insight-card" key={doc.id}>
                      <div className="icon-wrap sm warn" style={{ flexShrink: 0 }}><AlertCircle size={20} /></div>
                      <div>
                        <div className="title-sm">Expiration Proche</div>
                        <div className="insight-body">«&nbsp;{doc.title}&nbsp;» expire bientôt. Pensez à le renouveler.</div>
                        <span className="insight-link" onClick={() => navigate('/documents')}>Voir <ChevronRight size={14} /></span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Recent docs */}
            <div className="section-header" style={{ marginBottom: 14 }}>
              <h2>Documents récents</h2>
              <span className="see-all" onClick={() => navigate('/documents')}>Voir tout</span>
            </div>
            <div className="space-y-3" style={{ marginBottom: 28 }}>
              {recentDocs.map(doc => {
                const status = getDocStatus(doc.expiresAt)
                return (
                  <div key={doc.id} className={`doc-card ${status === 'ok' ? '' : status}`} onClick={() => navigate('/documents')}>
                    <div className={`icon-wrap md ${status === 'warn' ? 'warn' : 'primary'}`}>{getIcon(doc.iconName)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="doc-card-title">{doc.title}</div>
                      <div className="doc-card-meta">{doc.type} · {formatExpiry(doc.expiresAt)}</div>
                    </div>
                    <ChevronRight size={18} color="var(--c-text-muted)" style={{ flexShrink: 0 }} />
                  </div>
                )
              })}
            </div>

            {/* Upgrade banner */}
            <div style={{ background: 'linear-gradient(135deg, #0052cc, var(--c-primary))', borderRadius: 'var(--r-xl)', padding: '20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,61,155,0.25)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={24} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Manrope', fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>Passez au plan Pro</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Documents illimités + IA avancée</div>
              </div>
              <button onClick={() => navigate('/subscription')} style={{ background: 'white', color: 'var(--c-primary)', fontFamily: 'Manrope', fontWeight: 800, fontSize: '0.78rem', padding: '8px 14px', borderRadius: 'var(--r-sm)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Voir →
              </button>
            </div>

            {/* Emergency card */}
            <div className="emergency-card">
              <h3>🚨 Mode Urgence</h3>
              <p>Préparez vos documents critiques pour un accès immédiat.</p>
              <button className="btn-white"><Shield size={16} /> Activer l'accès</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   PAGE — LIBRARY (dynamic + real search)
   ================================================================ */
const ALL_CATEGORIES = ['Tous', 'Identité', 'Finance', 'Santé', 'Contrats', 'Études', 'Autre']

function Library({ onDocClick }) {
  const { filteredDocuments, searchQuery, setSearchQuery } = useApp()
  const [cat, setCat] = useState('Tous')

  const displayed = cat === 'Tous'
    ? filteredDocuments
    : filteredDocuments.filter(d => d.type === cat)

  return (
    <div className="page-enter">
      <div className="top-bar">
        <div>
          <h1 className="title-lg">Bibliothèque</h1>
          <p className="body-sm">{displayed.length} document{displayed.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          className="notif-btn"
          onClick={() => alert("Les filtres avancés (date, taille) seront bientôt disponibles dans une prochaine mise à jour ! 🚀")}
          title="Filtres avancés"
        >
          <Filter size={18} />
        </button>
      </div>

      <div className="page-content" style={{ paddingTop: 8 }}>
        {/* Search — real */}
        <div className="search-bar" style={{ marginBottom: 20 }}>
          <Search size={18} color="var(--c-primary-mid)" />
          <input
            type="text"
            placeholder="Rechercher un document…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: 'var(--c-text-muted)', display: 'flex' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 no-scrollbar" style={{ overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
          {ALL_CATEGORIES.map(c => (
            <button key={c} className={`chip${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        {/* Document list */}
        {displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-text-muted)' }}>
            <FolderOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p className="body-sm">Aucun document trouvé.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(doc => {
              const status = getDocStatus(doc.expiresAt)
              return (
                <div key={doc.id} className={`doc-card ${status === 'ok' ? '' : status}`} onClick={() => onDocClick(doc)}>
                  <div className={`icon-wrap md ${status === 'warn' ? 'warn' : status === 'info' ? 'primary' : 'success'}`}>
                    {getIcon(doc.iconName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="doc-card-title">{doc.title}</div>
                    <div className="doc-card-meta">{doc.type} · {formatExpiry(doc.expiresAt)}</div>
                  </div>
                  {status === 'ok' && <ShieldCheck size={16} color="var(--c-success)" style={{ flexShrink: 0 }} />}
                  <ChevronRight size={18} color="var(--c-text-muted)" style={{ flexShrink: 0 }} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   PAGE — DOCUMENT DETAIL (with real delete)
   ================================================================ */
function DocumentDetail({ doc, onBack, onShare, onDeleteRequest, onEditRequest }) {
  if (!doc) return null
  const status = getDocStatus(doc.expiresAt)

  return (
    <div className="page-enter">
      <div className="top-bar">
        <button className="notif-btn" onClick={onBack} style={{ width: 40, height: 40 }}><ChevronLeft size={22} /></button>
        <span className="title-sm">Détail</span>
        <button className="notif-btn" onClick={onEditRequest} style={{ width: 40, height: 40 }}><Edit2 size={18} /></button>
      </div>

      <div className="page-content" style={{ paddingTop: 8 }}>
        <div className="doc-preview card-lg" style={{ marginBottom: 20 }}>
          <div className={`icon-wrap lg ${status === 'warn' ? 'warn' : 'primary'}`}>{getIcon(doc.iconName, 30)}</div>
          <span className="label-xs">Aperçu sécurisé</span>
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            {status === 'ok'
              ? <span className="badge success"><ShieldCheck size={11} /> Sécurisé</span>
              : <span className="badge warn"><AlertCircle size={11} /> Attention</span>
            }
          </div>
        </div>

        <h1 className="title-lg" style={{ marginBottom: 6 }}>{doc.title}</h1>
        <p className="body-sm" style={{ marginBottom: 20 }}>Document · {doc.type}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div className="card">
            <div className="label-xs" style={{ marginBottom: 4 }}>Expiration</div>
            <div className="title-sm">{formatExpiry(doc.expiresAt)}</div>
          </div>
          <div className="card">
            <div className="label-xs" style={{ marginBottom: 4 }}>Catégorie</div>
            <div className="title-sm">{doc.type}</div>
          </div>
        </div>

        <div className="action-grid" style={{ marginBottom: 20 }}>
          <button className="action-btn" onClick={onShare}>
            <div className="icon-wrap md neutral"><Share2 size={22} /></div>Partager
          </button>
          <button className="action-btn">
            <div className="icon-wrap md primary"><Zap size={22} /></div>Résumé IA
          </button>
          <button className="action-btn">
            <div className="icon-wrap md neutral"><Download size={22} /></div>Télécharger
          </button>
          <button className="action-btn danger" onClick={onDeleteRequest}>
            <div className="icon-wrap md danger"><Trash2 size={22} /></div>Supprimer
          </button>
        </div>

        <div className="insight-card" style={{ background: 'var(--c-surface-2)', border: '1.5px solid var(--c-border)' }}>
          <ShieldCheck size={20} color="var(--c-primary)" style={{ flexShrink: 0 }} />
          <p className="body-sm">Protégé par chiffrement AES-256. Accessible uniquement via votre clé biométrique.</p>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   PAGE — PROFILE (dynamic user data)
   ================================================================ */
function ProfilePage() {
  const { authUser, stats, logout } = useApp()
  const navigate = useNavigate()
  const user = authUser || {}
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    // Simulation d'une déconnexion sécurisée (2 secondes)
    await new Promise(r => setTimeout(r, 2000))
    logout()
  }

  const showComingSoon = () => {
    alert("🔐 Cette fonctionnalité de sécurité avancée sera disponible dans la prochaine mise à jour !");
  }

  const MENU = [
    { icon: <CreditCard size={20} />, label: 'Abonnement & Paiements', desc: `Plan actuel : ${user.plan === 'free' ? 'Gratuit' : user.plan === 'pro' ? 'Pro' : 'Business'}`, path: '/subscription', action: null, color: 'primary' },
    { icon: <Shield size={20} />,     label: 'Sécurité',               desc: 'Biométrie, PIN, 2FA',             path: null, action: showComingSoon, color: 'success' },
    { icon: <Settings size={20} />,   label: 'Paramètres',             desc: 'Langue, notifications',           path: null, action: showComingSoon, color: 'neutral' },
    { icon: <HelpCircle size={20} />, label: 'Aide & Support',         desc: "FAQ, contacter l'équipe",         path: null, action: showComingSoon, color: 'neutral' },
    { icon: <LogOut size={20} />,     label: 'Déconnexion',            desc: null,                              path: null, action: handleLogout, color: 'danger'  },
  ]


  if (loggingOut) {
    return (
      <div className="page-enter" style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bg)', textAlign: 'center', padding: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--c-danger-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'pulse 1.5s infinite' }}>
          <LogOut size={40} color="var(--c-danger)" />
        </div>
        <h2 className="title-md">Déconnexion sécurisée</h2>
        <p className="body-sm" style={{ marginTop: 8, opacity: 0.7 }}>Nous fermons votre coffre-fort numérique...</p>
        <div style={{ marginTop: 32, width: 40, height: 40, border: '3px solid var(--c-border)', borderTopColor: 'var(--c-danger)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }


  return (
    <div className="page-enter">
      <div className="top-bar"><h1 className="title-lg">Mon Profil</h1></div>
      <div className="page-content" style={{ paddingTop: 8 }}>

        <div style={{ background: 'linear-gradient(145deg, var(--c-primary), #0066ff)', borderRadius: 'var(--r-2xl)', padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28, boxShadow: '0 8px 28px rgba(0,61,155,0.3)' }}>
          <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.4rem', flexShrink: 0 }}>{user.initials || '?'}</div>
          <div>
            <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>
              {[user.name, user.lastName].filter(Boolean).join(' ') || 'Utilisateur'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>{user.email}</div>
            <span style={{ display: 'inline-block', marginTop: 8, background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 999 }}>
              {user.plan === 'free' ? 'Plan Gratuit' : user.plan === 'pro' ? 'Plan Pro ⚡' : 'Business 👑'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          {[{ v: `${stats.total}/5`, l: 'Documents' }, { v: stats.expiringSoon, l: 'Expirant' }, { v: stats.recent, l: 'Récents' }].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="value" style={{ fontSize: '1.3rem' }}>{s.v}</div>
              <div className="label">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="section-header"><h2>Mon compte</h2></div>
        <div className="space-y-3" style={{ marginBottom: 40 }}>
          {MENU.map((item, i) => (
            <button key={i} onClick={() => item.action ? item.action() : item.path && navigate(item.path)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--c-surface)', borderRadius: 'var(--r-lg)', padding: '16px 18px', border: '1.5px solid var(--c-border)', boxShadow: 'var(--shadow-xs)', cursor: (item.path || item.action) ? 'pointer' : 'default', textAlign: 'left' }}>
              <div className={`icon-wrap sm ${item.color}`}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.95rem', color: item.color === 'danger' ? 'var(--c-danger)' : 'var(--c-text)' }}>{item.label}</div>
                {item.desc && <div style={{ fontSize: '0.78rem', color: 'var(--c-text-muted)', marginTop: 2 }}>{item.desc}</div>}
              </div>
              {item.path && <ChevronRight size={18} color="var(--c-text-muted)" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   APP SHELL
   ================================================================ */
function AppContent() {
  const navigate    = useNavigate()
  const { deleteDocument } = useApp()

  const [modal,       setModal]       = useState(null) // 'ADD' | 'SCAN' | 'SHARE' | 'DELETE'
  const [selectedDoc, setSelectedDoc] = useState(null)

  const handleDocClick = (doc) => { setSelectedDoc(doc); navigate('/detail') }
  const handleScanClick = () => { setTimeout(() => setModal('SCAN'), 200) }

  const handleDeleteRequest = () => setModal('DELETE')
  const handleDeleteConfirm = () => {
    deleteDocument(selectedDoc.id)
    setModal(null)
    navigate('/documents')
  }

  return (
    <>
      <div className="app-shell">
        <div className="page-bg-blur" />
        <Routes>
          <Route path="/"             element={<Dashboard onAddClick={() => setModal('ADD')} />} />
          <Route path="/documents"    element={<Library onDocClick={handleDocClick} />} />
          <Route path="/detail"       element={<DocumentDetail doc={selectedDoc} onBack={() => navigate(-1)} onShare={() => setModal('SHARE')} onDeleteRequest={handleDeleteRequest} onEditRequest={() => setModal('EDIT')} />} />
          <Route path="/notifications" element={<NotificationsPage onDocClick={handleDocClick} />} />
          <Route path="/profile"      element={<ProfilePage />} />
          <Route path="/subscription" element={<SubscriptionPage onBack={() => navigate(-1)} />} />
        </Routes>
        <BottomNav onAddClick={() => setModal('ADD')} />
        <button
          onClick={() => setModal('CHAT')}
          style={{
            position: 'absolute', bottom: 90, right: 20, zIndex: 40,
            width: 56, height: 56, borderRadius: '28px',
            background: 'var(--c-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0, 61, 155, 0.4)',
            cursor: 'pointer', border: 'none'
          }}
        >
          <Sparkles size={24} />
        </button>

      </div>

      <AddDocumentModal  isOpen={modal === 'ADD'}    onClose={() => setModal(null)} onScanClick={handleScanClick} />
      <EditDocumentModal isOpen={modal === 'EDIT'}   onClose={() => setModal(null)} doc={selectedDoc} />
      <IAScanModal       isOpen={modal === 'SCAN'}   onClose={() => setModal(null)} />
      <QuickShareModal   isOpen={modal === 'SHARE'}  onClose={() => setModal(null)} />
      <DeleteModal       isOpen={modal === 'DELETE'} doc={selectedDoc} onClose={() => setModal(null)} onConfirm={handleDeleteConfirm} />
      <AIChatModal       isOpen={modal === 'CHAT'}   onClose={() => setModal(null)} />
    </>
  )
}

/* ================================================================
   MODAL — AI CHAT
   ================================================================ */
function AIChatModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Bonjour ! Je suis l\'assistant IA Privo. Posez-moi une question sur vos documents (ex: "Quand expire mon passeport ?").' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setIsTyping(true)

    // Simulate RAG query
    setTimeout(() => {
      let aiResponse = "Désolé, je ne connais pas encore cette information."
      if (userMsg.toLowerCase().includes('passeport') || userMsg.toLowerCase().includes('expire')) {
        aiResponse = "J'ai trouvé \"Passeport Français\" dans votre coffre. Il expire le 12 Octobre 2029 (dans plus de 3 ans). Tout est en règle !"
      } else if (userMsg.toLowerCase().includes('contrat')) {
        aiResponse = "Je vois que vous avez un contrat de travail à durée indéterminée (CDI) signé en Janvier 2024. Souhaitez-vous un résumé ?"
      }
      setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }])
      setIsTyping(false)
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-handle" />
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} color="var(--c-primary)" />
            <h2 className="title-md">Assistant Privo</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        
        <div className="modal-body no-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ 
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? 'var(--c-primary)' : 'var(--c-surface-2)',
              color: m.role === 'user' ? 'white' : 'var(--c-text)',
              padding: '12px 16px', borderRadius: 'var(--r-md)',
              borderBottomRightRadius: m.role === 'user' ? '4px' : 'var(--r-md)',
              borderBottomLeftRadius: m.role === 'assistant' ? '4px' : 'var(--r-md)',
              maxWidth: '85%', fontSize: '0.9rem', lineHeight: 1.5
            }}>
              {m.text}
            </div>
          ))}
          {isTyping && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--c-surface-2)', padding: '12px 16px', borderRadius: 'var(--r-md)', fontSize: '0.9rem', opacity: 0.6 }}>
              L'IA réfléchit...
            </div>
          )}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--c-border)', display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Demander quelque chose..."
            style={{ 
              flex: 1, background: 'var(--c-surface-2)', border: '1px solid var(--c-border)', 
              borderRadius: '24px', padding: '12px 16px', fontSize: '0.95rem'
            }}
          />
          <button 
            onClick={handleSend}
            style={{ 
              width: 46, height: 46, borderRadius: '23px', background: 'var(--c-primary)', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}
          >
            <Send size={18} style={{ marginLeft: -2 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   PAGE — NOTIFICATIONS (dynamic alerts)
   ================================================================ */
function NotificationsPage({ onDocClick }) {
  const { documents } = useApp()
  const soon = Date.now() + 30 * 24 * 60 * 60 * 1000
  const alerts = documents.filter(d => d.expiresAt && new Date(d.expiresAt).getTime() < soon)

  return (
    <div className="page-enter">
      <div className="top-bar"><h1 className="title-lg">Alertes & Rappels</h1></div>
      <div className="page-content" style={{ paddingTop: 8 }}>
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--c-text-muted)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--c-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Bell size={32} opacity={0.3} />
            </div>
            <p className="title-sm">Tout est en ordre</p>
            <p className="body-sm" style={{ marginTop: 8 }}>Aucun document n'expire dans les 30 prochains jours.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="insight-card" style={{ background: 'var(--c-warn-soft)', border: 'none' }}>
              <AlertCircle size={22} color="var(--c-warn)" />
              <p className="body-sm" style={{ color: 'var(--c-warn)', fontWeight: 600 }}>{alerts.length} document{alerts.length > 1 ? 's' : ''} demande{alerts.length > 1 ? 'nt' : ''} votre attention.</p>
            </div>
            {alerts.map(doc => {
              const status = getDocStatus(doc.expiresAt)
              return (
                <div key={doc.id} className={`doc-card ${status}`} onClick={() => onDocClick(doc)}>
            <div className={`icon-wrap md warn`}><Clock size={22} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="doc-card-title">{doc.title}</div>
                    <div className="doc-card-meta">Expire le : {new Date(doc.expiresAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="badge warn" style={{ fontSize: '0.7rem' }}>{formatExpiry(doc.expiresAt).replace('⚠ ', '')}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   AUTH GUARD — shows Login/Register if not authenticated
   ================================================================ */
function AuthGuard() {
  const { isAuthenticated, profileLoading } = useApp()
  const [authPage, setAuthPage] = useState('login') // 'login' | 'register'

  if (profileLoading) return <div style={{ height: '100dvh', background: 'var(--c-bg)' }} />

  if (!isAuthenticated) {
    return authPage === 'login' 
      ? <LoginPage onGoRegister={() => setAuthPage('register')} />
      : <RegisterPage onGoLogin={() => setAuthPage('login')} />
  }

  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AuthGuard />
    </AppProvider>
  )
}
