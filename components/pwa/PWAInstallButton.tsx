'use client'

import { usePWA } from '@/hooks/usePWA'

export default function PWAInstallButton() {
  const { isInstallable, isInstalled, isOffline, installPrompt } = usePWA()

  if (isInstalled || !isInstallable) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      animation: 'slideUp 0.3s ease-out'
    }}>
      <button
        onClick={installPrompt}
        style={{
          padding: '12px 20px',
          backgroundColor: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>📱</span>
        앱 설치하기
      </button>
      
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}