import React from 'react'
import { Share2, Info, Download, Trash2, Edit2, ShieldCheck, ChevronLeft, Calendar, FileText, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const DocumentDetail = ({ doc, onBack, onShare, onSummary, onDelete }) => {
  if (!doc) return null

  return (
    <div className="space-y-10 pb-32">
      {/* Header with Back button */}
      <header className="flex justify-between items-center bg-white/40 p-4 rounded-2xl backdrop-blur-xl border border-white/20">
        <button onClick={onBack} className="p-2 bg-white rounded-full text-[#003d9b] shadow-sm active:scale-90 transition-all">
          <ChevronLeft size={24} />
        </button>
        <span className="font-headline font-bold text-lg text-[#191c1e]">Détail Document</span>
        <button className="p-2 bg-white rounded-full text-[#434654] shadow-sm active:scale-90 transition-all">
          <Edit2 size={20} />
        </button>
      </header>

      {/* Document Preview Card */}
      <section className="relative group">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-white/30 overflow-hidden relative"
        >
          {/* Skeleton/Placeholder for File Preview (e.g. Identity Card) */}
          <div className="bg-[#f2f4f6] aspect-[16/10] rounded-[1.5rem] flex-center flex-col gap-3 group-hover:bg-[#dae2ff] transition-colors relative overflow-hidden">
             <div className="absolute top-4 right-4 bg-[#6ffbbe] text-[#004e33] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={12} /> Sécurisé
             </div>
             
             <div className="w-16 h-16 bg-white/50 backdrop-blur-xl rounded-2xl flex-center text-[#003d9b]">
               {doc.icon}
             </div>
             <div className="text-[#434654] text-xs font-bold uppercase tracking-widest leading-none">Aperçu Haute Qualité</div>
          </div>
          
          {/* Decorative Security Seal overlay */}
          <div className="absolute bottom-10 right-10 opacity-5 -z-1 pointer-events-none">
            <ShieldCheck size={200} />
          </div>
        </motion.div>
      </section>

      {/* Document Info Metadata - Tonal Layering */}
      <section className="space-y-6 px-2">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-[#191c1e]">{doc.title}</h1>
          <p className="text-[#434654] font-body mt-1">Identité Officielle • Français</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-white/50 shadow-soft">
             <div className="text-[10px] font-bold uppercase tracking-wider text-[#434654] mb-1.5 flex items-center gap-2">
               <Calendar size={12} className="text-[#0052cc]" /> Date d'expiration
             </div>
             <div className="text-lg font-headline font-bold text-[#191c1e]">{doc.date}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-white/50 shadow-soft">
             <div className="text-[10px] font-bold uppercase tracking-wider text-[#434654] mb-1.5 flex items-center gap-2">
               <FileText size={12} className="text-[#0052cc]" /> Type
             </div>
             <div className="text-lg font-headline font-bold text-[#191c1e]">{doc.type}</div>
          </div>
        </div>
      </section>

      {/* Action Grid - Modals triggers */}
      <section className="grid grid-cols-2 gap-4">
        <button 
          onClick={onShare}
          className="bg-white p-6 rounded-[2rem] border border-white/50 shadow-soft flex flex-col items-center gap-4 group active:scale-95 transition-all"
        >
           <div className="p-4 bg-[#eceef0] rounded-2xl text-[#434654] group-hover:bg-[#003d9b] group-hover:text-white transition-colors">
              <Share2 size={24} />
           </div>
           <span className="font-headline font-bold text-sm tracking-wide">Partager</span>
        </button>

        <button 
          onClick={onSummary}
          className="bg-white p-6 rounded-[2rem] border border-white/50 shadow-soft flex flex-col items-center gap-4 group active:scale-95 transition-all"
        >
           <div className="p-4 bg-[#dae2ff] rounded-2xl text-[#003d9b] group-hover:bg-[#0052cc] group-hover:text-white transition-colors">
              <Zap size={24} />
           </div>
           <span className="font-headline font-bold text-sm tracking-wide">Résumé IA</span>
        </button>

        <button className="bg-white p-6 rounded-[2rem] border border-white/50 shadow-soft flex flex-col items-center gap-4 group active:scale-95 transition-all">
           <div className="p-4 bg-[#eceef0] rounded-2xl text-[#434654] group-hover:bg-[#003d9b] group-hover:text-white transition-colors">
              <Download size={24} />
           </div>
           <span className="font-headline font-bold text-sm tracking-wide">Télécharger</span>
        </button>

        <button 
          onClick={onDelete}
          className="bg-white p-6 rounded-[2rem] border border-[#fee2e2]/50 shadow-soft flex flex-col items-center gap-4 group active:scale-95 transition-all hover:bg-[#fee2e2]/20"
        >
           <div className="p-4 bg-[#fee2e2] rounded-2xl text-[#ba1a1a] group-hover:bg-[#ba1a1a] group-hover:text-white transition-colors">
              <Trash2 size={24} />
           </div>
           <span className="font-headline font-bold text-sm tracking-wide text-[#ba1a1a]">Supprimer</span>
        </button>
      </section>

      {/* Security Info Card */}
      <div className="bg-[#f2f4f6]/50 p-6 rounded-[2rem] flex items-center gap-4 border border-white">
        <Info size={24} className="text-[#003d9b]" />
        <p className="text-xs text-[#434654] leading-relaxed">Ce document est protégé par un chiffrement AES-256 bits et n'est accessible que via votre clé biométrique privée.</p>
      </div>

    </div>
  )
}

export default DocumentDetail
