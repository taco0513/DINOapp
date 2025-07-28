'use client'

import { usePWA } from '@/hooks/usePWA'

export default function OfflineIndicator() {
  const { isOffline } = usePWA()

  if (!isOffline) {
    return null
  }

  return (
    <div 
      className="alert-warning"
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        padding: 'var(--space-2) var(--space-5)',
        textAlign: 'center',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        zIndex: 9999,
        animation: 'slideDown var(--transition-slow) ease-out'
      }}
    >
      <span style={{ marginRight: 'var(--space-2)' }}>🌐</span>
      오프라인 모드 - 캐시된 데이터를 사용 중입니다
      
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
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