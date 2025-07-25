export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              DiNoCal
            </span>
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Digital Nomad Calendar
          </p>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            복잡한 비자 규정을 자동으로 추적하고 여행 기록을 체계적으로 관리하는 
            스마트 여행 관리 플랫폼입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-travel">
            <div className="text-2xl mb-3">🗓️</div>
            <h3 className="font-semibold text-gray-900 mb-2">스마트 여행 기록</h3>
            <p className="text-gray-600 text-sm">
              각 나라별 체류 가능한 날짜를 자동으로 계산하고 관리
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-travel">
            <div className="text-2xl mb-3">🚨</div>
            <h3 className="font-semibold text-gray-900 mb-2">비자 규정 확인</h3>
            <p className="text-gray-600 text-sm">
              셰겐 지역 90/180일 규칙 등 복잡한 규정을 자동 계산
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-travel">
            <div className="text-2xl mb-3">📧</div>
            <h3 className="font-semibold text-gray-900 mb-2">Gmail 자동 연동</h3>
            <p className="text-gray-600 text-sm">
              여행 관련 이메일에서 자동으로 정보를 추출하여 기록
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-6">
          <div className="space-y-4">
            <a
              href="/auth/signin"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              시작하기 →
            </a>
            <div className="text-sm text-gray-500">
              Google 계정으로 간편하게 로그인하세요
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            Next.js 15 + TypeScript + Tailwind CSS + NextAuth.js
          </div>
        </div>
      </div>
    </main>
  )
}