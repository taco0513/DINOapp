'use client'

import { useEffect, useState } from 'react'

interface ActionSheetOption {
  id: string
  label: string
  icon?: string
  action: () => void
  destructive?: boolean
}

interface MobileActionSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  options: ActionSheetOption[]
}

export default function MobileActionSheet({
  isOpen,
  onClose,
  title,
  options
}: MobileActionSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // 스크롤 방지
      document.body.style.overflow = 'hidden'
    } else {
      setTimeout(() => setIsAnimating(false), 300)
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isAnimating && !isOpen) return null

  return (
    <>
      {/* 백드롭 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
        onClick={onClose}
      />

      {/* 액션 시트 */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderRadius: '16px 16px 0 0',
          zIndex: 1001,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          paddingBottom: 'env(safe-area-inset-bottom, 20px)'
        }}
      >
        {/* 핸들 */}
        <div
          style={{
            width: '40px',
            height: '4px',
            backgroundColor: '#ccc',
            borderRadius: '2px',
            margin: '12px auto 20px auto'
          }}
        />

        {/* 제목 */}
        {title && (
          <div
            style={{
              padding: '0 20px 16px 20px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              textAlign: 'center',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            {title}
          </div>
        )}

        {/* 옵션들 */}
        <div>
          {options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => {
                option.action()
                onClose()
              }}
              style={{
                width: '100%',
                padding: '16px 20px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: index < options.length - 1 ? '1px solid #f0f0f0' : 'none',
                fontSize: '16px',
                color: option.destructive ? '#ff3b30' : '#000',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {option.icon && <span>{option.icon}</span>}
              {option.label}
            </button>
          ))}
        </div>

        {/* 취소 버튼 */}
        <div style={{ padding: '10px 20px 0 20px' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#000',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0'
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.backgroundColor = '#fff'
            }}
          >
            취소
          </button>
        </div>
      </div>
    </>
  )
}