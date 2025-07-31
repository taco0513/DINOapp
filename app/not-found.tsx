import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-5'>
      <div className='max-w-sm text-center p-10 border border-border rounded-lg bg-card'>
        <h1 className='text-5xl font-bold mb-4 text-foreground'>404</h1>

        <h2 className='text-2xl font-bold mb-4 text-foreground'>
          페이지를 찾을 수 없습니다
        </h2>

        <p className='text-base text-muted-foreground mb-6 leading-normal'>
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        <div className='flex gap-3 justify-center'>
          <Link
            href='/'
            className='bg-primary text-primary-foreground no-underline px-6 py-3 text-sm rounded-sm inline-block hover:bg-primary/90 transition-colors'
          >
            홈으로 이동
          </Link>

          <Link
            href='/dashboard'
            className='bg-background text-foreground border border-primary no-underline px-6 py-3 text-sm rounded-sm inline-block hover:bg-muted transition-colors'
          >
            대시보드
          </Link>
        </div>

        <div className='mt-6 pt-6 border-t border-border'>
          <p className='text-sm text-muted-foreground mb-2'>
            도움이 필요하신가요?
          </p>
          <Link
            href='mailto:support@dino-app.com'
            className='text-accent no-underline text-sm hover:underline'
          >
            고객 지원 문의
          </Link>
        </div>
      </div>
    </div>
  );
}
