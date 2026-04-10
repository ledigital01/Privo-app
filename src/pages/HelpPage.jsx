import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, HelpCircle, MessageSquare, Mail, Shield, BookOpen, ExternalLink, ChevronRight } from 'lucide-react'
import { t } from '../utils/i18n'

const HelpPage = () => {
  const navigate = useNavigate()

  const FAQ_ITEMS = [
    { q: "Comment mes documents sont-ils protégés ?", a: "Vos documents sont chiffrés de bout en bout avec l'algorithme AES-256. Seul vous possédez la clé d'accès." },
    { q: "Qu'est-ce que le Mode Urgence ?", a: "C'est un accès rapide à vos documents vitaux (ID, groupe sanguin, etc.) conçu pour être utilisé par des secours ou en cas de stress intense." },
    { q: "Puis-je partager un document ?", a: "Oui, via la fonction 'Partage' qui génère un lien sécurisé, protégé par mot de passe et avec une date d'expiration." },
    { q: "Est-ce gratuit ?", a: "Privo propose un plan gratuit pour les documents essentiels et un plan Pro pour un stockage illimité et des fonctions avancées." }
  ]

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="title-md">Aide & Support</h1>
        <div style={{ width: 44 }} />
      </div>

      <div className="page-content">
        {/* Intro */}
        <div style={{ textAlign: 'center', padding: '20px 0 32px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--c-primary-soft)', color: 'var(--c-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <HelpCircle size={32} />
          </div>
          <h2 className="title-md">Comment pouvons-nous vous aider ?</h2>
          <p className="body-sm" style={{ marginTop: 8 }}>Trouvez des réponses rapides ou contactez notre équipe.</p>
        </div>

        {/* Search FAQ placeholder */}
        <div className="search-bar" style={{ marginBottom: 32 }}>
          <BookOpen size={18} color="var(--c-primary-mid)" />
          <input type="text" placeholder="Rechercher dans la FAQ..." disabled style={{ opacity: 0.6 }} />
        </div>

        {/* FAQ Section */}
        <div className="section-header">
          <h2>Questions fréquentes</h2>
        </div>
        <div className="space-y-4" style={{ marginBottom: 40 }}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 'var(--r-xl)', padding: 18, border: '1px solid var(--c-border)', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--c-text)', marginBottom: 8 }}>{item.q}</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)', lineHeight: 1.5 }}>{item.a}</p>
            </div>
          ))}
        </div>

        {/* Contact info (Placeholder as requested) */}
        <div className="section-header">
           <h2>Besoin d'autre chose ?</h2>
        </div>
        <div style={{ background: 'linear-gradient(135deg, var(--c-primary), #0066ff)', borderRadius: 'var(--r-2xl)', padding: 24, color: 'white', position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>Contactez-nous</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 20 }}>Notre équipe support est disponible du lundi au vendredi.</p>
              
              <div className="space-y-3">
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: 12 }}>
                    <Mail size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>support@digisafe.com</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: 12 }}>
                    <MessageSquare size={18} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Chat en direct (indisponible)</span>
                 </div>
              </div>
           </div>
           <HelpCircle size={100} style={{ position: 'absolute', bottom: -20, right: -20, opacity: 0.1, transform: 'rotate(15deg)' }} />
        </div>

        {/* Legal links */}
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
           <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 12 }}>
              <span className="body-xs" style={{ fontWeight: 700 }}>Confidentialité</span>
              <span className="body-xs" style={{ fontWeight: 700 }}>CGV</span>
           </div>
           <p className="body-xs" style={{ opacity: 0.5 }}>DigiSAFE Version 2.0.1 (Bêta)</p>
        </div>
      </div>
    </div>
  )
}

export default HelpPage
