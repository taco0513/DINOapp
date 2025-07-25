import { Metadata } from 'next'
import GmailIntegration from '@/components/gmail/GmailIntegration'

export const metadata: Metadata = {
  title: 'Gmail 통합 - DiNoCal',
  description: 'Gmail에서 여행 이메일을 자동으로 분석하여 여행 기록을 생성합니다.'
}

export default function GmailPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Gmail 통합</h1>
          <p className="text-lg text-gray-600">
            Gmail에서 여행 관련 이메일을 자동으로 분석하여 여행 기록을 간편하게 추가할 수 있습니다.
          </p>
        </div>
        
        <GmailIntegration />
        
        {/* 사용 가이드 */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">사용 가이드</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">1. Gmail 연결 확인</h3>
              <p className="text-gray-600">
                먼저 Gmail 연결 상태를 확인합니다. 연결이 되지 않았다면 Google 계정 재로그인이 필요할 수 있습니다.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">2. 여행 이메일 분석</h3>
              <p className="text-gray-600">
                "최근 10개 분석" 또는 "최근 20개 분석" 버튼을 클릭하여 여행 관련 이메일을 분석합니다.
                항공권, 호텔 예약, 여행 일정 등의 이메일을 자동으로 찾아 분석합니다.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">3. 분석 결과 확인</h3>
              <p className="text-gray-600">
                분석된 결과에서 출발일, 도착일, 목적지 등의 정보를 확인하고, 
                신뢰도가 높은 결과는 "여행 기록 추가" 버튼으로 바로 여행 기록에 추가할 수 있습니다.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">4. 지원하는 이메일 유형</h3>
              <ul className="text-gray-600 list-disc list-inside space-y-1">
                <li>항공권 예약 이메일 (항공사, 여행사)</li>
                <li>호텔 예약 이메일 (Booking.com, Expedia, Agoda 등)</li>
                <li>렌터카 예약 이메일</li>
                <li>여행 일정 이메일</li>
                <li>전자티켓 및 보딩패스</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}