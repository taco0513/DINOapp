import type { Metadata, Viewport } from 'next'
import './globals.css'
import '../styles/mobile-touch.css'
import SessionProvider from '@/components/providers/SessionProvider'
import MainLayout from '@/components/layout/MainLayout'
import MonitoringProvider from '@/components/providers/MonitoringProvider'
import PWAInstallButton from '@/components/pwa/PWAInstallButton'
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'
import Script from 'next/script'
import { AnalyticsWrapper } from '@/lib/analytics/vercel'
import PerformanceMonitor from '@/components/performance/PerformanceMonitor'
import { SkipLink } from '@/components/ui/SkipLink'

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
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://www.googleapis.com" />
        <link rel="dns-prefetch" href="//accounts.google.com" />
        <link rel="dns-prefetch" href="//www.googleapis.com" />
        
        {/* Critical CSS should be inlined in production */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .loading-skeleton {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
            }
            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `
        }} />
      </head>
      <body className="min-h-screen safe-area-bottom">
        {/* Service Worker Registration */}
        <Script
          id="sw-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('SW registered'))
                    .catch(error => console.log('SW registration failed'))
                })
              }
            `
          }}
        />
        
        {/* Performance optimizations initialization */}
        <Script
          id="performance-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize performance optimizations
              (function() {
                // Preload critical resources
                const preloadCritical = () => {
                  const link1 = document.createElement('link');
                  link1.rel = 'preconnect';
                  link1.href = 'https://fonts.googleapis.com';
                  document.head.appendChild(link1);
                  
                  const link2 = document.createElement('link');
                  link2.rel = 'preconnect';
                  link2.href = 'https://fonts.gstatic.com';
                  link2.crossOrigin = 'anonymous';
                  document.head.appendChild(link2);
                };
                
                // Monitor Web Vitals
                if ('PerformanceObserver' in window) {
                  const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                      const metric = entry.entryType === 'largest-contentful-paint' ? 'lcp' :
                                   entry.entryType === 'first-input' ? 'fid' :
                                   entry.name === 'first-contentful-paint' ? 'fcp' : null;
                      
                      if (metric) {
                        const value = entry.entryType === 'first-input' ? 
                          entry.processingStart - entry.startTime : entry.startTime;
                        localStorage.setItem('dino-' + metric, value.toString());
                        
                        // Report to analytics if available
                        if (window.gtag) {
                          window.gtag('event', 'web_vitals', {
                            event_category: 'Performance',
                            event_label: metric.toUpperCase(),
                            value: Math.round(value)
                          });
                        }
                      }
                    });
                  });
                  
                  observer.observe({ 
                    entryTypes: ['largest-contentful-paint', 'first-input', 'paint'] 
                  });
                }
                
                preloadCritical();
              })();
            `
          }}
        />

        <SkipLink />
        <MonitoringProvider>
          <SessionProvider>
            <AnalyticsWrapper>
              <MainLayout>
                <main id="main-content" tabIndex={-1}>
                  {children}
                </main>
                <PWAInstallButton />
                <OfflineIndicator />
                <PerformanceMonitor 
                  enabled={process.env.NODE_ENV === 'development'} 
                  debug={false}
                />
              </MainLayout>
            </AnalyticsWrapper>
          </SessionProvider>
        </MonitoringProvider>
      </body>
    </html>
  )
}