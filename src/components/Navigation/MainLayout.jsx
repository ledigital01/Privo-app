import React from 'react'
import BottomNav from './BottomNav'

const MainLayout = ({ children, onAddClick }) => {
  return (
    <div className="min-h-screen bg-[#f7f9fb] pb-32">
      {/* Global Page Header (Optional, or page-specific) */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#dae2ff] to-[#f7f9fb] opacity-40 pointer-events-none -z-10" />
      
      <main className="px-6 pt-12 pb-24">
        {children}
      </main>

      <BottomNav onAddClick={onAddClick} />
    </div>
  )
}

export default MainLayout
