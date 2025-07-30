'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import IOSNavigation from '@/components/navigation/IOSNavigation';
import IOSTabBar from '@/components/navigation/IOSTabBar';
import PWAInstallButton from '@/components/pwa/PWAInstallButton';
import OfflineIndicator from '@/components/pwa/OfflineIndicator';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // 랜딩 페이지에서는 iOS 네비게이션을 숨김
  const isLandingPage = pathname === '/';
  const isAuthenticatedArea = session && pathname !== '/';

  return (
    <>
      <OfflineIndicator />

      {/* iOS-style Layout */}
      <div className='min-h-screen flex flex-col bg-white'>
        {/* iOS Navigation - 로그인된 사용자에게만 보임 */}
        {isAuthenticatedArea && <IOSNavigation />}

        {/* Landing page shows old header, authenticated pages use iOS nav */}
        {isLandingPage && <Header />}

        <main
          className={`flex-1 ${isAuthenticatedArea ? 'pb-20 md:pb-6' : ''}`}
        >
          {children}
        </main>

        {/* 랜딩 페이지에서만 Footer 표시 */}
        {isLandingPage && <Footer />}

        {/* iOS Tab Bar - 모바일에서 로그인된 사용자에게만 보임 */}
        {isAuthenticatedArea && <IOSTabBar />}

        <PWAInstallButton />
        <FeedbackButton />

        {/* AI 도구 Floating Button - 로그인된 사용자에게만 보임 */}
        {isAuthenticatedArea && (
          <div className='fixed bottom-24 right-4 z-40 md:bottom-20'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size='lg'
                  className='rounded-full w-12 h-12 shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-0'
                >
                  <Sparkles className='h-5 w-5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-56 ios-card border-0'
              >
                <DropdownMenuLabel className='text-body'>
                  AI 개발 도구
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href='/ai' className='cursor-pointer text-body'>
                    <Sparkles className='mr-2 h-4 w-4' />
                    전체 AI 도구
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className='text-caption text-secondary'>
                    AI와 함께 10x 생산성 향상
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </>
  );
}
