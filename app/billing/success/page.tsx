import Link from 'next/link';
export const metadata: Metadata = {
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

  title: '결제 완료 - DINO',
  description: '결제가 성공적으로 완료되었습니다.',
};

interface PageProps {
  searchParams: {
    session_id?: string;
    plan?: string;
    mock?: string;
  };
}

export default function BillingSuccessPage({ searchParams }: PageProps) {
  const { session_id, plan, mock } = searchParams;
  const isMockPayment = mock === 'true';

  const getPlanName = (planId?: string) => {
    switch (planId) {
      case 'pro-monthly': return '프로 월간 플랜';
      case 'pro-yearly': return '프로 연간 플랜';
      default: return '프로 플랜';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {/* 성공 아이콘 */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isMockPayment ? '결제 시뮬레이션 완료!' : '결제 완료!'}
        </h1>

        {/* 설명 */}
        <p className="text-gray-600 mb-6">
          {isMockPayment 
            ? `${getPlanName(plan)} 가입이 시뮬레이션되었습니다. 개발 환경에서는 실제 결제가 진행되지 않습니다.`
            : `${getPlanName(plan)} 가입이 완료되었습니다. 이제 모든 프리미엄 기능을 사용할 수 있습니다.`
          }
        </p>

        {/* 세션 ID (실제 결제 시에만) */}
        {session_id && !isMockPayment && (
          <div className="bg-gray-100 p-3 rounded-md mb-6">
            <p className="text-xs text-gray-500 mb-1">결제 ID</p>
            <p className="font-mono text-sm text-gray-700">{session_id}</p>
          </div>
        )}

        {/* 다음 단계 안내 */}
        <div className="space-y-4 mb-8">
          <div className="text-left">
            <h3 className="font-semibold mb-3">다음 단계:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                Gmail과 Calendar 완전 통합 사용 가능
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                무제한 여행 기록 및 고급 분석
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✓</span>
                우선 고객 지원 및 모든 프리미엄 기능
              </li>
              {!isMockPayment && (
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">→</span>
                  결제 영수증이 이메일로 발송됩니다
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full bg-primary text-white hover:bg-primary/90">
              대시보드로 이동
            </Button>
          </Link>
          <Link href="/docs/getting-started">
            <Button variant="outline" className="w-full">
              프리미엄 기능 가이드 보기
            </Button>
          </Link>
        </div>

        {/* 고객 지원 정보 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            문제가 있으시거나 도움이 필요하시면{' '}
            <Link href="/contact" className="text-primary hover:underline">
              고객 지원팀
            </Link>
            에 문의하세요.
          </p>
        </div>

        {/* 개발 환경 안내 */}
        {isMockPayment && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              🚧 개발 환경에서는 실제 결제가 진행되지 않습니다. 
              프로덕션에서는 Stripe 실제 결제가 진행됩니다.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}