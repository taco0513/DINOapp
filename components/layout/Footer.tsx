import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 섹션 */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-primary mb-4">DINO</h3>
            <p className="text-secondary text-sm leading-relaxed">
              디지털 노마드와 장기 여행자를 위한
              스마트 여행 관리 플랫폼
            </p>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h4 className="font-semibold text-primary mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-secondary hover:text-primary transition-colors">
                  대시보드
                </Link>
              </li>
              <li>
                <Link href="/schengen" className="text-secondary hover:text-primary transition-colors">
                  셰겐 계산기
                </Link>
              </li>
              <li>
                <Link href="/trips" className="text-secondary hover:text-primary transition-colors">
                  여행 기록
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-secondary hover:text-primary transition-colors">
                  설정
                </Link>
              </li>
            </ul>
          </div>

          {/* 지원 링크 */}
          <div>
            <h4 className="font-semibold text-primary mb-4">지원</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/faq" className="text-secondary hover:text-primary transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <a href="mailto:support@dino-app.com" className="text-secondary hover:text-primary transition-colors">
                  고객 지원
                </a>
              </li>
              <li>
                <Link href="/api/health" className="text-secondary hover:text-primary transition-colors">
                  서비스 상태
                </Link>
              </li>
            </ul>
          </div>

          {/* 법적 링크 */}
          <div>
            <h4 className="font-semibold text-primary mb-4">법적 고지</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="text-secondary hover:text-primary transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-secondary hover:text-primary transition-colors">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="border-t border-border mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-tertiary text-sm">
              © {currentYear} DINO. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center text-sm text-tertiary">
                <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                서비스 운영 중
              </div>
            </div>
          </div>
        </div>

        {/* 법적 고지 */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <p className="text-xs text-tertiary leading-relaxed">
            <strong>법적 고지:</strong> DINO에서 제공하는 비자 및 출입국 정보는 참고용입니다. 
            실제 출입국 시에는 해당 국가의 공식 기관에서 최신 정보를 확인하시기 바랍니다. 
            셰겐 계산 결과의 정확성에 대한 법적 책임을 지지 않습니다.
          </p>
        </div>
      </div>
    </footer>
  )
}