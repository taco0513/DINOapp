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
      bottom: 'var(--space-5)',
      right: 'var(--space-5)',
      zIndex: 1000,
      animation: 'slideUp var(--transition-slow) ease-out'
    }}>
      <button
        onClick={installPrompt}
        className="btn btn-primary"
        style={{
          padding: 'var(--space-3) var(--space-5)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
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