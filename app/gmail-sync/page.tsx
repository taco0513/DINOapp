/**
 * DINO v3.0 - Gmail Sync Page (백로그)
 * 현재 개발 중단된 기능 - 향후 재개발 예정
 */

// import { redirect } from 'next/navigation';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth-simple';
// import { GmailSyncClient } from '@/components/gmail/GmailSyncClient';

export default function GmailSyncPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 백로그 알림 */}
        <div className="mb-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">📋</div>
            <h1 className="text-2xl font-bold text-orange-900">
              Gmail 싱크 기능 (백로그)
            </h1>
          </div>
          <div className="space-y-3 text-orange-800">
            <p className="font-medium">
              이 기능은 현재 DINO v3.0 개발 우선순위에서 제외되었습니다.
            </p>
            <div className="text-sm space-y-2">
              <div>
                • <strong>상태</strong>: 개발 중단 (백로그)
              </div>
              <div>
                • <strong>사유</strong>: v3.0 코어 기능 우선 개발
              </div>
              <div>
                • <strong>계획</strong>: 향후 사용자 요청 시 재검토
              </div>
            </div>
          </div>
        </div>

        {/* 대체 안내 */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            🔄 대체 방법
          </h2>
          <div className="space-y-2 text-sm text-blue-800">
            <div>• 수동으로 여행 기록을 입력해 주세요</div>
            <div>• 항공편 정보는 여행 추가 페이지에서 직접 입력 가능합니다</div>
            <div>
              • 스켄겐 계산 등 다른 기능들은 정상적으로 사용할 수 있습니다
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/trips"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              ✈️ 여행 기록 수동 추가하기
            </a>
          </div>
        </div>

        {/* 기능 설명 (참고용) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            💡 Gmail 싱크 기능이란? (참고)
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Gmail에서 항공편 확인 이메일을 자동으로 찾아 분석</div>
            <div>• 항공편 정보를 추출하여 여행 기록으로 자동 변환</div>
            <div>• 스켄겐 계산을 위한 여행 기간 자동 생성</div>
            <div>• 수동 입력 없이 빠른 여행 기록 관리</div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              📝 개발 상태
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• 코드는 유지되고 있으며 언제든 재활성화 가능</div>
              <div>• TypeScript 컴파일 에러 수정 완료</div>
              <div>• API 엔드포인트는 그대로 유지</div>
            </div>
          </div>
        </div>

        {/* 문의 안내 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Gmail 싱크 기능이 필요하시다면 개발팀에 문의해 주세요.</p>
        </div>
      </div>
    </div>
  );
}
