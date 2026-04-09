import React, { useRef, useState } from 'react'

/**
 * BottomSheet — Reusable bottom sheet with swipe-to-close gesture.
 * Usage:
 *   <BottomSheet isOpen={isOpen} onClose={onClose} height="80vh">
 *     ...content...
 *   </BottomSheet>
 */
const BottomSheet = ({ isOpen, onClose, height = 'auto', maxHeight = '92vh', style = {}, children }) => {
  const dragStartY = useRef(null)
  const [dragOffset, setDragOffset] = useState(0)

  const onTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY
    setDragOffset(0)
  }
  const onTouchMove = (e) => {
    if (dragStartY.current === null) return
    const delta = e.touches[0].clientY - dragStartY.current
    if (delta > 0) setDragOffset(delta)
  }
  const onTouchEnd = () => {
    if (dragOffset > 80) onClose()
    setDragOffset(0)
    dragStartY.current = null
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ zIndex: 200 }}
    >
      <div
        className="modal-sheet"
        onClick={e => e.stopPropagation()}
        style={{
          ...style,
          height,
          maxHeight,
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(${dragOffset}px)`,
          transition: dragOffset === 0
            ? 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
            : 'none',
        }}
      >
        {/* Draggable handle */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={onClose}
          style={{
            padding: '14px 0 6px',
            display: 'flex',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'none',
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 40,
            height: 5,
            borderRadius: 999,
            background: 'rgba(0, 61, 155, 0.15)',
          }} />
        </div>

        {children}
      </div>
    </div>
  )
}

export default BottomSheet
