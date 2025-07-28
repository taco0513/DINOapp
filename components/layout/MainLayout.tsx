'use client'

import { useSession } from 'next-auth/react'
import Header from './Header'
import Footer from './Footer'
import PWAInstallButton from '@/components/pwa/PWAInstallButton'
import OfflineIndicator from '@/components/pwa/OfflineIndicator'
import MobileBottomNav from '@/components/mobile/MobileBottomNav'
import FeedbackButton from '@/components/feedback/FeedbackButton'
import { useState } from 'react'
import { Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { data: session, status } = useSession()

  return (
    <>
      <OfflineIndicator />
      
      {/* Always show layout with header and footer */}
      <div className="min-h-screen flex flex-col" style={{ paddingBottom: '60px' }}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
        <PWAInstallButton />
        <FeedbackButton />
        
        {/* AI 도구 Floating Button */}
        <div className="fixed bottom-20 right-4 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="lg"
                className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Sparkles className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>AI 개발 도구</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/ai" className="cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4" />
                  전체 AI 도구
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="text-xs text-muted-foreground">
                  AI와 함께 10x 생산성 향상
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}