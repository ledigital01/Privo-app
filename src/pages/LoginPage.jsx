import React, { useState } from 'react'
import { Shield, Eye, EyeOff, Mail, Lock, ArrowRight, ChevronRight } from 'lucide-react'
import { useApp } from '../store/AppContext'

export default function LoginPage({ onGoRegister }) {
  const { login } = useApp()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [show,    setShow]    = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    const result = await login(form.email.trim(), form.password)
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

      {/* Logo section */}
      <div style={{ paddingTop: 72, paddingBottom: 40, textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'rgba(255,255,255,0.12)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', backdropFilter: 'blur(12px)',
          overflow: 'hidden', padding: 8
        }}>
          <img src="/digisafe_official_logo_1775050111054.png" alt="DigiSAFE" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(1.1)' }} />
        </div>
        <h1 style={{ color: 'white', fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.9rem', marginBottom: 8 }}>
          DigiSAFE
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
          Votre coffre-fort numérique sécurisé
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'white', borderRadius: '16px 16px 0 0',
        padding: '32px 24px 48px', flex: 1,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: '1.4rem', color: 'var(--c-text)', marginBottom: 6 }}>
          Bon retour 👋
        </h2>
        <p style={{ color: 'var(--c-text-muted)', fontSize: '0.87rem', marginBottom: 28 }}>
          Connectez-vous à votre espace sécurisé.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

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
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError('') }}
                placeholder="exemple@email.com"
                style={{
                  width: '100%', padding: '15px 16px 15px 46px',
                  background: '#f5f7ff', border: '1.5px solid #e8edff',
                  borderRadius: 'var(--r-md)', fontSize: '0.9rem',
                  color: 'var(--c-text)', fontFamily: 'Inter',
                  transition: 'border-color 0.15s',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontFamily: 'Manrope', fontWeight: 600, fontSize: '0.82rem', color: 'var(--c-text-muted)' }}>
                Mot de passe
              </label>
              <span style={{ fontSize: '0.78rem', color: 'var(--c-primary)', fontWeight: 600, cursor: 'pointer' }}>
                Oublié ?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--c-primary-mid)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError('') }}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '15px 46px 15px 46px',
                  background: '#f5f7ff', border: '1.5px solid #e8edff',
                  borderRadius: 'var(--r-md)', fontSize: '0.9rem',
                  color: 'var(--c-text)', fontFamily: 'Inter',
                }}
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-muted)' }}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'var(--c-danger-soft)', color: 'var(--c-danger)',
              borderRadius: 'var(--r-sm)', padding: '10px 14px',
              fontSize: '0.82rem', fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              background: loading ? 'var(--c-primary-soft)' : 'linear-gradient(135deg, var(--c-primary), #0066ff)',
              color: loading ? 'var(--c-primary)' : 'white',
              borderRadius: 'var(--r-lg)', fontFamily: 'Manrope', fontWeight: 800, fontSize: '1rem',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 8, transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(0,61,155,0.35)',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 18, height: 18, border: '2px solid var(--c-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Connexion…
              </span>
            ) : (
              <><ArrowRight size={20} /> Se connecter</>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--c-text-muted)', whiteSpace: 'nowrap' }}>ou continuer avec</span>
          <div style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
        </div>

        {/* Social buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: 'white', border: '1.5px solid #e8edff', borderRadius: 'var(--r-md)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text)', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5001 12.2332C22.5001 11.3706 22.4291 10.7414 22.2731 10.125H12V14.1273H17.9574C17.8298 15.1923 17.1348 16.5928 15.7731 17.5332L15.7533 17.6631L18.9667 20.125L19.1891 20.1471C21.2341 18.2618 22.5001 15.5133 22.5001 12.2332Z" fill="#4285F4"/>
              <path d="M12 22.875C14.9362 22.875 17.3972 21.9118 19.1891 20.1471L15.7731 17.5332C14.851 18.1764 13.5886 18.6259 12 18.6259C9.1135 18.6259 6.6738 16.7323 5.7943 14.0754L5.6639 14.0864L2.3082 16.6575L2.2644 16.7826C4.0525 20.3015 7.7305 22.875 12 22.875Z" fill="#34A853"/>
              <path d="M5.7943 14.0754C5.5674 13.4032 5.4397 12.6859 5.4397 11.9375C5.4397 11.1891 5.5674 10.4718 5.7801 9.7995L5.7744 9.658L2.3831 7.051L2.2644 7.0924C1.5404 8.5377 1.1277 10.1691 1.1277 11.9375C1.1277 13.7059 1.5404 15.3373 2.2644 16.7826L5.7943 14.0754Z" fill="#FBBC05"/>
              <path d="M12 5.2491C14.0426 5.2491 15.4185 6.1189 16.2057 6.8539L19.2604 3.9068C17.383 2.1534 14.9362 1.0909 12 1.0909C7.7305 1.0909 4.0525 3.6644 2.2644 7.1833L5.7801 9.8995C6.6738 7.2427 9.1135 5.2491 12 5.2491Z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: '#000', border: '1.5px solid #000', borderRadius: 'var(--r-md)', fontSize: '0.85rem', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.06.75 1.25-.03 2.52-.78 3.84-.65 1.39.12 2.47.67 3.19 1.7-2.86 1.63-2.39 5.56.4 6.77-.55 1.41-1.31 2.82-2.49 4.4zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.54-3.74 4.25z"/>
            </svg>
            Apple
          </button>
        </div>

        {/* Register link */}
        <p style={{ textAlign: 'center', marginTop: 28, fontSize: '0.87rem', color: 'var(--c-text-muted)' }}>
          Pas encore de compte ?{' '}
          <span
            onClick={onGoRegister}
            style={{ color: 'var(--c-primary)', fontWeight: 700, cursor: 'pointer' }}
          >
            S'inscrire gratuitement <ChevronRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </span>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
