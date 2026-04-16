import React, { useState, useEffect } from 'react'
import {
  Shield, Check, ChevronRight, Star, Zap, Crown,
  Smartphone, CreditCard, Wallet, X, ArrowLeft,
  Lock, CheckCircle, XCircle, ChevronLeft,
  Files, Database, Share2, UserPlus, Trash2, Mail
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { PLANS as PLAN_DEFS } from '../utils/plans'
import { supabase } from '../utils/supabaseClient'

/* ================================================================
   MODAL — PAYMENT METHOD SELECTION (DYNAMIC)
   Steps: method → form → processing → success | fail
   ================================================================ */

// --- Formatage automatique du numéro de carte ---
function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(val) {
  const d = val.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
}

function PaymentModal({ isOpen, onClose, plan }) {
  const [step, setStep] = useState('method') // method | form | processing | success | fail
  const [method, setMethod] = useState(null)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const { updateUserPlan, authUser } = useApp()

  if (!isOpen) return null

  const handleClose = () => {
    setStep('method'); setMethod(null); setFormData({}); setErrors({})
    onClose()
  }

  const METHODS = [
    { id: 'mobile_money', label: 'Mobile Money', desc: 'Orange Money · Wave · MTN MoMo', icon: <Smartphone size={22} />, color: 'warn' },
    { id: 'card', label: 'Carte Bancaire', desc: 'Visa · Mastercard · AMEX', icon: <CreditCard size={22} />, color: 'primary' },
  ]

  // Validation par méthode
  const validate = () => {
    const e = {}
    if (method === 'mobile_money') {
      if (!formData.operator) e.operator = 'Choisissez un opérateur.'
      if (!formData.phone || formData.phone.replace(/\D/g,'').length < 8) e.phone = 'Numéro invalide (min 8 chiffres).'
    }
    if (method === 'card') {
      if (!formData.cardName?.trim()) e.cardName = 'Nom du titulaire requis.'
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g,'').length < 16) e.cardNumber = 'Numéro de carte à 16 chiffres requis.'
      if (!formData.expiry || !/^\d{2}\/\d{2}$/.test(formData.expiry)) e.expiry = 'Format MM/AA requis.'
      if (!formData.cvv || formData.cvv.length < 3) e.cvv = 'CVV à 3 ou 4 chiffres requis.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePay = async () => {
    if (!validate()) return
    setStep('processing')
    
    // Simulation du délai réseau
    await new Promise(r => setTimeout(r, 2500))

    try {
      // Mise à jour du plan
      const result = await updateUserPlan(plan.id)
      if (result.success) {
        setStep('success')
      } else {
        setStep('fail')
      }
    } catch (err) {
      console.error("Payment error:", err)
      setStep('fail')
    }
  }

  const fieldStyle = (key) => ({
    border: `1.5px solid ${errors[key] ? 'var(--c-danger)' : 'var(--c-border)'}`,
    borderRadius: 'var(--r-md)', padding: '12px 14px', width: '100%',
    fontFamily: 'Manrope', fontSize: '0.9rem', background: 'var(--c-surface)',
    color: 'var(--c-text)', outline: 'none', boxSizing: 'border-box'
  })

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, margin: '0 auto' }}>
        <div className="modal-handle" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* ── ÉTAPE 1 : CHOIX DE MÉTHODE ── */}
        {step === 'method' && (
          <>
            <div className="modal-header">
              <div>
                <h2 className="title-md">Finaliser l'abonnement</h2>
                <p className="body-sm" style={{ marginTop: 2, color: 'var(--c-text-muted)' }}>
                  Plan <strong style={{ color: 'var(--c-text)' }}>{plan?.name}</strong> — <strong style={{ color: 'var(--c-primary)' }}>{plan?.displayPrice}</strong>
                </p>
              </div>
              <button className="modal-close-btn" onClick={handleClose}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--c-primary-soft)', borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: 8 }}>
                <Lock size={16} color="var(--c-primary)" />
                <p className="body-xs" style={{ color: 'var(--c-primary)', margin: 0, fontWeight: 600 }}>Paiement 100% sécurisé · SSL · AES-256</p>
              </div>
              <div className="label-xs" style={{ paddingLeft: 4, marginTop: 12, marginBottom: 4 }}>Choisir un moyen de paiement</div>
              {METHODS.map(m => (
                <button key={m.id} className="action-row" onClick={() => { setMethod(m.id); setStep('form') }}>
                  <div className={`icon-wrap md ${m.color}`}>{m.icon}</div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div className="action-text">{m.label}</div>
                    <div className="action-desc">{m.desc}</div>
                  </div>
                  <ChevronRight size={18} color="var(--c-text-muted)" />
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── ÉTAPE 2 : FORMULAIRE ── */}
        {step === 'form' && (
          <>
            <div className="modal-header">
              <button className="notif-btn" onClick={() => { setStep('method'); setErrors({}) }} style={{ width: 36, height: 36 }}>
                <ChevronLeft size={20} />
              </button>
              <h2 className="title-md" style={{ flex: 1, textAlign: 'center' }}>
                {method === 'mobile_money' ? 'Mobile Money' : 'Carte Bancaire'}
              </h2>
              <button className="modal-close-btn" onClick={handleClose}><X size={18} /></button>
            </div>

            <div className="modal-body">
              {/* Récapitulatif */}
              <div style={{ background: 'var(--c-surface-2)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="label-xs" style={{ color: 'var(--c-text-muted)', margin: 0 }}>À payer</p>
                  <p className="title-sm" style={{ margin: 0, color: 'var(--c-primary)' }}>
                    {plan?.displayPrice}
                  </p>
                </div>
                <span className="badge primary" style={{ background: 'var(--c-primary-soft)', color: 'var(--c-primary)' }}>Plan {plan?.name}</span>
              </div>



              {/* MOBILE MONEY */}
              {method === 'mobile_money' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div className="label-xs" style={{ marginBottom: 6 }}>Opérateur</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['Orange Money', 'Wave', 'MTN MoMo'].map(op => (
                        <button key={op} onClick={() => setFormData(p => ({ ...p, operator: op }))}
                          style={{
                            flex: 1, padding: '10px 4px', borderRadius: 'var(--r-md)', border: `1.5px solid ${formData.operator === op ? 'var(--c-primary)' : 'var(--c-border)'}`,
                            background: formData.operator === op ? 'var(--c-primary-soft)' : 'var(--c-surface)',
                            color: formData.operator === op ? 'var(--c-primary)' : 'var(--c-text-muted)',
                            fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer'
                          }}>
                          {op}
                        </button>
                      ))}
                    </div>
                    {errors.operator && <p style={{ color: 'var(--c-danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.operator}</p>}
                  </div>
                  <div>
                    <div className="label-xs" style={{ marginBottom: 6 }}>Numéro de téléphone</div>
                    <input type="tel" placeholder="ex : +221 77 000 00 00" style={fieldStyle('phone')}
                      value={formData.phone || ''} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                    {errors.phone && <p style={{ color: 'var(--c-danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.phone}</p>}
                  </div>
                  <p className="body-xs" style={{ color: 'var(--c-text-muted)', textAlign: 'center' }}>
                    Vous recevrez une notification de confirmation sur ce numéro.
                  </p>
                </div>
              )}

              {/* CARTE BANCAIRE */}
              {method === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div className="label-xs" style={{ marginBottom: 6 }}>Nom du titulaire</div>
                    <input type="text" placeholder="NOM Prénom" style={fieldStyle('cardName')}
                      value={formData.cardName || ''} onChange={e => setFormData(p => ({ ...p, cardName: e.target.value.toUpperCase() }))} />
                    {errors.cardName && <p style={{ color: 'var(--c-danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.cardName}</p>}
                  </div>
                  <div>
                    <div className="label-xs" style={{ marginBottom: 6 }}>Numéro de carte</div>
                    <input type="text" placeholder="0000 0000 0000 0000" style={fieldStyle('cardNumber')} maxLength={19}
                      value={formData.cardNumber || ''} onChange={e => setFormData(p => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))} />
                    {errors.cardNumber && <p style={{ color: 'var(--c-danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.cardNumber}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div className="label-xs" style={{ marginBottom: 6 }}>Expiration</div>
                      <input type="text" placeholder="MM/AA" style={fieldStyle('expiry')} maxLength={5}
                        value={formData.expiry || ''} onChange={e => setFormData(p => ({ ...p, expiry: formatExpiry(e.target.value) }))} />
                      {errors.expiry && <p style={{ color: 'var(--c-danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.expiry}</p>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="label-xs" style={{ marginBottom: 6 }}>CVV</div>
                      <input type="password" placeholder="•••" style={fieldStyle('cvv')} maxLength={4}
                        value={formData.cvv || ''} onChange={e => setFormData(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))} />
                      {errors.cvv && <p style={{ color: 'var(--c-danger)', fontSize: '0.75rem', marginTop: 4 }}>{errors.cvv}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', opacity: 0.5 }}>
                    {['VISA', 'MC', 'AMEX'].map(b => (
                      <span key={b} style={{ fontSize: '0.65rem', fontWeight: 800, border: '1px solid var(--c-border)', padding: '3px 7px', borderRadius: 4 }}>{b}</span>
                    ))}
                  </div>
                </div>
              )}



              <button className="btn-primary" style={{ width: '100%', marginTop: 24 }} onClick={handlePay}>
                <Lock size={16} /> Confirmer et payer
              </button>
            </div>
          </>
        )}

        {/* ── ÉTAPE 3 : TRAITEMENT ── */}
        {step === 'processing' && (
          <div className="modal-body" style={{ paddingTop: 60, paddingBottom: 70, alignItems: 'center', textAlign: 'center', gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: '4px solid var(--c-primary-soft)', borderTopColor: 'var(--c-primary)', animation: 'spin 0.9s linear infinite', margin: '0 auto' }} />
            <div>
              <p className="title-sm">Traitement en cours…</p>
              <p className="body-sm" style={{ color: 'var(--c-text-muted)' }}>Transaction sécurisée. Veuillez patienter.</p>
            </div>
          </div>
        )}

        {/* ── SUCCÈS ── */}
        {step === 'success' && (
          <div className="modal-body" style={{ paddingTop: 50, paddingBottom: 60, alignItems: 'center', textAlign: 'center', gap: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--c-success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <CheckCircle size={44} color="var(--c-success)" />
            </div>
            <div>
              <p className="title-sm" style={{ fontSize: '1.2rem' }}>Paiement validé ! 🎉</p>
              <p className="body-sm" style={{ marginTop: 8, color: 'var(--c-text-muted)' }}>
                Votre plan <strong style={{ color: 'var(--c-text)' }}>{plan?.name}</strong> est maintenant actif.<br />
                Un reçu vous a été envoyé par email.
              </p>
            </div>
            <button className="btn-primary" onClick={handleClose}><Check size={18} /> Accéder à mon nouveau plan</button>
          </div>
        )}

        {/* ── ÉCHEC ── */}
        {step === 'fail' && (
          <div className="modal-body" style={{ paddingTop: 50, paddingBottom: 60, alignItems: 'center', textAlign: 'center', gap: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--c-danger-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <XCircle size={44} color="var(--c-danger)" />
            </div>
            <div>
              <p className="title-sm" style={{ fontSize: '1.2rem' }}>Paiement refusé</p>
              <p className="body-sm" style={{ marginTop: 8, color: 'var(--c-text-muted)' }}>
                Vérifiez vos informations de paiement et réessayez.
              </p>
            </div>
            <button className="btn-primary" onClick={() => setStep('form')}>Réessayer</button>
            <button className="btn-secondary" onClick={handleClose}>Annuler</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   PAGE — SUBSCRIPTION / PRICING
   PRICING CONFIG — Modifier ici pour changer les tarifs
   ================================================================ */
const PRICING_CONFIG = {
  pro: {
    monthly: 3.5,
    yearly: 29,
    monthlyFcfa: 2100,
    yearlyFcfa: 17400,
    yearlySavings: Math.round(3.5 * 12 - 29), // ~13$
    yearlyBadge: '+3 mois offerts',
  },
  business: {
    monthly: 13,
    yearly: 99,
    monthlyFcfa: 7800,
    yearlyFcfa: 59400,
    yearlySavings: Math.round(13 * 12 - 99), // ~57$
    yearlyBadge: 'Économisez 57$',
  }
}

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    icon: <Shield size={28} />,
    color: 'neutral',
    features: [
      '5 documents maximum',
      'Scan manuel uniquement',
      'Stockage 100 Mo',
      'Partage limité (3/mois)',
    ],
    missing: [
      'IA illimitée',
      'Documents illimités',
      'Accès prioritaire',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: <Star size={28} />,
    color: 'primary',
    recommended: true,
    features: [
      '100 documents',
      'Scan IA avancé',
      'Stockage 5 Go',
      'Partage sécurisé illimité',
      "Alertes d'expiration automatiques",
      'Support prioritaire',
    ],
    missing: [],
  },
  {
    id: 'business',
    name: 'Business',
    icon: <Crown size={28} />,
    color: 'warn',
    features: [
      'Documents illimités',
      'IA illimitée + OCR avancé',
      'Stockage 50 Go',
      'Multi-utilisateurs (5 max)',
      'Tableau de bord entreprise',
      "API d'intégration",
      'Support dédié 24/7',
    ],
    missing: [],
  },
]

const FAQS = [
  { q: 'Puis-je résilier à tout moment ?', a: "Oui, sans frais ni engagement. Vous gardez l'accès jusqu'à la fin de la période payée." },
  { q: 'Mes données sont-elles sécurisées ?', a: 'Toutes vos données sont chiffrées AES-256 et hébergées en Europe (RGPD compliant).' },
  { q: 'Quels moyens de paiement sont acceptés ?', a: 'Mobile Money (Orange, Wave, MTN), cartes bancaires Visa/Mastercard, et DigiWallet.' },
]

// Helper — formater le prix affiché selon la période
function getPlanPrice(planId, billing) {
  if (planId === 'free') return { label: 'Gratuit', sub: '' }
  const cfg = PRICING_CONFIG[planId]
  if (!cfg) return { label: 'N/A', sub: '' }
  if (billing === 'yearly') {
    return {
      label: `${cfg.yearly}$ / an`,
      sub: `soit ${(cfg.yearly / 12).toFixed(2)}$ / mois`,
      badge: cfg.yearlyBadge,
      savings: `Économisez ${cfg.yearlySavings}$`,
    }
  }
  return {
    label: `${cfg.monthly}$ / mois`,
    sub: '',
  }
}

export default function SubscriptionPage({ onBack }) {
  const { authUser, documents, stats } = useApp()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [billing, setBilling] = useState('monthly') // 'monthly' | 'yearly'

  // --- TEAM MANAGEMENT STATE ---
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteStatus, setInviteStatus] = useState(null) // { type: 'success'|'error', msg: string }
  const [invitations, setInvitations] = useState([])

  // Charger les invitations existantes
  const fetchInvitations = async () => {
    if (!authUser?.id) return
    const { data } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('owner_id', authUser.id)
      .order('created_at', { ascending: false })
    if (data) setInvitations(data)
  }

  useEffect(() => {
    if (currentPlanId === 'business') fetchInvitations()
  }, [currentPlanId, authUser?.id])

  // Envoyer une invitation
  const handleInvite = async () => {
    // Validation
    if (!inviteEmail.trim()) {
      setInviteStatus({ type: 'error', msg: 'Veuillez saisir une adresse email.' })
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail.trim())) {
      setInviteStatus({ type: 'error', msg: 'Adresse email invalide.' })
      return
    }
    if (inviteEmail.trim().toLowerCase() === authUser?.email?.toLowerCase()) {
      setInviteStatus({ type: 'error', msg: 'Vous ne pouvez pas vous inviter vous-même.' })
      return
    }
    if (invitations.length >= 4) { // 4 invités + 1 propriétaire = 5 max
      setInviteStatus({ type: 'error', msg: 'Limite de 5 membres atteinte.' })
      return
    }
    const alreadyInvited = invitations.some(inv => inv.invitee_email.toLowerCase() === inviteEmail.trim().toLowerCase())
    if (alreadyInvited) {
      setInviteStatus({ type: 'error', msg: 'Cet email a déjà été invité.' })
      return
    }

    setInviteLoading(true)
    setInviteStatus(null)

    const { error } = await supabase
      .from('team_invitations')
      .insert([{ owner_id: authUser.id, invitee_email: inviteEmail.trim().toLowerCase() }])

    setInviteLoading(false)

    if (error) {
      setInviteStatus({ type: 'error', msg: "Erreur lors de l'envoi. Réessayez." })
    } else {
      setInviteStatus({ type: 'success', msg: `Invitation envoyée à ${inviteEmail.trim()} !` })
      setInviteEmail('')
      fetchInvitations()
    }
  }

  // Supprimer une invitation
  const handleRemoveInvite = async (id) => {
    await supabase.from('team_invitations').delete().eq('id', id)
    setInvitations(prev => prev.filter(inv => inv.id !== id))
  }

  // Normaliser l'ID du plan : gérer les alias et la casse
  const rawPlanId = (authUser?.plan || 'free').toLowerCase()
  const currentPlanId = rawPlanId === 'enterprise' ? 'business' : rawPlanId
  const currentPlanDef = PLAN_DEFS[currentPlanId] || PLAN_DEFS['free']
  
  // Stats usage (en attendant les stats backend complètes, on utilise les documents chargés)
  const docCount = documents?.length || 0
  const docLimit = currentPlanDef.maxDocuments
  const docPercent = Math.min(100, (docCount / docLimit) * 100)

  const storageLimit = currentPlanDef.maxStorageMb
  const storageUsed = stats?.storageUsedMb || 0 // Valeur réelle calculée depuis le cloud
  const storagePercent = Math.min(100, (storageUsed / storageLimit) * 100)

  // Fonction pour déterminer la couleur de progression
  const getProgressColor = (percent) => {
    if (percent > 85) return 'var(--c-danger)' // Rouge
    if (percent > 60) return '#f59e0b' // Orange (Amber)
    return 'var(--c-success)' // Vert
  }

  return (
    <>
      <div className="page-enter">
        {/* DEBUG TEMPORAIRE — à retirer après vérification */}
        {process.env.NODE_ENV !== 'production' && (
          <div style={{ background: '#fef9c3', padding: '4px 12px', fontSize: '0.7rem', fontFamily: 'monospace' }}>
            Plan DB brut: <strong>{authUser?.plan || 'non défini'}</strong> → Normalisé: <strong>{currentPlanId}</strong>
          </div>
        )}
        {/* Top bar */}
        <div className="top-bar">
          <button className="notif-btn" onClick={onBack} style={{ width: 40, height: 40 }}>
            <ChevronLeft size={22} />
          </button>
          <h1 className="title-md">Abonnement</h1>
          <div style={{ width: 40 }} />
        </div>

        <div className="page-content" style={{ paddingTop: 8 }}>

          {/* Usage Stats Section */}
          <div className="section-header" style={{ marginBottom: 12 }}>
            <h2>Statut de votre coffre-fort</h2>
            <span className="badge primary" style={{ background: currentPlanId !== 'free' ? 'var(--c-primary)' : 'var(--c-surface-2)', color: currentPlanId !== 'free' ? 'white' : 'var(--c-text-muted)' }}>
              Plan {currentPlanDef.label}
            </span>
          </div>

          <div style={{ 
            background: 'var(--c-surface)', padding: 20, borderRadius: 'var(--r-xl)', 
            border: '1.5px solid var(--c-border)', marginBottom: 28,
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div className="space-y-4">
              {/* Documents Limit */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Files size={16} color="var(--c-primary)" />
                    <span className="body-sm" style={{ fontWeight: 600 }}>Documents archivés</span>
                  </div>
                  <span className="label-xs">{docCount} / {docLimit === Infinity ? '∞' : docLimit}</span>
                </div>
                <div style={{ height: 6, background: 'var(--c-surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${docPercent}%`, height: '100%', background: getProgressColor(docPercent), borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>

              {/* Storage Limit */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Database size={16} color="var(--c-primary)" />
                    <span className="body-sm" style={{ fontWeight: 600 }}>Espace de stockage</span>
                  </div>
                  <span className="label-xs">
                    {storageUsed.toFixed(2)} Mo / {storageLimit >= 1024 ? (storageLimit / 1024).toFixed(0) + ' Go' : storageLimit + ' Mo'}
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--c-surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${storagePercent}%`, height: '100%', background: getProgressColor(storagePercent), borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>
            </div>
            
            {docPercent >= 80 && currentPlanId === 'free' && (
              <div style={{ 
                marginTop: 20, padding: 12, background: 'var(--c-warn-soft)', 
                borderRadius: 'var(--r-md)', display: 'flex', gap: 10, alignItems: 'center'
              }}>
                <Zap size={18} color="var(--c-warn)" />
                <p className="body-xs" style={{ color: '#856404', fontWeight: 600 }}>
                  Vous approchez de la limite gratuite. Passez au plan Pro pour ne pas être bloqué.
                </p>
              </div>
            )}
          </div>

          {/* TEAM MANAGEMENT (BUSINESS ONLY) */}
          {currentPlanId === 'business' && (
            <div style={{ marginTop: 24, marginBottom: 32 }}>
              <div className="section-header">
                <h2>Équipe & Collaborateurs</h2>
                <span className="label-xs" style={{ color: 'var(--c-text-muted)' }}>
                  {invitations.length + 1} / 5 membres
                </span>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <p className="body-sm" style={{ color: 'var(--c-text-muted)', marginBottom: 16 }}>
                  Invitez jusqu'à 4 collaborateurs. Ils recevront un accès à votre coffre-fort d'entreprise.
                </p>

                {/* Formulaire d'invitation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  <input
                    type="email"
                    placeholder="email@collaborateur.com"
                    className="input-field"
                    style={{ width: '100%', fontSize: '0.9rem' }}
                    value={inviteEmail}
                    onChange={e => { setInviteEmail(e.target.value); setInviteStatus(null) }}
                    onKeyDown={e => e.key === 'Enter' && handleInvite()}
                    disabled={inviteLoading}
                  />
                  <button
                    className="btn-primary"
                    style={{ width: '100%', opacity: inviteLoading ? 0.7 : 1 }}
                    onClick={handleInvite}
                    disabled={inviteLoading}
                  >
                    {inviteLoading ? 'Envoi en cours...' : <><UserPlus size={16} /> Envoyer l'invitation</>}
                  </button>

                  {/* Feedback */}
                  {inviteStatus && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                      background: inviteStatus.type === 'success' ? 'var(--c-success-soft)' : 'var(--c-danger-soft)',
                      borderRadius: 'var(--r-md)'
                    }}>
                      {inviteStatus.type === 'success'
                        ? <CheckCircle size={16} color="var(--c-success)" />
                        : <XCircle size={16} color="var(--c-danger)" />}
                      <span style={{
                        fontSize: '0.82rem', fontWeight: 600,
                        color: inviteStatus.type === 'success' ? 'var(--c-success)' : 'var(--c-danger)'
                      }}>
                        {inviteStatus.msg}
                      </span>
                    </div>
                  )}
                </div>

                {/* Liste des membres */}
                <div className="space-y-3">
                  {/* Propriétaire (moi) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--c-surface-2)', borderRadius: 'var(--r-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="flex-center" style={{ width: 32, height: 32, background: 'var(--c-primary)', color: 'white', borderRadius: 10, fontWeight: 700, fontSize: '0.8rem' }}>
                        {authUser?.initials || 'M'}
                      </div>
                      <div>
                        <p className="body-sm" style={{ fontWeight: 600, margin: 0 }}>{authUser?.name} (Moi)</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--c-text-muted)', margin: 0 }}>{authUser?.email}</p>
                      </div>
                    </div>
                    <span className="badge success" style={{ background: 'var(--c-success-soft)', color: 'var(--c-success)', border: 'none' }}>Admin</span>
                  </div>

                  {/* Invitations */}
                  {invitations.map(inv => (
                    <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--c-surface-2)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="flex-center" style={{ width: 32, height: 32, background: 'var(--c-surface)', border: '1.5px dashed var(--c-border)', borderRadius: 10 }}>
                          <Mail size={14} color="var(--c-text-muted)" />
                        </div>
                        <div>
                          <p className="body-sm" style={{ fontWeight: 500, margin: 0 }}>{inv.invitee_email}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--c-text-muted)', margin: 0 }}>
                            Invitation envoyée
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#f59e0b', background: '#fef9c3', padding: '2px 8px', borderRadius: 99 }}>En attente</span>
                        <button
                          onClick={() => handleRemoveInvite(inv.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--c-text-muted)' }}
                          title="Retirer l'invitation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {invitations.length === 0 && (
                    <p className="body-xs" style={{ textAlign: 'center', color: 'var(--c-text-muted)', paddingTop: 8 }}>
                      Aucun collaborateur invité pour l'instant.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Plans + Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.1rem' }}>Choisir un plan</h2>

            {/* Billing Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--c-surface-2)', borderRadius: 999, padding: 3, gap: 2 }}>
              <button
                onClick={() => setBilling('monthly')}
                style={{
                  padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.75rem',
                  background: billing === 'monthly' ? 'var(--c-surface)' : 'transparent',
                  color: billing === 'monthly' ? 'var(--c-text)' : 'var(--c-text-muted)',
                  boxShadow: billing === 'monthly' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.2s'
                }}
              >Mensuel</button>
              <button
                onClick={() => setBilling('yearly')}
                style={{
                  padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.75rem',
                  background: billing === 'yearly' ? 'var(--c-primary)' : 'transparent',
                  color: billing === 'yearly' ? 'white' : 'var(--c-text-muted)',
                  boxShadow: billing === 'yearly' ? '0 2px 8px rgba(0,61,155,0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Annuel
                {billing !== 'yearly' && (
                  <span style={{ marginLeft: 4, background: 'var(--c-success)', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: 99 }}>-25%</span>
                )}
              </button>
            </div>
          </div>

          {/* Promo annuelle */}
          {billing === 'yearly' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'var(--c-success-soft)', borderRadius: 99 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-success)' }}>🎁 Pro — +3 mois offerts</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'var(--c-primary-soft)', borderRadius: 99 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-primary)' }}>💼 Business — Économisez 57$</span>
              </div>
            </div>
          )}

          <div className="space-y-3" style={{ marginBottom: 32 }}>
            {PLANS.map(plan => (
              <div
                key={plan.id}
                style={{
                  background: plan.recommended ? 'linear-gradient(145deg, var(--c-primary), #0066ff)' : 'var(--c-surface)',
                  borderRadius: 'var(--r-xl)',
                  padding: '22px 20px',
                  border: plan.recommended ? 'none' : '1.5px solid var(--c-border)',
                  boxShadow: plan.recommended ? '0 8px 32px rgba(0,61,155,0.3)' : 'var(--shadow-xs)',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {plan.recommended && (
                  <div style={{
                    position: 'absolute', top: 14, right: 16,
                    background: 'rgba(255,255,255,0.2)', color: 'white',
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 999
                  }}>
                    Recommandé
                  </div>
                )}

                {plan.id === currentPlanId && (
                  <div style={{
                    position: 'absolute', top: 14, right: 16,
                  }}>
                    <span className="badge primary" style={{ background: 'white', color: 'var(--c-primary)' }}>Votre plan actuel</span>
                  </div>
                )}

                {/* Plan header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
                  <div className={`icon-wrap md ${plan.recommended ? '' : plan.color}`}
                    style={plan.recommended ? {
                      width: 52, height: 52, borderRadius: 'var(--r-md)',
                      background: 'rgba(255,255,255,0.15)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    } : {}}>
                    {plan.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.1rem',
                      color: plan.recommended ? 'white' : 'var(--c-text)'
                    }}>
                      {plan.name}
                    </div>
                    {(() => {
                      const pricing = getPlanPrice(plan.id, billing)
                      return (
                        <>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                            <span style={{
                              fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.4rem',
                              color: plan.recommended ? 'white' : 'var(--c-text)'
                            }}>
                              {pricing.label}
                            </span>
                          </div>
                          {pricing.sub && (
                            <p style={{ fontSize: '0.72rem', color: plan.recommended ? 'rgba(255,255,255,0.7)' : 'var(--c-text-muted)', margin: 0 }}>
                              {pricing.sub}
                            </p>
                          )}
                          {billing === 'yearly' && pricing.badge && (
                            <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: plan.recommended ? 'rgba(111,251,190,0.25)' : 'var(--c-success-soft)',
                              color: plan.recommended ? '#6ffbbe' : 'var(--c-success)',
                              padding: '3px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700
                            }}>
                              🎁 {pricing.badge}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Check size={15} color={plan.recommended ? 'rgba(255,255,255,0.9)' : 'var(--c-success)'} style={{ flexShrink: 0 }} />
                      <span style={{
                        fontSize: '0.83rem',
                        color: plan.recommended ? 'rgba(255,255,255,0.85)' : 'var(--c-text-muted)'
                      }}>
                        {f}
                      </span>
                    </div>
                  ))}
                  {plan.missing?.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.45 }}>
                      <X size={15} color="var(--c-text-muted)" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.83rem', color: 'var(--c-text-muted)', textDecoration: 'line-through' }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {plan.id !== currentPlanId && (
                  <button
                    onClick={() => {
                      const pricing = getPlanPrice(plan.id, billing)
                      setSelectedPlan({
                        ...plan,
                        displayPrice: pricing.label,
                        billingCycle: billing
                      })
                    }}
                    style={{
                      width: '100%', padding: '13px 0',
                      borderRadius: 'var(--r-lg)',
                      fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.9rem',
                      background: plan.recommended ? 'rgba(255,255,255,0.15)' : 'var(--c-primary-soft)',
                      color: plan.recommended ? 'white' : 'var(--c-primary)',
                      border: plan.recommended ? '1.5px solid rgba(255,255,255,0.3)' : 'none',
                      cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    {plan.price === '0 FCFA' ? 'Revenir au gratuit' : 'Mettre à niveau'} <ChevronRight size={16} />
                  </button>
                )}
                {plan.id === currentPlanId && (
                  <div style={{
                    textAlign: 'center', padding: '10px 0',
                    fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.85rem',
                    color: plan.recommended ? 'white' : 'var(--c-primary)',
                  }}>
                    ✓ Actuellement actif
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Garanties */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12, marginBottom: 32
          }}>
            {[
              { icon: '🔒', label: 'SSL', sub: 'Sécurisé' },
              { icon: '↩️', label: '30j', sub: 'Remboursé' },
              { icon: '❌', label: 'Sans', sub: 'Engagement' },
            ].map((g, i) => (
              <div key={i} style={{
                background: 'var(--c-surface)', borderRadius: 'var(--r-lg)',
                padding: '16px 10px', textAlign: 'center',
                border: '1.5px solid var(--c-border)', boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ fontSize: '1.4rem' }}>{g.icon}</div>
                <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '0.9rem', color: 'var(--c-text)', marginTop: 6 }}>{g.label}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--c-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{g.sub}</div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="section-header">
            <h2>Questions fréquentes</h2>
          </div>
          <div className="space-y-3" style={{ marginBottom: 40 }}>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--c-surface)', borderRadius: 'var(--r-lg)',
                  border: '1.5px solid var(--c-border)', overflow: 'hidden',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', padding: '16px 18px', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                    background: 'none', border: 'none', cursor: 'pointer'
                  }}
                >
                  <span style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '0.9rem', color: 'var(--c-text)' }}>
                    {faq.q}
                  </span>
                  <ChevronRight
                    size={18}
                    color="var(--c-text-muted)"
                    style={{
                      transform: openFaq === i ? 'rotate(90deg)' : 'rotate(0)',
                      transition: 'transform 0.2s', flexShrink: 0
                    }}
                  />
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: '0 18px 16px',
                    fontSize: '0.83rem', color: 'var(--c-text-muted)', lineHeight: 1.6
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        plan={selectedPlan}
      />
    </>
  )
}
