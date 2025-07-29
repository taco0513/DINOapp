'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  Shield
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  component: React.ReactNode
}

interface OnboardingProgress {
  currentStep: number
  completedSteps: string[]
  userProfile: {
    homeCountry?: string
    preferredLanguage?: string
    travelExperience?: string
    interests?: string[]
  }
}

export default function OnboardingFlow() {
  const { data: session } = useSession()
  const router = useRouter()
  const [progress, setProgress] = useState<OnboardingProgress>({
    currentStep: 0,
    completedSteps: [],
    userProfile: {}
  })

  // Progressive Onboarding: 핵심 2단계 + 선택적 단계
  const coreSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'DINOapp에 오신 것을 환영합니다!',
      description: '디지털 노마드를 위한 스마트 여행 관리 플랫폼',
      icon: <Sparkles className="h-8 w-8" />,
      component: <WelcomeStep />
    },
    {
      id: 'quick-start',
      title: '빠른 시작',
      description: '첫 여행 기록을 추가하고 DINOapp을 체험해보세요',
      icon: <Plane className="h-8 w-8" />,
      component: <QuickStartStep onSkip={() => handleComplete()} />
    }
  ]

  const optionalSteps: OnboardingStep[] = [
    {
      id: 'profile',
      title: '프로필 설정',
      description: '개인화된 서비스를 위한 기본 정보 설정',
      icon: <Globe className="h-8 w-8" />,
      component: <ProfileStep 
        profile={progress.userProfile} 
        onUpdate={(profile) => setProgress(prev => ({ ...prev, userProfile: { ...prev.userProfile, ...profile } }))}
      />
    },
    {
      id: 'integrations',
      title: '서비스 연동',
      description: 'Gmail과 Google Calendar 연동으로 자동화',
      icon: <Mail className="h-8 w-8" />,
      component: <IntegrationsStep />
    }
  ]

  const [showOptionalSteps, setShowOptionalSteps] = useState(false)
  const steps = showOptionalSteps ? [...coreSteps, ...optionalSteps] : coreSteps

  const currentStepData = steps[progress.currentStep]

  const nextStep = () => {
    if (progress.currentStep < steps.length - 1) {
      const currentStepId = steps[progress.currentStep].id
      setProgress(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        completedSteps: [...prev.completedSteps, currentStepId]
      }))
    }
  }

  const prevStep = () => {
    if (progress.currentStep > 0) {
      setProgress(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }))
    }
  }

  const handleComplete = async () => {
    try {
      // 온보딩 완료 상태 저장
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: true,
          profile: progress.userProfile,
          completedAt: new Date().toISOString()
        })
      })
      
      // 대시보드로 리다이렉트
      router.push('/dashboard?welcome=true')
    } catch (error) {
      console.error('온보딩 완료 처리 실패:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* 진행 표시기 */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  index <= progress.currentStep 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {progress.completedSteps.includes(step.id) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    index < progress.currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {progress.currentStep + 1} / {steps.length}
            </p>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4 text-blue-600">
              {currentStepData.icon}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-lg text-gray-600">
              {currentStepData.description}
            </p>
          </div>

          {/* 단계별 컨텐츠 */}
          <div className="mb-8">
            {currentStepData.component}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={progress.currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                progress.currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
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
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 단계별 컴포넌트들
function WelcomeStep() {
  return (
    <div className="text-center space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 rounded-xl">
          <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">여행 기록 관리</h3>
          <p className="text-sm text-gray-600">입출국 기록을 체계적으로 관리하고 추적하세요</p>
        </div>
        <div className="p-6 bg-green-50 rounded-xl">
          <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">비자 관리</h3>
          <p className="text-sm text-gray-600">78개국 비자 정보와 만료일을 자동으로 추적</p>
        </div>
        <div className="p-6 bg-purple-50 rounded-xl">
          <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">셰겐 계산</h3>
          <p className="text-sm text-gray-600">90/180일 규정을 자동으로 계산하고 알림</p>
        </div>
      </div>
      <p className="text-lg text-gray-700">
        디지털 노마드와 자주 여행하는 분들을 위한 완벽한 솔루션입니다.
      </p>
    </div>
  )
}

function ProfileStep({ profile, onUpdate }: { 
  profile: OnboardingProgress['userProfile']
  onUpdate: (profile: Partial<OnboardingProgress['userProfile']>) => void 
}) {
  const countries = [
    { code: 'KR', name: '대한민국' },
    { code: 'US', name: '미국' },
    { code: 'JP', name: '일본' },
    { code: 'DE', name: '독일' },
    { code: 'SG', name: '싱가포르' }
  ]

  const experiences = [
    { value: 'beginner', label: '초보자 (1-5개국)' },
    { value: 'intermediate', label: '중급자 (6-20개국)' },
    { value: 'advanced', label: '고급자 (21개국 이상)' }
  ]

  const interests = [
    '문화 탐방', '자연 경관', '음식 체험', '역사 유적', 
    '어학 연수', '업무 출장', '휴양', '모험 여행'
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          거주 국가
        </label>
        <select
          value={profile.homeCountry || ''}
          onChange={(e) => onUpdate({ homeCountry: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">선택해주세요</option>
          {countries.map(country => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          여행 경험 수준
        </label>
        <div className="space-y-2">
          {experiences.map(exp => (
            <label key={exp.value} className="flex items-center">
              <input
                type="radio"
                name="experience"
                value={exp.value}
                checked={profile.travelExperience === exp.value}
                onChange={(e) => onUpdate({ travelExperience: e.target.value })}
                className="mr-3 text-blue-600"
              />
              <span className="text-gray-700">{exp.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          여행 관심사 (여러 개 선택 가능)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {interests.map(interest => (
            <label key={interest} className="flex items-center">
              <input
                type="checkbox"
                checked={(profile.interests || []).includes(interest)}
                onChange={(e) => {
                  const currentInterests = profile.interests || []
                  if (e.target.checked) {
                    onUpdate({ interests: [...currentInterests, interest] })
                  } else {
                    onUpdate({ interests: currentInterests.filter(i => i !== interest) })
                  }
                }}
                className="mr-2 text-blue-600"
              />
              <span className="text-sm text-gray-700">{interest}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function IntegrationsStep() {
  const [integrationStatus, setIntegrationStatus] = useState({
    gmail: false,
    calendar: false
  })

  const handleGmailConnect = async () => {
    try {
      // Gmail 연동 로직
      window.open('/api/auth/gmail', '_blank', 'width=500,height=600')
      setIntegrationStatus(prev => ({ ...prev, gmail: true }))
    } catch (error) {
      console.error('Gmail 연동 실패:', error)
    }
  }

  const handleCalendarConnect = async () => {
    try {
      // Calendar 연동 로직
      window.open('/api/auth/calendar', '_blank', 'width=500,height=600')
      setIntegrationStatus(prev => ({ ...prev, calendar: true }))
    } catch (error) {
      console.error('Calendar 연동 실패:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600">
          서비스 연동은 선택사항이며, 나중에 설정할 수도 있습니다.
        </p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Gmail 연동</h3>
                <p className="text-sm text-gray-600">
                  항공권, 호텔 예약 이메일을 자동으로 분석하여 여행 기록을 생성합니다.
                </p>
              </div>
            </div>
            <button
              onClick={handleGmailConnect}
              disabled={integrationStatus.gmail}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                integrationStatus.gmail
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {integrationStatus.gmail ? '연동됨' : '연동하기'}
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Google Calendar 연동</h3>
                <p className="text-sm text-gray-600">
                  여행 일정을 캘린더에 자동으로 추가하고, 비자 만료 알림을 설정합니다.
                </p>
              </div>
            </div>
            <button
              onClick={handleCalendarConnect}
              disabled={integrationStatus.calendar}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                integrationStatus.calendar
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {integrationStatus.calendar ? '연동됨' : '연동하기'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          💡 <strong>팁:</strong> 연동을 완료하면 수동으로 입력하는 시간을 크게 줄일 수 있습니다.
        </p>
      </div>
    </div>
  )
}

function FirstTripStep() {
  const [tripData, setTripData] = useState({
    country: '',
    entryDate: '',
    exitDate: '',
    purpose: 'tourism'
  })

  const countries = [
    { code: 'JP', name: '일본' },
    { code: 'US', name: '미국' },
    { code: 'DE', name: '독일' },
    { code: 'TH', name: '태국' },
    { code: 'SG', name: '싱가포르' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/travel/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData)
      })
      alert('첫 여행 기록이 추가되었습니다!')
    } catch (error) {
      console.error('여행 기록 추가 실패:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600">
          최근 여행을 추가해서 DINOapp의 기능을 체험해보세요. (선택사항)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            방문 국가
          </label>
          <select
            value={tripData.country}
            onChange={(e) => setTripData(prev => ({ ...prev, country: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">선택해주세요</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              입국일
            </label>
            <input
              type="date"
              value={tripData.entryDate}
              onChange={(e) => setTripData(prev => ({ ...prev, entryDate: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출국일
            </label>
            <input
              type="date"
              value={tripData.exitDate}
              onChange={(e) => setTripData(prev => ({ ...prev, exitDate: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            여행 목적
          </label>
          <select
            value={tripData.purpose}
            onChange={(e) => setTripData(prev => ({ ...prev, purpose: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="tourism">관광</option>
            <option value="business">업무</option>
            <option value="study">학업</option>
            <option value="other">기타</option>
          </select>
        </div>

        {tripData.country && tripData.entryDate && (
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            여행 기록 추가
          </button>
        )}
      </form>

      <div className="text-center">
        <button
          type="button"
          className="text-blue-600 hover:text-blue-800"
        >
          건너뛰기
        </button>
      </div>
    </div>
  )
}

function QuickStartStep({ onSkip }: { onSkip: () => void }) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const router = useRouter()

  const quickOptions = [
    {
      id: 'add-trip',
      title: '첫 여행 기록 추가',
      description: '최근 여행을 추가해서 바로 시작하기',
      icon: <Plane className="h-6 w-6" />,
      action: () => router.push('/trips')
    },
    {
      id: 'schengen-calc',
      title: '셰겐 계산기 체험',
      description: '유럽 여행 계획을 위한 필수 도구',
      icon: <Shield className="h-6 w-6" />,
      action: () => router.push('/schengen')
    },
    {
      id: 'explore-dashboard',
      title: '대시보드 둘러보기',
      description: '모든 기능을 한눈에 확인하기',
      icon: <MapPin className="h-6 w-6" />,
      action: () => router.push('/dashboard')
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600">
          어떻게 시작하고 싶으신가요? 바로 체험해보거나 나중에 설정할 수 있습니다.
        </p>
      </div>

      <div className="space-y-3">
        {quickOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              setSelectedOption(option.id)
              option.action()
            }}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:border-blue-300 ${
              selectedOption === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center">
              <div className="text-blue-600 mr-4">
                {option.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
          </button>
        ))}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onSkip}
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          지금은 건너뛰고 대시보드로 이동
        </button>
      </div>
    </div>
  )
}

function CompleteStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-6">🎉</div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          모든 설정이 완료되었습니다!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          이제 DINOapp의 모든 기능을 사용할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">다음에 할 수 있는 것들:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 더 많은 여행 기록 추가</li>
            <li>• 비자 정보 관리</li>
            <li>• 셰겐 계산기 활용</li>
            <li>• AI 여행 추천 받기</li>
          </ul>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">도움이 필요하면:</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• 사용자 가이드 참조</li>
            <li>• FAQ 섹션 확인</li>
            <li>• 고객지원 문의</li>
            <li>• 튜토리얼 동영상 시청</li>
          </ul>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
      >
        대시보드로 이동하기
      </button>
    </div>
  )
}