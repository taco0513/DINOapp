'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  badge?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: '무료 플랜',
    price: 0,
    period: 'month',
    description: '개인 여행자를 위한 기본 기능',
    features: [
      '기본 여행 기록 (최대 10개)',
      '셰겐 계산기',
      '기본 알림',
      '웹 앱 액세스',
    ],
    limitations: [
      'Gmail 통합 제한 (월 100회)',
      '데이터 내보내기 불가',
      '고급 분석 불가',
    ],
  },
  {
    id: 'pro-monthly',
    name: '프로 월간',
    price: 9,
    period: 'month',
    description: '디지털 노마드를 위한 전체 기능',
    features: [
      '무제한 여행 기록',
      '완전한 Gmail 통합',
      'Google Calendar 동기화',
      '고급 분석 및 인사이트',
      '데이터 내보내기',
      '우선 고객 지원',
      '모바일 앱 (출시 시)',
    ],
    popular: true,
    badge: '가장 인기',
  },
  {
    id: 'pro-yearly',
    name: '프로 연간',
    price: 90,
    period: 'year',
    description: '연간 할인으로 더 저렴하게',
    features: [
      '무제한 여행 기록',
      '완전한 Gmail 통합',
      'Google Calendar 동기화',
      '고급 분석 및 인사이트',
      '데이터 내보내기',
      '우선 고객 지원',
      '모바일 앱 (출시 시)',
      '연간 25% 할인',
    ],
    badge: '25% 절약',
  },
];

interface PricingCardProps {
  plan: PricingPlan;
  currentPlan?: string;
  onSelectPlan: (planId: string) => void;
  loading?: boolean;
}

export function PricingCard({
  plan,
  currentPlan,
  onSelectPlan,
  loading,
}: PricingCardProps) {
  const _isCurrentPlan = currentPlan === plan.id;
  const isPopular = plan.popular;

  return (
    <Card
      className={`relative p-6 ${isPopular ? 'border-2 border-primary shadow-lg' : ''}`}
    >
      {/* 인기/할인 배지 */}
      {plan.badge && (
        <Badge
          className={`absolute -top-2 left-1/2 transform -translate-x-1/2 ${
            isPopular ? 'bg-primary text-white' : 'bg-yellow-500 text-white'
          }`}
        >
          {plan.badge}
        </Badge>
      )}

      {/* 플랜 헤더 */}
      <div className='text-center mb-6'>
        <h3 className='text-xl font-semibold mb-2'>{plan.name}</h3>
        <div className='mb-2'>
          <span className='text-3xl font-bold'>${plan.price}</span>
          <span className='text-gray-600'>
            /{plan.period === 'month' ? '월' : '년'}
          </span>
        </div>
        <p className='text-sm text-gray-600'>{plan.description}</p>
      </div>

      {/* 기능 목록 */}
      <div className='mb-6'>
        <ul className='space-y-2'>
          {plan.features.map((feature, index) => (
            <li key={index} className='flex items-start'>
              <span className='text-green-500 mr-2 mt-0.5'>✓</span>
              <span className='text-sm'>{feature}</span>
            </li>
          ))}
        </ul>

        {/* 제한사항 (무료 플랜만) */}
        {plan.limitations && (
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <ul className='space-y-2'>
              {plan.limitations.map((limitation, index) => (
                <li key={index} className='flex items-start'>
                  <span className='text-gray-400 mr-2 mt-0.5'>-</span>
                  <span className='text-sm text-gray-600'>{limitation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <Button
        onClick={() => onSelectPlan(plan.id)}
        disabled={loading || isCurrentPlan}
        className={`w-full ${
          isCurrentPlan
            ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
            : isPopular
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
        variant={isCurrentPlan ? 'outline' : isPopular ? 'default' : 'outline'}
      >
        {loading ? '처리 중...' : isCurrentPlan ? '현재 플랜' : '시작하기'}
      </Button>

      {/* 무료 평가판 안내 */}
      {plan.price > 0 && (
        <p className='text-xs text-center text-gray-500 mt-3'>
          7일 무료 평가판 • 언제든 취소 가능
        </p>
      )}
    </Card>
  );
}

export default function PricingSection() {
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free'); // 실제로는 사용자 상태에서 가져옴

  const _handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      // 무료 플랜은 즉시 전환
      setCurrentPlan(planId);
      return;
    }

    setLoading(true);
    try {
      // Stripe Checkout으로 리다이렉트
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('결제 페이지 생성에 실패했습니다.');
      }
    } catch (error) {
      alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='py-12'>
      <div className='text-center mb-12'>
        <h2 className='text-3xl font-bold mb-4'>간단하고 투명한 가격</h2>
        <p className='text-gray-600 max-w-2xl mx-auto'>
          복잡한 비자 걱정 없이 여행을 즐기세요. 언제든 플랜을 변경하거나 취소할
          수 있습니다.
        </p>
      </div>

      <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4'>
        {pricingPlans.map(plan => (
          <PricingCard
            key={plan.id}
            plan={plan}
            currentPlan={currentPlan}
            onSelectPlan={handleSelectPlan}
            loading={loading}
          />
        ))}
      </div>

      {/* FAQ 섹션 */}
      <div className='mt-16 max-w-3xl mx-auto px-4'>
        <h3 className='text-2xl font-bold text-center mb-8'>자주 묻는 질문</h3>
        <div className='space-y-6'>
          <div>
            <h4 className='font-semibold mb-2'>무료 평가판이 있나요?</h4>
            <p className='text-gray-600'>
              네! 모든 유료 플랜에 7일 무료 평가판이 포함되어 있습니다.
              신용카드가 필요하지만 평가판 기간 중 취소하면 요금이 청구되지
              않습니다.
            </p>
          </div>
          <div>
            <h4 className='font-semibold mb-2'>언제든 취소할 수 있나요?</h4>
            <p className='text-gray-600'>
              물론입니다. 언제든 계정 설정에서 구독을 취소할 수 있으며, 현재
              결제 기간이 끝날 때까지 서비스를 계속 이용할 수 있습니다.
            </p>
          </div>
          <div>
            <h4 className='font-semibold mb-2'>데이터는 안전한가요?</h4>
            <p className='text-gray-600'>
              사용자 데이터 보안이 최우선입니다. 모든 데이터는 암호화되어
              저장되며, Google API는 최소 권한 원칙에 따라 필요한 권한만
              요청합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
