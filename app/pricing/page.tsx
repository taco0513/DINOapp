import { Metadata } from 'next';
import PricingSection from '@/components/billing/PricingCard';
import PageHeader from '@/components/ui/PageHeader';

export const metadata: Metadata = {
  title: '가격 - DINO',
  description: '디지털 노마드를 위한 여행 관리 서비스의 간단하고 투명한 가격 정책을 확인하세요.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="가격"
        description="복잡한 비자 걱정 없이 여행을 즐기세요"
      />
      
      <div className="container mx-auto px-4">
        <PricingSection />
      </div>

      {/* 추가 혜택 섹션 */}
      <div className="bg-gray-50 py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">모든 플랜에 포함된 혜택</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                🔒
              </div>
              <h3 className="font-semibold mb-2">데이터 보안</h3>
              <p className="text-sm text-gray-600">
                모든 데이터는 AES-256으로 암호화되어 안전하게 보호됩니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                📱
              </div>
              <h3 className="font-semibold mb-2">모바일 최적화</h3>
              <p className="text-sm text-gray-600">
                PWA 지원으로 모바일에서도 앱처럼 사용할 수 있습니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                🌍
              </div>
              <h3 className="font-semibold mb-2">78개국 지원</h3>
              <p className="text-sm text-gray-600">
                전 세계 주요 국가의 비자 규정을 실시간으로 추적합니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                💬
              </div>
              <h3 className="font-semibold mb-2">고객 지원</h3>
              <p className="text-sm text-gray-600">
                빠른 응답과 친절한 지원으로 문제를 해결해드립니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">지금 시작해보세요</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            복잡한 비자 걱정 없이 여행의 즐거움만 생각할 수 있도록 DINO가 도와드립니다.
            7일 무료 평가판으로 부담 없이 시작하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/auth/signin"
              className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              무료로 시작하기
            </a>
            <a 
              href="/demo"
              className="text-primary hover:text-primary/80 font-medium"
            >
              데모 보기 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}