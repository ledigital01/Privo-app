import React from 'react'
import { Shield, Clock, Plus, Zap, AlertCircle, ChevronRight, Search } from 'lucide-react'

// Dummy data for visual reference
const SUMMARY = [
  { label: 'Total', value: '24', icon: <FolderOpen size={20} />, color: 'bg-[#dae2ff] text-[#003d9b]' },
  { label: 'Expirant', value: '3', icon: <Clock size={20} />, color: 'bg-[#fee2e2] text-[#ba1a1a]' },
  { label: 'Recents', value: '12', icon: <Zap size={20} />, color: 'bg-[#d1fae5] text-[#004e33]' },
]

const INSIGHTS = [
  { id: 1, title: 'IA: Expiration Proche', desc: 'Votre passeport expire dans 15 jours. Voulez-vous renouveler ?', type: 'warning' },
  { id: 2, title: 'IA: Suggestion', desc: 'J\'ai trouvé 4 nouvelles factures dans vos emails. Les ajouter ?', type: 'info' },
]

const Dashboard = ({ onAddClick }) => {
  return (
    <div className="space-y-10">
      {/* Search Header */}
      <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl backdrop-blur-xl border border-white/20">
        <div className="flex items-center gap-3 text-[#434654]">
          <Search size={20} />
          <span className="text-sm font-body">Rechercher avec l'IA...</span>
        </div>
        <div className="w-10 h-10 bg-white rounded-full flex-center text-[#003d9b] shadow-sm">
          <Bell size={20} />
        </div>
      </div>

      {/* Hero Welcome */}
      <section className="mt-8">
        <h1 className="font-headline text-4xl font-extrabold text-[#191c1e] leading-tight">
          Bonjour, <span className="text-[#0052cc]">Sébastien</span> 🛡️
        </h1>
        <p className="text-[#434654] font-body mt-2">Votre sanctuaire est parfaitement sécurisé.</p>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {SUMMARY.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-3xl flex flex-col items-center gap-3 shadow-soft border border-white/50">
             <div className={`p-2 rounded-xl ${item.color}`}>
                {item.icon}
             </div>
             <div className="text-center">
                <div className="text-2xl font-headline font-bold text-[#191c1e]">{item.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#434654]">{item.label}</div>
             </div>
          </div>
        ))}
      </div>

      {/* IA Insights & Suggestions */}
      <section className="space-y-4">
        <h2 className="font-headline text-xl font-bold flex items-center gap-2">
          Insights IA <div className="w-2 h-2 bg-[#0052cc] rounded-full animate-pulse" />
        </h2>
        
        {INSIGHTS.map((insight) => (
          <div key={insight.id} className="bg-white p-5 rounded-[2rem] border border-white/50 shadow-soft group active:scale-95 transition-all">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${insight.type === 'warning' ? 'bg-[#fee2e2] text-[#ba1a1a]' : 'bg-[#dae2ff] text-[#003d9b]'}`}>
                {insight.type === 'warning' ? <AlertCircle size={24} /> : <Zap size={24} />}
              </div>
              <div className="flex-1">
                <h3 className="font-headline font-bold text-lg">{insight.title}</h3>
                <p className="text-sm text-[#434654] mt-1 leading-relaxed">{insight.desc}</p>
                <button className="text-[#0052cc] text-sm font-bold mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Voir <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Quick Action Overlay Section */}
      <section className="bg-gradient-to-br from-[#003d9b] to-[#001848] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h2 className="font-headline text-2xl font-bold mb-4">Mode Urgence</h2>
          <p className="text-white/70 mb-6 text-sm">Préparez vos documents critiques pour un accès immédiat en cas d'urgence.</p>
          <button className="bg-white text-[#003d9b] px-6 py-3 rounded-2xl font-headline font-bold flex items-center gap-2 shadow-xl hover:bg-[#eceef0] transition-colors">
            Activer l'accès <Plus size={18} />
          </button>
        </div>
        
        {/* Decorator */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <Shield size={120} className="absolute bottom-0 right-0 text-white/5 -mb-6 -mr-6 transform rotate-12" />
      </section>
      
      {/* Spacing for Bottom Nav */}
      <div className="h-10" />

      <style>{`
        .shadow-soft {
          box-shadow: 0 4px 20px rgba(25, 28, 30, 0.04);
        }
      `}</style>
    </div>
  )
}

// Internal FolderOpen import workaround
const FolderOpen = ({ size, className }) => <span className={className}><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.94a2 2 0 0 1 1.76.9l1.14 2.22A2 2 0 0 0 12.6 7H19a2 2 0 0 1 2 2v1"/><path d="M6 14H4"/></svg></span>

const Bell = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>

export default Dashboard
