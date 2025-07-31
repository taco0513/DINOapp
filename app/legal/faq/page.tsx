import { Metadata } from 'next';
import BackButton from '@/components/legal/BackButton';

export const metadata: Metadata = {
  title: '자주 묻는 질문 | DINO',
  description: 'DINO 서비스 자주 묻는 질문',
};

export default function FAQ() {
  const faqData = [
    {
      category: '서비스 일반',
      questions: [
        {
          q: 'DINO는 어떤 서비스인가요?',
          a: 'DINO는 디지털 노마드와 장기 여행자를 위한 스마트 여행 관리 플랫폼입니다. 복잡한 비자 규정을 자동으로 추적하고, 특히 셰겐 지역의 90/180일 규칙을 정확히 계산하여 법적 문제를 예방할 수 있도록 도와드립니다.',
        },
        {
          q: '무료로 사용할 수 있나요?',
          a: '네, DINO의 모든 핵심 기능은 무료로 제공됩니다. 회원가입 후 바로 여행 기록 관리, 셰겐 계산, 비자 추적 등의 기능을 사용하실 수 있습니다.',
        },
        {
          q: '모바일에서도 사용할 수 있나요?',
          a: '네, DINO는 모바일 친화적으로 설계되어 스마트폰과 태블릿에서 완벽하게 작동합니다. 별도의 앱 설치 없이 웹브라우저에서 바로 사용하실 수 있습니다.',
        },
      ],
    },
    {
      category: '계정 및 로그인',
      questions: [
        {
          q: '회원가입은 어떻게 하나요?',
          a: "Google 계정으로 간단하게 가입할 수 있습니다. '로그인' 버튼을 클릭하고 Google 계정으로 인증하시면 자동으로 회원가입이 완료됩니다.",
        },
        {
          q: 'Google 계정 없이도 사용할 수 있나요?',
          a: '현재는 Google OAuth를 통한 로그인만 지원합니다. 이는 보안성과 편의성을 위한 선택이며, 다른 로그인 방식은 향후 업데이트에서 고려하고 있습니다.',
        },
        {
          q: '계정을 삭제하고 싶어요.',
          a: "설정 페이지에서 '회원 탈퇴' 옵션을 선택하시면 됩니다. 탈퇴 시 모든 개인정보와 여행 데이터는 즉시 삭제됩니다.",
        },
      ],
    },
    {
      category: '여행 기록 관리',
      questions: [
        {
          q: '여행 기록은 어떻게 추가하나요?',
          a: "대시보드에서 '새 여행 추가' 버튼을 클릭하여 국가, 입국/출국 날짜, 비자 유형을 입력하시면 됩니다. Gmail 연동을 통해 항공편 예약 정보를 자동으로 가져올 수도 있습니다.",
        },
        {
          q: '입력한 데이터를 수정할 수 있나요?',
          a: '네, 언제든지 여행 기록을 수정하거나 삭제할 수 있습니다. 여행 목록에서 해당 기록을 클릭하여 편집하시면 됩니다.',
        },
        {
          q: '여행 데이터를 백업할 수 있나요?',
          a: '설정 페이지에서 모든 여행 데이터를 JSON 형식으로 내보낼 수 있습니다. 또한 백업 파일을 다시 가져와서 데이터를 복원할 수도 있습니다.',
        },
      ],
    },
    {
      category: '셰겐 계산기',
      questions: [
        {
          q: '셰겐 90/180일 규칙이 무엇인가요?',
          a: '셰겐 지역 내에서는 180일 기간 동안 최대 90일까지만 체류할 수 있는 규칙입니다. 이 규칙을 위반하면 입국 거부나 향후 비자 발급에 제한을 받을 수 있습니다.',
        },
        {
          q: '계산 결과가 정확한가요?',
          a: 'DINO는 공식 셰겐 규정에 따라 정확하게 계산하지만, 실제 출입국 시에는 해당 국가의 공식 기관에서 다시 한 번 확인하시는 것을 권장합니다. 본 서비스는 참고용입니다.',
        },
        {
          q: '미래 여행 계획도 확인할 수 있나요?',
          a: "네, '미래 여행 계획' 기능을 통해 예정된 여행이 셰겐 규칙에 위배되지 않는지 미리 확인할 수 있습니다.",
        },
      ],
    },
    {
      category: 'Google 서비스 연동',
      questions: [
        {
          q: 'Gmail 연동은 어떻게 작동하나요?',
          a: 'Gmail 연동을 활성화하면 항공사 예약 확인서 등 여행 관련 이메일을 자동으로 스캔하여 여행 일정을 추출합니다. 모든 처리는 안전하게 이루어지며, 필요한 정보만 추출됩니다.',
        },
        {
          q: 'Google Calendar와 동기화할 수 있나요?',
          a: '네, Calendar 연동을 통해 여행 일정을 자동으로 동기화할 수 있습니다. DINO에서 입력한 여행 기록이 자동으로 캘린더에 추가됩니다.',
        },
        {
          q: 'Google 연동을 해제하고 싶어요.',
          a: '설정 페이지에서 언제든지 Google 서비스 연동을 해제할 수 있습니다. 연동 해제 시 관련 데이터는 즉시 삭제됩니다.',
        },
      ],
    },
    {
      category: '알림 및 설정',
      questions: [
        {
          q: '알림은 어떻게 설정하나요?',
          a: '설정 페이지에서 비자 만료 알림, 셰겐 체류 한도 경고 등의 알림을 설정할 수 있습니다. 이메일 또는 브라우저 푸시 알림으로 받을 수 있습니다.',
        },
        {
          q: '시간대 설정을 변경할 수 있나요?',
          a: '네, 설정 페이지에서 시간대를 변경할 수 있습니다. 이는 여행 기록의 날짜 계산에 영향을 주므로 현재 거주지 또는 주요 활동 지역의 시간대로 설정하시는 것을 권장합니다.',
        },
      ],
    },
    {
      category: '개인정보 보호',
      questions: [
        {
          q: '내 데이터는 안전한가요?',
          a: '네, DINO는 업계 표준 보안 조치를 적용하여 개인정보를 보호합니다. 모든 데이터는 암호화되어 저장되며, GDPR 및 개인정보보호법을 준수합니다.',
        },
        {
          q: '데이터를 제3자와 공유하나요?',
          a: '아니요, DINO는 사용자의 사전 동의 없이는 개인정보를 제3자와 공유하지 않습니다. 자세한 내용은 개인정보처리방침을 참조해주세요.',
        },
        {
          q: 'Google이 내 데이터에 접근할 수 있나요?',
          a: 'Google은 OAuth 인증과 API 서비스 제공을 위해서만 제한적으로 접근합니다. DINO는 최소 권한 원칙을 적용하여 필요한 데이터만 요청합니다.',
        },
      ],
    },
    {
      category: '기술적 문제',
      questions: [
        {
          q: '사이트가 느리게 로딩됩니다.',
          a: '인터넷 연결을 확인하고 브라우저 캐시를 삭제해보세요. 문제가 지속되면 다른 브라우저나 시크릿 모드를 시도해보시기 바랍니다.',
        },
        {
          q: '로그인이 안 됩니다.',
          a: '브라우저의 쿠키 및 JavaScript가 활성화되어 있는지 확인해주세요. 그래도 문제가 있다면 고객센터로 문의해주시기 바랍니다.',
        },
        {
          q: '데이터가 저장되지 않습니다.',
          a: '브라우저 설정에서 로컬 스토리지가 차단되어 있지 않은지 확인해주세요. 시크릿 모드에서는 일부 기능이 제한될 수 있습니다.',
        },
      ],
    },
  ];

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='bg-surface border border-border rounded-lg p-8'>
        <h1 className='text-3xl font-bold text-primary mb-8'>
          자주 묻는 질문 (FAQ)
        </h1>

        <div className='space-y-8'>
          {faqData.map((category, categoryIndex) => (
            <section key={categoryIndex}>
              <h2 className='text-2xl font-semibold text-primary mb-6 pb-3 border-b border-border'>
                {category.category}
              </h2>

              <div className='space-y-6'>
                {category.questions.map((item, questionIndex) => (
                  <div
                    key={questionIndex}
                    className='bg-background border border-border rounded-lg p-6'
                  >
                    <h3 className='text-lg font-semibold text-primary mb-3 flex items-start'>
                      <span className='text-primary mr-3 flex-shrink-0'>
                        Q.
                      </span>
                      {item.q}
                    </h3>
                    <div className='text-secondary leading-relaxed flex items-start'>
                      <span className='text-success mr-3 flex-shrink-0 font-semibold'>
                        A.
                      </span>
                      <p>{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className='mt-12 pt-8 border-t border-border'>
          <div className='bg-background border border-border rounded-lg p-6'>
            <h3 className='text-lg font-semibold text-primary mb-4'>
              추가 도움이 필요하신가요?
            </h3>
            <div className='space-y-3 text-secondary'>
              <p>
                위의 FAQ에서 원하는 답변을 찾지 못하셨다면, 언제든지
                문의해주세요.
              </p>
              <div className='flex flex-col sm:flex-row gap-4'>
                <div className='flex items-center'>
                  <span className='font-medium mr-2'>📧 이메일:</span>
                  <a
                    href='mailto:support@dino-app.com'
                    className='text-primary hover:underline'
                  >
                    support@dino-app.com
                  </a>
                </div>
                <div className='flex items-center'>
                  <span className='font-medium mr-2'>📞 응답 시간:</span>
                  <span>평일 24시간 이내</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-8 pt-8 border-t border-border'>
          <div className='flex justify-between items-center'>
            <p className='text-sm text-tertiary'>
              최종 업데이트: 2024년 7월 28일
            </p>
            <BackButton />
          </div>
        </div>
      </div>
    </div>
  );
}
