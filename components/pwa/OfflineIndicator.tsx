'use client'

import { usePWA } from '@/hooks/usePWA'

export default function OfflineIndicator() {
  const { isOffline } = usePWA()

  if (!isOffline) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      backgroundColor: '#ffa500',
      color: '#fff',
      padding: '8px 20px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 9999,
      animation: 'slideDown 0.3s ease-out'
    }}>
      <span style={{ marginRight: '8px' }}>🌐</span>
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