import React, { useState } from 'react'
import { Shield, Eye, EyeOff, Mail, Lock, User, ArrowRight, ChevronLeft, Check } from 'lucide-react'
import { useApp } from '../store/AppContext'

export default function RegisterPage({ onGoLogin }) {
  const { sendVerificationCode, verifyCode } = useApp()
  const [form, setForm] = useState({ name: '', lastName: '', email: '', password: '', confirm: '' })
  const [show, setShow] = useState({ password: false, confirm: false })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Email verification logic
  const [step, setStep] = useState(1) // 1: input, 2: otp
  const [loadingCode, setLoadingCode] = useState(false)
  const [otp, setOtp] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)

  const sendCode = async () => {
    if (!form.email.trim() || !form.password.trim() || !form.name.trim() || !form.lastName.trim()) {
      setError('Veuillez remplir toutes les informations (Nom, Prénoms, Email et MDP) avant d\'envoyer le code.')
      return
    }
    
    setLoadingCode(true)
    setError('')
    
    try {
      console.log("Envoi du code à Supabase pour :", form.email)
      const res = await sendVerificationCode(form.email.trim(), form.password, form.name.trim(), form.lastName.trim())
      
      if (res.success) {
        setStep(2)
      } else {
        setError(res.error)
      }
    } catch (err) {
      console.error("Erreur fatale lors de l'envoi :", err)
      setError(`Détail technique : ${err.message || 'Erreur inconnue'}`)
    } finally {
      setLoadingCode(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!emailVerified) {
      setError('Veuillez d\'abord vérifier votre adresse email.')
      return
    }
    setLoading(true)
    // Le compte est déjà créé dans Supabase, on a juste besoin de quitter la page d'inscription
    setTimeout(() => {
      window.location.hash = '' // On vide le hash pour aller sur l'accueil
      setLoading(false)
    }, 1000)
  }

  const verifyOtp = async () => {
    if (otp.length !== 6) return
    setLoadingCode(true)
    const res = await verifyCode(form.email.trim(), otp)
    if (res.success) {
      setEmailVerified(true)
      setError('')
      // On ne redirige pas tout de suite, on laisse l'utilisateur cliquer sur le bouton final
    } else {
      setError("Le code de vérification est incorrect.")
    }
    setLoadingCode(false)
  }

  const passwordStrength = () => {
    const p = form.password
    if (!p) return { score: 0, label: '', color: 'transparent' }
    let score = 0
    if (p.length >= 8)           score++
    if (/[A-Z]/.test(p))        score++
    if (/[0-9]/.test(p))        score++
    if (/[^a-zA-Z0-9]/.test(p)) score++
    const levels = [
      { label: 'Trop court',  color: '#ef4444' },
      { label: 'Faible',      color: '#f97316' },
      { label: 'Moyen',       color: '#eab308' },
      { label: 'Fort',        color: '#22c55e' },
      { label: 'Très fort',   color: '#16a34a' },
    ]
    return { score, ...levels[score] }
  }
  const strength = passwordStrength()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim())     { setError('Veuillez entrer votre prénom.'); return }
    if (!form.lastName.trim()) { setError('Veuillez entrer votre nom.'); return }
    if (!form.email.trim()) { setError('Veuillez entrer votre email.'); return }
    if (!emailVerified) { setError('Veuillez d\'abord vérifier votre adresse email.'); return }
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (!agreed) { setError("Veuillez accepter les conditions d'utilisation."); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    const result = register(form.name.trim(), form.email.trim(), form.password, form.lastName.trim())
    setLoading(false)
    if (!result.success) setError(result.error)
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(160deg, #001233 0%, #003d9b 60%, #0052cc 100%)',
      padding: '0 24px',
    }}>
      {/* Background decorations */}
      <div style={{ position: 'fixed', top: -80,  right: -80,  width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

      {/* Top logo bar */}
      <div style={{ paddingTop: 56, paddingBottom: 32, textAlign: 'center', position: 'relative' }}>
        <button
          onClick={onGoLogin}
          style={{ position: 'absolute', left: 0, top: 56, display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600 }}
        >
          <ChevronLeft size={18} /> Connexion
        </button>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'rgba(255,255,255,0.12)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', backdropFilter: 'blur(12px)',
          overflow: 'hidden', padding: 8
        }}>
          <img src="/digisafe_official_logo_1775050111054.png" alt="DigiSAFE" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h1 style={{ color: 'white', fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.6rem', marginBottom: 4 }}>
          Créer mon compte
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
          Gratuit · Sécurisé · Sans engagement
        </p>
      </div>

      {/* Card (scrollable) */}
      <div style={{
        background: 'white', borderRadius: '16px 16px 0 0',
        padding: '32px 24px 60px', flex: 1,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        overflowY: 'auto',
      }}>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.82rem', color: 'var(--c-text-muted)', marginBottom: 8 }}>
              Prénoms
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--c-primary-mid)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError('') }}
                placeholder="Votre prénom"
                style={{ width: '100%', padding: '15px 16px 15px 46px', background: '#f5f7ff', border: '1.5px solid #e8edff', borderRadius: 'var(--r-md)', fontSize: '0.9rem', color: 'var(--c-text)', fontFamily: 'Inter' }}
              />
            </div>
          </div>

          {/* Last name */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.82rem', color: 'var(--c-text-muted)', marginBottom: 8 }}>
              Nom
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--c-primary-mid)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={form.lastName}
                onChange={e => { setForm(f => ({ ...f, lastName: e.target.value })); setError('') }}
                placeholder="Votre nom de famille"
                style={{ width: '100%', padding: '15px 16px 15px 46px', background: '#f5f7ff', border: '1.5px solid #e8edff', borderRadius: 'var(--r-md)', fontSize: '0.9rem', color: 'var(--c-text)', fontFamily: 'Inter' }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.82rem', color: 'var(--c-text-muted)', marginBottom: 8 }}>
              Adresse email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--c-primary-mid)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(''); setStep(1) }}
                placeholder="exemple@email.com"
                style={{ width: '100%', padding: '15px 16px 15px 46px', background: '#f5f7ff', border: '1.5px solid #e8edff', borderRadius: 'var(--r-md)', fontSize: '0.9rem', color: 'var(--c-text)', fontFamily: 'Inter' }}
              />
            </div>
          </div>

          {/* Verification Step */}
          {form.email.includes('@') && form.email.includes('.') && !emailVerified && (
            <div style={{ marginTop: -4, textAlign: 'right' }}>
              {step === 1 ? (
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={loadingCode}
                  style={{
                    padding: '6px 12px', background: 'transparent',
                    border: '1.2px solid var(--c-primary)', color: 'var(--c-primary)',
                    borderRadius: '6px', fontWeight: 700, fontSize: '0.72rem',
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                    transition: 'all 0.2s', opacity: loadingCode ? 0.6 : 1
                  }}
                >
                  {loadingCode ? "Envoi..." : <><Mail size={13} /> Envoyer le code</>}
                </button>
              ) : (
                <div style={{ background: 'var(--c-surface-2)', padding: '12px', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--c-text-muted)', marginBottom: 8, textAlign: 'left' }}>
                    Code envoyé à <b>{form.email}</b>
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Code (6 chiffres)"
                      style={{ flex: 1, padding: '8px', textAlign: 'center', fontWeight: 800, border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      onClick={verifyOtp}
                      style={{ padding: '0 12px', background: 'var(--c-primary)', color: 'white', border: 'none', borderRadius: 'var(--r-sm)', fontWeight: 600, fontSize: '0.75rem' }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {emailVerified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontSize: '0.82rem', fontWeight: 700, background: '#f0fdf4', padding: '10px 14px', borderRadius: 'var(--r-sm)', marginTop: -8 }}>
              <Check size={18} /> Email vérifié avec succès
            </div>
          )}

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.82rem', color: 'var(--c-text-muted)', marginBottom: 8 }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--c-primary-mid)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={show.password ? 'text' : 'password'}
                value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError('') }}
                placeholder="Min. 6 caractères"
                style={{ width: '100%', padding: '15px 46px 15px 46px', background: '#f5f7ff', border: '1.5px solid #e8edff', borderRadius: 'var(--r-md)', fontSize: '0.9rem', color: 'var(--c-text)', fontFamily: 'Inter' }}
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, password: !s.password }))} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-muted)' }}>
                {show.password ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Strength indicator */}
            {form.password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= strength.score ? strength.color : '#e8edff', transition: 'background 0.2s' }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.82rem', color: 'var(--c-text-muted)', marginBottom: 8 }}>
              Confirmer le mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--c-primary-mid)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={show.confirm ? 'text' : 'password'}
                value={form.confirm}
                onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setError('') }}
                placeholder="Répétez le mot de passe"
                style={{
                  width: '100%', padding: '15px 46px 15px 46px', background: '#f5f7ff',
                  border: `1.5px solid ${form.confirm && form.confirm !== form.password ? '#ef4444' : '#e8edff'}`,
                  borderRadius: 'var(--r-md)', fontSize: '0.9rem', color: 'var(--c-text)', fontFamily: 'Inter'
                }}
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-muted)' }}>
                {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {form.confirm && form.confirm === form.password && (
                <div style={{ position: 'absolute', right: 46, top: '50%', transform: 'translateY(-50%)' }}>
                  <Check size={16} color="#22c55e" />
                </div>
              )}
            </div>
          </div>

          {/* Terms */}
          <div
            onClick={() => setAgreed(a => !a)}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '4px 0' }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
              background: agreed ? 'var(--c-primary)' : '#f5f7ff',
              border: `2px solid ${agreed ? 'var(--c-primary)' : '#e8edff'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
              {agreed && <Check size={13} color="white" strokeWidth={3} />}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--c-text-muted)', lineHeight: 1.5, margin: 0 }}>
              J'accepte les{' '}
              <span style={{ color: 'var(--c-primary)', fontWeight: 600 }}>Conditions d'utilisation</span>
              {' '}et la{' '}
              <span style={{ color: 'var(--c-primary)', fontWeight: 600 }}>Politique de confidentialité</span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'var(--c-danger-soft)', color: 'var(--c-danger)', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          {(() => {
            const isFormValid = 
              form.name.trim() && 
              form.lastName.trim() && 
              form.email.includes('@') && 
              emailVerified && 
              form.password.length >= 6 && 
              form.password === form.confirm && 
              agreed;

            return (
              <button
                type="submit"
                disabled={!isFormValid || loading}
                style={{
                  width: '100%', padding: '15px',
                  background: !isFormValid 
                    ? '#e0e4f0' 
                    : loading ? 'var(--c-primary-soft)' : 'linear-gradient(135deg, var(--c-primary), #0066ff)',
                  color: !isFormValid ? '#94a3b8' : loading ? 'var(--c-primary)' : 'white',
                  borderRadius: 'var(--r-lg)', fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem',
                  border: 'none', cursor: !isFormValid ? 'not-allowed' : loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 4, transition: 'all 0.3s ease',
                  boxShadow: !isFormValid || loading ? 'none' : '0 4px 16px rgba(0,61,155,0.35)',
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 18, height: 18, border: '2px solid var(--c-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Création du compte…
                  </span>
                ) : (
                  <><ArrowRight size={20} /> Créer mon compte gratuit</>
                )}
              </button>
            );
          })()}

          {/* Login link */}
          <p style={{ textAlign: 'center', fontSize: '0.87rem', color: 'var(--c-text-muted)', marginTop: 8 }}>
            Déjà un compte ?{' '}
            <span onClick={onGoLogin} style={{ color: 'var(--c-primary)', fontWeight: 700, cursor: 'pointer' }}>
              Se connecter
            </span>
          </p>

        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
