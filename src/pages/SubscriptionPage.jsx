import React, { useState } from 'react'
import {
  Shield, Check, ChevronRight, Star, Zap, Crown,
  Smartphone, CreditCard, Wallet, X, ArrowLeft,
  Lock, CheckCircle, XCircle, ChevronLeft
} from 'lucide-react'

/* ================================================================
   MODAL — PAYMENT METHOD SELECTION
   ================================================================ */
function PaymentModal({ isOpen, onClose, plan, onSuccess, onFail }) {
  const [step, setStep] = useState('method') // 'method' | 'processing' | 'success' | 'fail'
  const [method, setMethod] = useState(null)

  if (!isOpen) return null

  const handlePay = (m) => {
    setMethod(m)
    setStep('processing')
    // Simulate processing
    setTimeout(() => {
      const ok = Math.random() > 0.2 // 80% success for demo
      setStep(ok ? 'success' : 'fail')
    }, 2000)
  }

  const handleClose = () => {
    setStep('method')
    setMethod(null)
    onClose()
  }

  const METHODS = [
    {
      id: 'mobile_money',
      label: 'Mobile Money',
      desc: 'Orange Money, Wave, MTN...',
      icon: <Smartphone size={24} />,
      color: 'warn',
    },
    {
      id: 'card',
      label: 'Carte Bancaire',
      desc: 'Visa, Mastercard, AMEX',
      icon: <CreditCard size={24} />,
      color: 'primary',
    },
    {
      id: 'wallet',
      label: 'DigiWallet',
      desc: 'Solde disponible : 12 500 FCFA',
      icon: <Wallet size={24} />,
      color: 'success',
    },
  ]

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: 430, margin: '0 auto' }}>
        <div className="modal-handle" />

        {/* STEP: METHOD SELECTION */}
        {step === 'method' && (
          <>
            <div className="modal-header">
              <div>
                <h2 className="title-md">Choisir le paiement</h2>
                <p className="body-sm" style={{ marginTop: 2 }}>Plan {plan?.name} — <strong>{plan?.price}</strong></p>
              </div>
              <button className="modal-close-btn" onClick={handleClose}><X size={18} /></button>
            </div>

            <div className="modal-body">
              {/* Security badge */}
              <div style={{
                display: 'flex', alignItems:'center', gap: 10,
                background: 'var(--c-primary-soft)', borderRadius: 'var(--r-md)',
                padding: '12px 16px', marginBottom: 4
              }}>
                <Lock size={18} color="var(--c-primary)" />
                <p className="body-sm" style={{ color: 'var(--c-primary)', margin: 0 }}>
                  Paiement 100% sécurisé · Chiffré SSL
                </p>
              </div>

              <div className="label-xs" style={{ paddingLeft: 4, marginTop: 8 }}>Méthode de paiement</div>

              {METHODS.map(m => (
                <button key={m.id} className="action-row" onClick={() => handlePay(m.id)}>
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

        {/* STEP: PROCESSING */}
        {step === 'processing' && (
          <div className="modal-body" style={{ paddingTop: 40, paddingBottom: 60, alignItems: 'center', textAlign: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              border: '4px solid var(--c-primary-soft)',
              borderTopColor: 'var(--c-primary)',
              animation: 'spin 0.9s linear infinite',
              margin: '0 auto'
            }} />
            <div>
              <p className="title-sm">Traitement en cours…</p>
              <p className="body-sm">Veuillez patienter quelques secondes.</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* STEP: SUCCESS */}
        {step === 'success' && (
          <div className="modal-body" style={{ paddingTop: 40, paddingBottom: 60, alignItems: 'center', textAlign: 'center', gap: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--c-success-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto'
            }}>
              <CheckCircle size={44} color="var(--c-success)" />
            </div>
            <div>
              <p className="title-sm" style={{ fontSize: '1.2rem' }}>Paiement réussi ! 🎉</p>
              <p className="body-sm" style={{ marginTop: 8 }}>
                Votre abonnement <strong>{plan?.name}</strong> est maintenant actif.
              </p>
            </div>
            <button className="btn-primary" onClick={handleClose}><Check size={18} /> Continuer</button>
          </div>
        )}

        {/* STEP: FAIL */}
        {step === 'fail' && (
          <div className="modal-body" style={{ paddingTop: 40, paddingBottom: 60, alignItems: 'center', textAlign: 'center', gap: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--c-danger-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto'
            }}>
              <XCircle size={44} color="var(--c-danger)" />
            </div>
            <div>
              <p className="title-sm" style={{ fontSize: '1.2rem' }}>Paiement échoué</p>
              <p className="body-sm" style={{ marginTop: 8 }}>
                Une erreur est survenue. Vérifiez vos informations et réessayez.
              </p>
            </div>
            <button className="btn-primary" onClick={() => setStep('method')}>Réessayer</button>
            <button className="btn-secondary" onClick={handleClose}>Annuler</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   PAGE — SUBSCRIPTION / PRICING
   ================================================================ */
const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0 FCFA',
    period: '/mois',
    icon: <Shield size={28} />,
    color: 'neutral',
    current: true,
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
    price: '4 900 FCFA',
    period: '/mois',
    icon: <Star size={28} />,
    color: 'primary',
    recommended: true,
    features: [
      '100 documents',
      'Scan IA avancé',
      'Stockage 5 Go',
      'Partage sécurisé illimité',
      'Alertes d\'expiration automatiques',
      'Support prioritaire',
    ],
    missing: [],
  },
  {
    id: 'business',
    name: 'Business',
    price: '12 500 FCFA',
    period: '/mois',
    icon: <Crown size={28} />,
    color: 'warn',
    features: [
      'Documents illimités',
      'IA illimitée + OCR avancé',
      'Stockage 50 Go',
      'Multi-utilisateurs (5 max)',
      'Tableau de bord entreprise',
      'API d\'intégration',
      'Support dédié 24/7',
    ],
    missing: [],
  },
]

const FAQS = [
  { q: 'Puis-je résilier à tout moment ?', a: 'Oui, sans frais ni engagement. Vous gardez l\'accès jusqu\'à la fin de la période payée.' },
  { q: 'Mes données sont-elles sécurisées ?', a: 'Toutes vos données sont chiffrées AES-256 et hébergées en Europe (RGPD compliant).' },
  { q: 'Quels moyens de paiement sont acceptés ?', a: 'Mobile Money (Orange, Wave, MTN), cartes bancaires Visa/Mastercard, et DigiWallet.' },
]

export default function SubscriptionPage({ onBack }) {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <>
      <div className="page-enter">
        {/* Top bar */}
        <div className="top-bar">
          <button className="notif-btn" onClick={onBack} style={{ width: 40, height: 40 }}>
            <ChevronLeft size={22} />
          </button>
          <h1 className="title-md">Abonnement</h1>
          <div style={{ width: 40 }} />
        </div>

        <div className="page-content" style={{ paddingTop: 8 }}>

          {/* Hero */}
          <div style={{
            background: 'linear-gradient(145deg, var(--c-primary), #001e5c)',
            borderRadius: 'var(--r-2xl)', padding: '28px 24px', marginBottom: 28,
            color: 'white', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: -40, right: -40,
              width: 140, height: 140, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)'
            }} />
            <div style={{
              position: 'absolute', bottom: -20, left: -20,
              width: 100, height: 100, borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)'
            }} />
            <Zap size={28} color="rgba(255,255,255,0.8)" style={{ marginBottom: 12 }} />
            <h2 style={{ color: 'white', fontSize: '1.4rem', marginBottom: 8, position: 'relative', zIndex: 1 }}>
              Passez à la vitesse supérieure
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
              Débloquez la puissance complète de l'IA pour gérer vos documents en toute sécurité.
            </p>
          </div>

          {/* Plans */}
          <div className="section-header">
            <h2>Choisir un plan</h2>
          </div>

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

                {plan.current && (
                  <div style={{
                    position: 'absolute', top: 14, right: 16,
                  }}>
                    <span className="badge primary">Plan actuel</span>
                  </div>
                )}

                {/* Plan header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div className={`icon-wrap md ${plan.recommended ? '' : plan.color}`}
                    style={plan.recommended ? {
                      width: 52, height: 52, borderRadius: 'var(--r-md)',
                      background: 'rgba(255,255,255,0.15)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    } : {}}>
                    {plan.icon}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.1rem',
                      color: plan.recommended ? 'white' : 'var(--c-text)'
                    }}>
                      {plan.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{
                        fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.4rem',
                        color: plan.recommended ? 'white' : 'var(--c-text)'
                      }}>
                        {plan.price}
                      </span>
                      <span style={{
                        fontSize: '0.8rem',
                        color: plan.recommended ? 'rgba(255,255,255,0.65)' : 'var(--c-text-muted)'
                      }}>
                        {plan.period}
                      </span>
                    </div>
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
                {!plan.current && (
                  <button
                    onClick={() => setSelectedPlan(plan)}
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
                    Mettre à niveau <ChevronRight size={16} />
                  </button>
                )}
                {plan.current && (
                  <div style={{
                    textAlign: 'center', padding: '10px 0',
                    fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.85rem',
                    color: 'var(--c-text-muted)'
                  }}>
                    ✓ Plan actuel
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
