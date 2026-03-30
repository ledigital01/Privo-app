import React, { useState } from 'react'
import { Search, Filter, MoreVertical, FileText, User, CreditCard, ChevronRight, Share2, Info, Download, Trash2, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORIES = ['Tous', 'Identité', 'Finance', 'Santé', 'Contrats', 'Études']

const DOCUMENTS = [
  { id: 1, title: 'Carte d\'Identité', type: 'Identité', status: 'Secure', date: 'Exp. 2029', icon: <User size={24}/> },
  { id: 2, title: 'Permis de Conduire', type: 'Identité', status: 'Verify', date: 'Exp. 2032', icon: <User size={24}/> },
  { id: 3, title: 'Contrat de Bail', type: 'Contrats', status: 'Secure', date: 'Modifié hier', icon: <FileText size={24}/> },
  { id: 4, title: 'Visa Schengen', type: 'Identité', status: 'Warning', date: 'Exp. 15j', icon: <User size={24}/> },
  { id: 5, title: 'Fiche de Paie Mars', type: 'Finance', status: 'Secure', date: 'Payé', icon: <CreditCard size={24}/> },
  { id: 6, title: 'Certificat Bachelor', type: 'Études', status: 'Secure', date: 'Diplôme', icon: <FileText size={24}/> },
]

const Library = ({ onDocClick }) => {
  const [selectedCat, setSelectedCat] = useState('Tous')

  const filteredDocs = selectedCat === 'Tous' 
    ? DOCUMENTS 
    : DOCUMENTS.filter(doc => doc.type === selectedCat)

  return (
    <div className="space-y-8 pb-32">
      {/* Header Section */}
      <section>
        <h1 className="font-headline text-4xl font-extrabold text-[#191c1e] leading-tight">
          Votre <span className="text-[#0052cc]">Bibliothèque</span>
        </h1>
        <p className="text-[#434654] font-body mt-1">Gérez et organisez vos documents critiques.</p>
      </section>

      {/* Floating Action Search */}
      <div className="sticky top-4 z-40 bg-white/60 backdrop-blur-2xl rounded-[1.5rem] p-3 flex items-center gap-3 shadow-lg border border-white/20">
         <div className="flex-1 flex items-center gap-3 px-3">
            <Search size={20} className="text-[#003d9b]" />
            <input 
              type="text" 
              placeholder="Recherche intelligente..." 
              className="bg-transparent border-none outline-none w-full font-body text-sm"
            />
         </div>
         <button className="p-3 bg-[#eceef0] rounded-xl text-[#434654] active:scale-95 transition-all">
            <Filter size={20} />
         </button>
      </div>

      {/* horizontal Categories - Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-5 py-2.5 rounded-full font-headline font-bold text-xs whitespace-nowrap transition-all ${
              selectedCat === cat 
                ? 'bg-[#003d9b] text-white shadow-md' 
                : 'bg-white text-[#434654] border border-white/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents Grid / List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDocs.map((doc, idx) => (
          <motion.div 
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onDocClick(doc)}
            className="bg-white p-5 rounded-[2rem] border border-white/50 shadow-soft group active:scale-95 transition-all flex items-center gap-4 relative overflow-hidden"
          >
            {/* Status Decoration Bar (Subtle) */}
            <div className={`absolute top-0 left-0 bottom-0 w-1 ${
              doc.status === 'Warning' ? 'bg-[#ba1a1a]' : 'bg-[#6ffbbe]'
            }`} />

            <div className={`w-14 h-14 rounded-2xl flex-center ${
              doc.status === 'Warning' ? 'bg-[#fee2e2] text-[#ba1a1a]' : 'bg-[#dae2ff] text-[#003d9b]'
            }`}>
              {doc.icon}
            </div>

            <div className="flex-1">
               <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-lg leading-none">{doc.title}</h3>
                  {doc.status === 'Secure' && <ShieldCheck size={16} className="text-[#004e33]" />}
               </div>
               <div className="flex items-center gap-3 mt-1.5 ">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#434654]/60">{doc.type}</span>
                  <div className="w-1 h-1 bg-[#eceef0] rounded-full" />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    doc.status === 'Warning' ? 'text-[#ba1a1a]' : 'text-[#434654]'
                  }`}>
                    {doc.date}
                  </span>
               </div>
            </div>

            <ChevronRight size={20} className="text-[#eceef0] group-hover:translate-x-1 transition-all" />
          </motion.div>
        ))}
      </div>

    </div>
  )
}

export default Library
