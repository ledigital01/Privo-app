import React from 'react'
import { Home, FolderOpen, Plus, User, Bell } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const BottomNav = ({ onAddClick }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: <Home size={24} />, label: 'Accueil', path: '/' },
    { icon: <FolderOpen size={24} />, label: 'Documents', path: '/documents' },
    { isAction: true },
    { icon: <Bell size={24} />, label: 'Alertes', path: '/notifications' },
    { icon: <User size={24} />, label: 'Profil', path: '/profile' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-white/20 pb-8 pt-3 px-6 flex justify-between items-center z-50">
      {navItems.map((item, index) => {
        if (item.isAction) {
          return (
            <button
              key="add-btn"
              onClick={onAddClick}
              className="bg-gradient-to-br from-[#003d9b] to-[#0052cc] w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transform -translate-y-6 active:scale-95 transition-all"
              style={{ boxShadow: '0 8px 16px rgba(0, 61, 155, 0.2)' }}
            >
              <Plus size={32} />
            </button>
          )
        }

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive(item.path) ? 'text-[#003d9b]' : 'text-[#434654]'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive(item.path) ? 'bg-[#eceef0]' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
