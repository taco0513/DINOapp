import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'
import MainLayout from '@/components/layout/MainLayout'

export const metadata: Metadata = {
  title: 'DiNoCal - Digital Nomad Calendar',
  description: 'Smart visa tracking and travel management platform for digital nomads',
  keywords: ['digital nomad', 'visa tracker', 'travel management', 'schengen calculator'],
  authors: [{ name: 'DiNoCal Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'DiNoCal - Digital Nomad Calendar',
    description: 'Smart visa tracking and travel management platform for digital nomads',
    type: 'website',
    locale: 'en_US',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <SessionProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </SessionProvider>
      </body>
    </html>
  )
}