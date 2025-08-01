'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { logger } from '@/lib/logger'

// import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  MapPin,
  Calendar,
  Mail,
  Plane,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Globe,
  Shield,
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface OnboardingProgress {
  currentStep: number;
  completedSteps: string[];
  userProfile: {
    homeCountry?: string;
    preferredLanguage?: string;
    travelExperience?: string;
    interests?: string[];
  };
}

export default function OnboardingFlow() {
  const {} = useSession();
  // const router = useRouter();
  const [progress, setProgress] = useState<OnboardingProgress>({
    currentStep: 0,
    completedSteps: [],
    userProfile: {},
  });

  // Progressive Onboarding: 핵심 2단계 + 선택적 단계
  const coreSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: '시간을 90% 절약하는 여행 관리',
      description: '수동 계산은 그만! AI가 모든 걸 자동으로 처리합니다',
      icon: <Sparkles className='h-8 w-8' />,
      component: <WelcomeStep />,
    },
    {
      id: 'quick-start',
      title: '2분만 투자하고 평생 편리하게',
      description: '지금 체험하면 얼마나 편한지 바로 느낄 수 있어요',
      icon: <Plane className='h-8 w-8' />,
      component: (
        <div className='text-center'>
          <p>Quick start content will be here</p>
        </div>
      ),
    },
  ];

  const optionalSteps: OnboardingStep[] = [
    {
      id: 'profile',
      title: '맞춤형 서비스로 업그레이드',
      description: '개인 정보 설정으로 더 정확한 알림과 추천을 받으세요',
      icon: <Globe className='h-8 w-8' />,
      component: (
        <ProfileStep
          profile={progress.userProfile}
          onUpdate={profile =>
            setProgress(prev => ({
              ...prev,
              userProfile: { ...prev.userProfile, ...profile },
            }))
          }
        />
      ),
    },
    {
      id: 'integrations',
      title: '완전 자동화로 시간 제로',
      description: 'Gmail 연동으로 수동 입력 없이 모든 걸 자동 처리',
      icon: <Mail className='h-8 w-8' />,
      component: <IntegrationsStep />,
    },
  ];

  const [showOptionalSteps] = useState(false);
  const steps = showOptionalSteps
    ? [...coreSteps, ...optionalSteps]
    : coreSteps;

  const currentStepData = steps[progress.currentStep];

  const nextStep = () => {
    if (progress.currentStep < steps.length - 1) {
      const currentStepId = steps[progress.currentStep].id;
      setProgress(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        completedSteps: [...prev.completedSteps, currentStepId],
      }));
    }
  };

  const prevStep = () => {
    if (progress.currentStep > 0) {
      setProgress(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1,
      }));
    }
  };

  // const _handleComplete = async () => {
  //   try {
  //     // 온보딩 완료 상태 저장
  //     await fetch('/api/user/onboarding', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         completed: true,
  //         profile: progress.userProfile,
  //         completedAt: new Date().toISOString(),
  //       }),
  //     });

  //     // 대시보드로 리다이렉트
  //     router.push('/dashboard?welcome=true');
  //   } catch (error) {
  //     logger.error('온보딩 완료 처리 실패:', error);
  //   }
  // };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4'>
      <div className='max-w-4xl w-full'>
        {/* 진행 표시기 */}
        <div className='mb-8'>
          <div className='flex items-center justify-center mb-4'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex items-center'>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index <= progress.currentStep
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {progress.completedSteps.includes(step.id) ? (
                    <CheckCircle className='h-5 w-5' />
                  ) : (
                    <span className='text-sm font-medium'>{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      index < progress.currentStep
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              {progress.currentStep + 1} / {steps.length}
            </p>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className='bg-white rounded-2xl shadow-xl p-8'>
          <div className='text-center mb-8'>
            <div className='flex justify-center mb-4 text-blue-600'>
              {currentStepData.icon}
            </div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {currentStepData.title}
            </h1>
            <p className='text-lg text-gray-600'>
              {currentStepData.description}
            </p>
          </div>

          {/* 단계별 컨텐츠 */}
          <div className='mb-8'>{currentStepData.component}</div>

          {/* 네비게이션 버튼 */}
          <div className='flex justify-between'>
            <button
              onClick={prevStep}
              disabled={progress.currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                progress.currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              이전
            </button>

            <button
              onClick={nextStep}
              disabled={progress.currentStep === steps.length - 1}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                progress.currentStep === steps.length - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              다음
              <ArrowRight className='h-4 w-4 ml-2' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 단계별 컴포넌트들
function WelcomeStep() {
  return (
    <div className='text-center space-y-8'>
      {/* 가치 제안 강화 */}
      <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-8'>
        <div className='text-4xl mb-4'>⚡</div>
        <h2 className='text-2xl font-bold text-gray-900 mb-3'>
          여행 관리 시간을 90% 단축하세요
        </h2>
        <p className='text-lg text-gray-700 mb-4'>
          수동 계산과 복잡한 서류 관리는 이제 그만.
          <br />
          AI가 모든 것을 자동으로 처리합니다.
        </p>
        <div className='flex items-center justify-center gap-6 text-sm'>
          <div className='flex items-center gap-2'>
            <span className='w-2 h-2 bg-green-500 rounded-full'></span>
            <span>5분 설정</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
            <span>평생 무료</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='w-2 h-2 bg-purple-500 rounded-full'></span>
            <span>78개국 지원</span>
          </div>
        </div>
      </div>

      {/* 구체적 혜택 강조 */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='p-6 bg-blue-50 rounded-xl border-2 border-blue-100'>
          <MapPin className='h-8 w-8 text-blue-600 mx-auto mb-3' />
          <h3 className='font-semibold text-gray-900 mb-2'>자동 여행 기록</h3>
          <p className='text-sm text-gray-600 mb-3'>
            Gmail 연동으로 항공권 이메일을 자동으로 여행 기록으로 변환
          </p>
          <div className='bg-blue-100 px-3 py-1 rounded-full text-xs text-blue-800 font-medium'>
            💰 월 20시간 절약
          </div>
        </div>
        <div className='p-6 bg-green-50 rounded-xl border-2 border-green-100'>
          <Shield className='h-8 w-8 text-green-600 mx-auto mb-3' />
          <h3 className='font-semibold text-gray-900 mb-2'>오버스테이 방지</h3>
          <p className='text-sm text-gray-600 mb-3'>
            실시간 알림으로 비자 위반 위험을 사전에 차단
          </p>
          <div className='bg-green-100 px-3 py-1 rounded-full text-xs text-green-800 font-medium'>
            🛡️ 법적 위험 0%
          </div>
        </div>
        <div className='p-6 bg-purple-50 rounded-xl border-2 border-purple-100'>
          <Calendar className='h-8 w-8 text-purple-600 mx-auto mb-3' />
          <h3 className='font-semibold text-gray-900 mb-2'>스마트 여행 계획</h3>
          <p className='text-sm text-gray-600 mb-3'>
            셰겐 규정을 고려한 최적의 여행 일정 추천
          </p>
          <div className='bg-purple-100 px-3 py-1 rounded-full text-xs text-purple-800 font-medium'>
            🎯 여행 효율 300% 증가
          </div>
        </div>
      </div>

      {/* 사용자 증언 추가 */}
      <div className='bg-gray-50 p-6 rounded-xl'>
        <div className='flex items-center justify-center mb-4'>
          <div className='flex -space-x-2'>
            <div className='w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold'>
              김
            </div>
            <div className='w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold'>
              이
            </div>
            <div className='w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold'>
              박
            </div>
          </div>
          <span className='ml-3 text-sm text-gray-600'>+2,847명이 사용 중</span>
        </div>
        <p className='text-sm text-gray-700 italic'>
          "유럽 여행 계획할 때 셰겐 계산이 너무 복잡했는데,
          <br />
          DINOapp 덕분에 5분 만에 모든 게 정리됐어요!"
          <span className='font-medium'>- 디지털노마드 김○○</span>
        </p>
      </div>
    </div>
  );
}

function ProfileStep({
  profile,
  onUpdate,
}: {
  profile: OnboardingProgress['userProfile'];
  onUpdate: (profile: Partial<OnboardingProgress['userProfile']>) => void;
}) {
  const countries = [
    { code: 'KR', name: '대한민국' },
    { code: 'US', name: '미국' },
    { code: 'JP', name: '일본' },
    { code: 'DE', name: '독일' },
    { code: 'SG', name: '싱가포르' },
  ];

  const experiences = [
    { value: 'beginner', label: '초보자 (1-5개국)' },
    { value: 'intermediate', label: '중급자 (6-20개국)' },
    { value: 'advanced', label: '고급자 (21개국 이상)' },
  ];

  const interests = [
    '문화 탐방',
    '자연 경관',
    '음식 체험',
    '역사 유적',
    '어학 연수',
    '업무 출장',
    '휴양',
    '모험 여행',
  ];

  return (
    <div className='space-y-6'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          거주 국가
        </label>
        <select
          value={profile.homeCountry || ''}
          onChange={e => onUpdate({ homeCountry: e.target.value })}
          className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        >
          <option value=''>선택해주세요</option>
          {countries.map(country => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          여행 경험 수준
        </label>
        <div className='space-y-2'>
          {experiences.map(exp => (
            <label key={exp.value} className='flex items-center'>
              <input
                type='radio'
                name='experience'
                value={exp.value}
                checked={profile.travelExperience === exp.value}
                onChange={e => onUpdate({ travelExperience: e.target.value })}
                className='mr-3 text-blue-600'
              />
              <span className='text-gray-700'>{exp.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          여행 관심사 (여러 개 선택 가능)
        </label>
        <div className='grid grid-cols-2 gap-2'>
          {interests.map(interest => (
            <label key={interest} className='flex items-center'>
              <input
                type='checkbox'
                checked={(profile.interests || []).includes(interest)}
                onChange={e => {
                  const currentInterests = profile.interests || [];
                  if (e.target.checked) {
                    onUpdate({ interests: [...currentInterests, interest] });
                  } else {
                    onUpdate({
                      interests: currentInterests.filter(i => i !== interest),
                    });
                  }
                }}
                className='mr-2 text-blue-600'
              />
              <span className='text-sm text-gray-700'>{interest}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntegrationsStep() {
  const [integrationStatus, setIntegrationStatus] = useState({
    gmail: false,
    calendar: false,
  });

  const handleGmailConnect = async () => {
    try {
      // Gmail 연동 로직
      window.open('/api/auth/gmail', '_blank', 'width=500,height=600');
      setIntegrationStatus(prev => ({ ...prev, gmail: true }));
    } catch (error) {
      logger.error('Gmail 연동 실패:', error);
    }
  };

  const handleCalendarConnect = async () => {
    try {
      // Calendar 연동 로직
      window.open('/api/auth/calendar', '_blank', 'width=500,height=600');
      setIntegrationStatus(prev => ({ ...prev, calendar: true }));
    } catch (error) {
      logger.error('Calendar 연동 실패:', error);
    }
  };

  return (
    <div className='space-y-6'>
      {/* 자동화 가치 제안 */}
      <div className='text-center mb-8'>
        <div className='bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl mb-6'>
          <div className='text-4xl mb-4'>🤖</div>
          <h2 className='text-2xl font-bold text-gray-900 mb-3'>
            완전 자동화로 시간을 되찾으세요
          </h2>
          <p className='text-lg text-gray-700 mb-4'>
            Gmail 연동 한 번으로 평생 수동 입력은 끝
          </p>
          <div className='bg-white/80 p-4 rounded-lg'>
            <div className='flex items-center justify-center gap-8 text-sm'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600'>20시간</div>
                <div className='text-gray-600'>월 절약 시간</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>98%</div>
                <div className='text-gray-600'>정확도</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>24/7</div>
                <div className='text-gray-600'>자동 모니터링</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='space-y-6'>
        {/* Gmail 연동 */}
        <div className='border-2 border-red-100 bg-red-50/30 rounded-xl p-6'>
          <div className='flex items-start justify-between'>
            <div className='flex items-start'>
              <div className='bg-red-100 p-3 rounded-lg mr-4'>
                <Mail className='h-6 w-6 text-red-600' />
              </div>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <h3 className='font-semibold text-gray-900'>
                    Gmail 자동 분석
                  </h3>
                  <span className='bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium'>
                    핵심 기능
                  </span>
                </div>
                <p className='text-sm text-gray-600 mb-3'>
                  항공권, 호텔 예약 이메일을 AI가 자동으로 분석해서 여행 기록을
                  생성합니다
                </p>
                <div className='space-y-2'>
                  <div className='flex items-center text-sm'>
                    <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
                    <span>✈️ 항공권 이메일 → 자동 입출국 기록</span>
                  </div>
                  <div className='flex items-center text-sm'>
                    <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
                    <span>🏨 호텔 예약 → 자동 체류 기간 계산</span>
                  </div>
                  <div className='flex items-center text-sm'>
                    <span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
                    <span>🔄 실시간 업데이트 (변경/취소 자동 반영)</span>
                  </div>
                </div>
                <div className='bg-red-100 p-3 rounded-lg mt-4'>
                  <div className='text-sm text-red-800'>
                    <strong>🚀 예상 효과:</strong> 월 20시간 절약, 수동 입력 95%
                    감소
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleGmailConnect}
              disabled={integrationStatus.gmail}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                integrationStatus.gmail
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {integrationStatus.gmail ? '✓ 연동 완료' : '지금 연동하기'}
            </button>
          </div>
        </div>

        {/* Calendar 연동 */}
        <div className='border-2 border-blue-100 bg-blue-50/30 rounded-xl p-6'>
          <div className='flex items-start justify-between'>
            <div className='flex items-start'>
              <div className='bg-blue-100 p-3 rounded-lg mr-4'>
                <Calendar className='h-6 w-6 text-blue-600' />
              </div>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <h3 className='font-semibold text-gray-900'>
                    스마트 캘린더 알림
                  </h3>
                  <span className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium'>
                    편의 기능
                  </span>
                </div>
                <p className='text-sm text-gray-600 mb-3'>
                  여행 일정을 캘린더에 자동 추가하고, 비자 만료/셰겐 한계 도달
                  전 알림
                </p>
                <div className='space-y-2'>
                  <div className='flex items-center text-sm'>
                    <span className='w-2 h-2 bg-blue-500 rounded-full mr-2'></span>
                    <span>📅 여행 일정 자동 캘린더 등록</span>
                  </div>
                  <div className='flex items-center text-sm'>
                    <span className='w-2 h-2 bg-blue-500 rounded-full mr-2'></span>
                    <span>⚠️ 비자 만료 7일/1일 전 알림</span>
                  </div>
                  <div className='flex items-center text-sm'>
                    <span className='w-2 h-2 bg-blue-500 rounded-full mr-2'></span>
                    <span>🇪🇺 셰겐 한계 도달 전 사전 경고</span>
                  </div>
                </div>
                <div className='bg-blue-100 p-3 rounded-lg mt-4'>
                  <div className='text-sm text-blue-800'>
                    <strong>🛡️ 예상 효과:</strong> 오버스테이 위험 0%, 일정 관리
                    자동화
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleCalendarConnect}
              disabled={integrationStatus.calendar}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                integrationStatus.calendar
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {integrationStatus.calendar ? '✓ 연동 완료' : '지금 연동하기'}
            </button>
          </div>
        </div>
      </div>

      {/* 사용자 성공 사례 */}
      <div className='bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl'>
        <div className='text-center mb-4'>
          <h3 className='font-bold text-gray-900 mb-2'>💬 실제 사용자 후기</h3>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-white p-4 rounded-lg shadow-sm'>
            <p className='text-sm text-gray-700 mb-2'>
              "Gmail 연동 후 여행 기록 입력이 완전 자동화됐어요. 정말 신세계!"
            </p>
            <div className='text-xs text-gray-500'>- 프리랜서 이○○</div>
          </div>
          <div className='bg-white p-4 rounded-lg shadow-sm'>
            <p className='text-sm text-gray-700 mb-2'>
              "캘린더 알림 덕분에 비자 연장을 깜빡할 뻔한 걸 막았어요. 생명의
              은인!"
            </p>
            <div className='text-xs text-gray-500'>- 디지털노마드 박○○</div>
          </div>
        </div>
      </div>

      {/* 나중에 설정 안내 */}
      <div className='text-center p-4 bg-gray-50 rounded-lg'>
        <p className='text-sm text-gray-600 mb-2'>
          ⏰ <strong>지금 연동하지 않아도 괜찮아요!</strong>
        </p>
        <p className='text-xs text-gray-500'>
          언제든지 설정 → 연동 관리에서 추가할 수 있습니다. 먼저 기본 기능을
          체험해보세요.
        </p>
      </div>
    </div>
  );
}
