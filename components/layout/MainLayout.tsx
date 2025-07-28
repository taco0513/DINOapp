'use client'

import { useSession } from 'next-auth/react'
import Header from './Header'
import PWAInstallButton from '@/components/pwa/PWAInstallButton'
import OfflineIndicator from '@/components/pwa/OfflineIndicator'
import MobileBottomNav from '@/components/mobile/MobileBottomNav'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { data: session, status } = useSession()

  return (
    <>
      <OfflineIndicator />
      
      {/* Always show layout with header */}
      <div className="min-h-screen" style={{ paddingBottom: '60px' }}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <MobileBottomNav />
        <PWAInstallButton />
      </div>
    </>
  )
}