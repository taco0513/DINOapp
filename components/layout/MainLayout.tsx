'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import FeedbackButton from '@/components/feedback/FeedbackButton';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // const _isLandingPage = pathname === '/';
  // const _isAuthenticatedArea = session && pathname !== '/';

  return (
    <>
      <OfflineIndicator />

      <div className='min-h-screen flex flex-col'>
        {/* Always show header */}
        <Header />

        <main className='flex-1'>{children}</main>

        {/* Always show footer */}
        <Footer />

        <FeedbackButton />
      </div>
    </>
  );
}
