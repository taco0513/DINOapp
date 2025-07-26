import type { Metadata, Viewport } from 'next'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'
import MainLayout from '@/components/layout/MainLayout'
import MonitoringProvider from '@/components/providers/MonitoringProvider'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0066cc',
  colorScheme: 'light',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://dinoapp.net'),
  title: {
    default: 'DINO - Digital Nomad Visa Tracker',
    template: '%s | DINO'
  },
  description: '디지털 노마드를 위한 스마트 비자 추적 및 여행 관리 플랫폼. 셰겐 90/180일 규칙 자동 계산, Gmail 통합, 여행 기록 관리.',
  keywords: [
    'digital nomad', 'visa tracker', 'travel management', 'schengen calculator',
    '디지털노마드', '비자추적', '여행관리', '셰겐계산기', '90/180일규칙',
    'visa management', 'travel planner', 'nomad tools', 'visa compliance',
    'travel automation', 'gmail integration', 'calendar sync'
  ],
  authors: [{ name: 'DINO Team', url: 'https://dinoapp.net' }],
  creator: 'DINO Team',
  publisher: 'DINO',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DINO',
    startupImage: [
      {
        url: '/icons/icon-512x512.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)'
      },
      {
        url: '/icons/icon-384x384.png', 
        media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)'
      },
      {
        url: '/icons/icon-192x192.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)'
      }
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: ['en_US'],
    url: 'https://dinoapp.net',
    siteName: 'DINO',
    title: 'DINO - Digital Nomad Visa Tracker',
    description: '디지털 노마드를 위한 스마트 비자 추적 및 여행 관리 플랫폼. 셰겐 90/180일 규칙 자동 계산, Gmail 통합.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DINO - Digital Nomad Visa Tracker',
        type: 'image/png',
      },
      {
        url: '/og-image-square.png',
        width: 400,
        height: 400,
        alt: 'DINO App Icon',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dinoapp',
    creator: '@dinoapp',
    title: 'DINO - Digital Nomad Visa Tracker',
    description: '디지털 노마드를 위한 스마트 비자 추적 및 여행 관리 플랫폼',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
  },
  category: 'productivity',
  classification: 'Travel & Productivity Tool',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'DINO',
    'application-name': 'DINO',
    'msapplication-TileColor': '#0066cc',
    'msapplication-TileImage': '/icons/icon-144x144.png',
    'msapplication-config': 'none',
    'theme-color': '#0066cc',
    'color-scheme': 'light',
    'format-detection': 'telephone=no',
    'apple-touch-fullscreen': 'yes',
    'apple-mobile-web-app-orientation': 'portrait'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <MonitoringProvider>
          <SessionProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </SessionProvider>
        </MonitoringProvider>
      </body>
    </html>
  )
}