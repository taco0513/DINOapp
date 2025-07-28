import { Metadata } from 'next'
import BackButton from '@/components/legal/BackButton'

export const metadata: Metadata = {
  title: '개인정보처리방침 | DINO',
  description: 'DINO 개인정보처리방침',
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-surface border border-border rounded-lg p-8">
        <h1 className="text-3xl font-bold text-primary mb-8">개인정보처리방침</h1>
        
        <div className="space-y-8 text-secondary">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">1. 개인정보의 처리 목적</h2>
            <p className="leading-relaxed mb-4">
              DINO는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 
              다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 
              개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="ml-6 space-y-2 list-disc">
              <li>서비스 제공에 관한 업무 (회원 관리, 여행 기록 관리, 알림 서비스)</li>
              <li>민원사무 처리 (민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지)</li>
              <li>마케팅 및 광고에의 활용 (서비스 개선을 위한 통계 분석)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">2. 개인정보의 처리 및 보유 기간</h2>
            <div className="space-y-4">
              <p>DINO는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 
              동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
              
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">각각의 개인정보 처리 및 보유 기간:</h3>
                <ul className="space-y-2">
                  <li><strong>회원 기본정보</strong>: 회원 탈퇴 시까지</li>
                  <li><strong>여행 기록 데이터</strong>: 회원 탈퇴 후 즉시 삭제</li>
                  <li><strong>Google 연동 데이터</strong>: 연동 해제 시 즉시 삭제</li>
                  <li><strong>로그 기록</strong>: 3개월 (보안 목적)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">3. 개인정보의 처리 항목</h2>
            <div className="space-y-4">
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">필수 수집 항목:</h3>
                <ul className="ml-6 space-y-1 list-disc">
                  <li>Google 계정 정보 (이메일, 이름, 프로필 사진)</li>
                  <li>Google ID (고유 식별자)</li>
                  <li>여권 발급 국가</li>
                  <li>시간대 설정</li>
                </ul>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">선택 수집 항목:</h3>
                <ul className="ml-6 space-y-1 list-disc">
                  <li>여행 기록 (입국/출국 날짜, 국가, 비자 유형)</li>
                  <li>Gmail 메일 내용 (항공편 예약 정보 추출용)</li>
                  <li>Google Calendar 일정 (여행 일정 동기화용)</li>
                  <li>알림 설정 정보</li>
                </ul>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">자동 수집 항목:</h3>
                <ul className="ml-6 space-y-1 list-disc">
                  <li>접속 IP 주소, 접속 시간</li>
                  <li>브라우저 정보, OS 정보</li>
                  <li>서비스 이용 기록</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">4. 개인정보의 제3자 제공</h2>
            <p className="leading-relaxed">
              DINO는 원칙적으로 정보주체의 개인정보를 수집·이용 목적으로 명시한 범위 내에서 처리하며, 
              정보주체의 사전 동의 없이는 본래의 목적 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다. 
              다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="ml-6 mt-4 space-y-1 list-disc">
              <li>정보주체로부터 별도의 동의를 받는 경우</li>
              <li>법률에 특별한 규정이 있는 경우</li>
              <li>정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">5. 개인정보처리 위탁</h2>
            <div className="space-y-4">
              <p>DINO는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
              
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">위탁업무 내용:</h3>
                <ul className="space-y-2">
                  <li><strong>Vercel Inc.</strong>: 웹사이트 호스팅 및 CDN 서비스</li>
                  <li><strong>Google LLC</strong>: 사용자 인증 및 API 서비스</li>
                  <li><strong>PlanetScale Inc.</strong>: 데이터베이스 서비스 (프로덕션)</li>
                </ul>
              </div>
              
              <p>위탁계약 시 개인정보보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 
              기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 
              사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">6. 정보주체의 권리·의무 및 그 행사방법</h2>
            <div className="space-y-4">
              <p>정보주체는 DINO에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
              
              <ul className="ml-6 space-y-2 list-disc">
                <li>개인정보 처리현황 통지요구</li>
                <li>개인정보 열람요구</li>
                <li>개인정보 정정·삭제요구</li>
                <li>개인정보 처리정지요구</li>
              </ul>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mt-4">
                <p className="text-sm">
                  <strong>권리 행사 방법:</strong> 설정 페이지에서 직접 수정하거나, 
                  고객센터(contact@dino-app.com)로 서면, 전화, 전자우편 등을 통하여 하실 수 있으며 
                  DINO는 이에 대해 지체 없이 조치하겠습니다.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">7. 개인정보의 파기</h2>
            <div className="space-y-4">
              <p>DINO는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 
              지체없이 해당 개인정보를 파기합니다.</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-primary mb-3">파기절차:</h3>
                  <p className="text-sm">이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 
                  내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</p>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-primary mb-3">파기방법:</h3>
                  <ul className="text-sm space-y-1">
                    <li>• 전자적 파일: 기록을 재생할 수 없도록 영구삭제</li>
                    <li>• 종이 문서: 분쇄기로 분쇄하거나 소각</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">8. 개인정보의 안전성 확보 조치</h2>
            <p className="mb-4">DINO는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 조치를 하고 있습니다:</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">기술적 조치:</h3>
                <ul className="text-sm space-y-1 list-disc ml-4">
                  <li>개인정보처리시스템 등의 접근권한 관리</li>
                  <li>접근통제시스템 설치 및 침입차단시스템 설치</li>
                  <li>고유식별정보 등의 암호화</li>
                  <li>보안프로그램 설치 및 갱신</li>
                </ul>
              </div>
              
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">관리적 조치:</h3>
                <ul className="text-sm space-y-1 list-disc ml-4">
                  <li>개인정보 취급 직원의 최소화 및 교육</li>
                  <li>개인정보 취급방침의 수립 및 시행</li>
                  <li>개인정보 취급 현황 점검</li>
                  <li>내부관리계획의 수립 및 시행</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">9. Google API 서비스 이용</h2>
            <div className="space-y-4">
              <p>DINO는 Google API Services를 통해 다음 서비스를 제공합니다:</p>
              
              <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">Google API 사용 범위:</h3>
                <ul className="ml-6 space-y-2 list-disc">
                  <li><strong>Google OAuth 2.0</strong>: 사용자 인증 및 기본 프로필 정보 접근</li>
                  <li><strong>Gmail API</strong>: 항공편 예약 확인서 등 여행 관련 이메일 스캔 (사용자 동의 시)</li>
                  <li><strong>Google Calendar API</strong>: 여행 일정 조회 및 동기화 (사용자 동의 시)</li>
                </ul>
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <h3 className="font-semibold text-primary mb-3">Google API 데이터 보호:</h3>
                <ul className="ml-6 space-y-2 list-disc">
                  <li>최소 권한 원칙: 서비스에 필요한 권한만 요청</li>
                  <li>로컬 처리: 가능한 모든 데이터를 로컬에서 처리</li>
                  <li>즉시 삭제: 연동 해제 시 관련 데이터 즉시 삭제</li>
                  <li>암호화 전송: 모든 API 통신은 HTTPS로 암호화</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">10. 개인정보 보호책임자</h2>
            <div className="bg-background border border-border rounded-lg p-4">
              <p className="mb-4">DINO는 개인정보 처리에 대한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 
              정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:</p>
              
              <div className="space-y-2">
                <p><strong>개인정보 보호책임자</strong></p>
                <p>• 이메일: privacy@dino-app.com</p>
                <p>• 연락처: 문의사항이 있으시면 이메일로 연락주시기 바랍니다.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">11. 개인정보 처리방침 변경</h2>
            <div className="space-y-3">
              <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
              
              <div className="bg-background border border-border rounded-lg p-4">
                <p><strong>본 방침은 2024년 7월 28일부터 시행됩니다.</strong></p>
                <p className="text-sm text-tertiary mt-2">이전 개인정보처리방침: 해당 없음 (최초 시행)</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex justify-between items-center">
            <p className="text-sm text-tertiary">최종 업데이트: 2024년 7월 28일</p>
            <BackButton />
          </div>
        </div>
      </div>
    </div>
  )
}