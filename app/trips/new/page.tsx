'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { PageHeader, PageIcons } from '@/components/common/PageHeader';
import { t } from '@/lib/i18n';
import { HydrationSafeLoading } from '@/components/ui/HydrationSafeLoading';
import { ArrowLeft } from 'lucide-react';
import NewTripForm from '@/components/trips/NewTripForm';

export default function NewTripPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  const _handleSuccess = () => {
    router.push('/trips');
  };

  const handleCancel = () => {
    router.back();
  };

  if (status === 'loading' || !session) {
    return (
      <main
        className='flex items-center justify-center'
        style={{ minHeight: '100vh' }}
      >
        <HydrationSafeLoading />
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh' }}>
      <div
        className='container'
        style={{
          paddingTop: 'var(--space-6)',
          paddingBottom: 'var(--space-6)',
        }}
      >
        <PageHeader
          title='새 여행 추가'
          description='여행 정보를 입력하여 비자 추적을 시작하세요'
          icon={PageIcons.Trips}
          breadcrumbs={[
            { label: t('nav.dashboard'), href: '/dashboard' },
            { label: t('nav.trips'), href: '/trips' },
            { label: '새 여행 추가' },
          ]}
          action={
            <button
              onClick={handleCancel}
              className='btn btn-ghost'
              style={{ flexShrink: 0 }}
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              돌아가기
            </button>
          }
        />

        <div className='max-w-4xl mx-auto'>
          <Suspense
            fallback={
              <div className='card' style={{ padding: 'var(--space-8)' }}>
                <HydrationSafeLoading />
              </div>
            }
          >
            <NewTripForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
