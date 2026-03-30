import React from 'react'
import { Shield, Lock, ChevronRight, Fingerprint, Key } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col font-body text-[#191c1e]">
      {/* Editorial Header - Layer 1 (Surface Bright) */}
      <header className="p-8 pb-12 pt-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#003d9b] rounded-xl flex items-center justify-center text-white">
            <Shield size={24} />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">DigiSAFE</span>
        </div>
        
        <h1 className="font-headline text-5xl font-extrabold leading-[1.1] mb-6 max-w-xs transition-all duration-700 ease-out">
          Votre Sanctuaire <span className="text-[#0052cc]">Numérique</span>
        </h1>
        
        <p className="text-lg text-[#434654] leading-relaxed max-w-sm">
          Le coffre-fort haut de gamme conçu pour protéger votre identité et vos documents avec une précision maximale.
        </p>
      </header>

      {/* Main Content Area - Layered surfaces */}
      <main className="flex-1 px-8">
        
        {/* Feature Cards - Overlapping effect using translation */}
        <div className="relative space-y-4 -mt-4 pb-32">
          
          <div className="card-container bg-white p-6 rounded-[1.5rem] shadow-[0_8px_32px_rgba(25,28,30,0.06)] transform translate-x-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#eceef0] rounded-lg text-[#003d9b]">
                <Fingerprint size={24} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg mb-1">Authentification Bio</h3>
                <p className="text-sm text-[#434654]">Accédez à vos secrets instantanément grâce à votre empreinte.</p>
              </div>
            </div>
          </div>

          <div className="card-container bg-white p-6 rounded-[1.5rem] shadow-[0_8px_32px_rgba(25,28,30,0.06)] transform -translate-x-2">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#eceef0] rounded-lg text-[#003d9b]">
                <Lock size={24} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg mb-1">Chiffrement Militaire</h3>
                <p className="text-sm text-[#434654]">Chaque bit de donnée est protégé par des protocoles AES-256 certifiés.</p>
              </div>
            </div>
          </div>

          <div className="card-container bg-white p-6 rounded-[1.5rem] shadow-[0_8px_32px_rgba(25,28,30,0.06)] transform translate-x-2">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#eceef0] rounded-lg text-[#003d9b]">
                <Key size={24} />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg mb-1">Gestion des Clés</h3>
                <p className="text-sm text-[#434654]">Inscrivez-vous et sécurisez l'accès à vos mots de passe critiques.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Persistent Glass Footer - Premium Control */}
      <footer className="fixed bottom-0 left-0 right-0 p-8 glass-nav z-50 flex justify-between items-center bg-white/70 backdrop-blur-2xl border-t border-white/20">
        <button className="text-sm font-headline font-bold uppercase tracking-wider text-[#434654]">Passer</button>
        
        <button className="btn-primary group">
          Continuer
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </footer>

      {/* Style overrides for Tailwind-like behavior within Vanilla CSS strategy */}
      <style>{`
        .glass-nav {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .btn-primary {
          background: linear-gradient(135deg, #003d9b 0%, #0052cc 100%);
          color: white;
          padding: 0.875rem 1.75rem;
          border-radius: 1.5rem;
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(0, 61, 155, 0.15);
        }
        .card-container {
           /* No border rule: reliance on surface color contrast and soft shadows */
           box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </div>
  )
}

export default App
