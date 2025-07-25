'use client'

import { useSession } from 'next-auth/react'
import Header from './Header'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { data: session, status } = useSession()

  // Don't show layout for unauthenticated users
  if (!session && status !== 'loading') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}