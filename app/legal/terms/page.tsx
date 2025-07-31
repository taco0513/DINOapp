import { Metadata } from 'next';
import BackButton from '@/components/legal/BackButton';

export const metadata: Metadata = {
  title: '이용약관 | DINO',
  description: 'DINO 서비스 이용약관',
};

export default function TermsOfService() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='bg-surface border border-border rounded-lg p-8'>
        <h1 className='text-3xl font-bold text-primary mb-8'>
          DINO 서비스 이용약관
        </h1>

        <div className='space-y-8 text-secondary'>
          <section>
            <h2 className='text-xl font-semibold text-primary mb-4'>
              제1조 (목적)
            </h2>
            <p className='leading-relaxed'>
              본 약관은 DINO(이하 "서비스")가 제공하는 디지털 노마드 여행 관리
              플랫폼 서비스의 이용조건 및 절차, 회사와 이용자 간의 권리, 의무 및
              책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold text-primary mb-4'>
              제2조 (정의)
            </h2>
            <div className='space-y-3'>
              <p>
                <strong>1. "서비스"</strong>: DINO가 제공하는 여행 기록 관리,
                비자 추적, 셰겐 계산 등의 온라인 서비스
              </p>
              <p>
                <strong>2. "이용자"</strong>: 본 약관에 따라 서비스를 이용하는
                회원 및 비회원
              </p>
              <p>
                <strong>3. "회원"</strong>: 서비스에 개인정보를 제공하여
                회원등록을 한 자
              </p>
              <p>
                <strong>4. "여행 데이터"</strong>: 이용자가 입력하거나 Google
                서비스 연동을 통해 수집된 여행 관련 정보
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-xl font-semibold text-primary mb-4'>
              제3조 (약관의 게시와 개정)
            </h2>
            <div className='space-y-3'>
              <p>1. 본 약관은 서비스 웹사이트에 게시하여 공시합니다.</p>
              <p>
                2. 회사는 필요한 경우 본 약관을 개정할 수 있으며, 개정된 약관은
                공지사항을 통해 공지합니다.
              </p>
              <p>3. 개정약관은 공지한 날로부터 7일 후부터 효력이 발생합니다.</p>
            </div>
          </section>

          <section>
            <h2 className='text-xl font-semibold text-primary mb-4'>
              제4조 (서비스의 제공 및 변경)
            </h2>
            <div className='space-y-3'>
              <p>1. 회사는 다음과 같은 서비스를 제공합니다:</p>
              <ul className='ml-6 space-y-2 list-disc'>
                <li>여행 기록 관리 및 시각화</li>
                <li>셰겐 지역 90/180일 규칙 자동 계산</li>
                <li>비자 만료 및 체류 한도 알림</li>
                <li>Google 서비스(Gmail, Calendar) 연동</li>
                <li>여행 데이터 백업 및 복원</li>
              </ul>
              <p>
                2. 회사는 서비스의 품질 향상을 위해 서비스를 변경할 수 있습니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-xl font-semibold text-primary mb-4'>
              제5조 (회원가입)
            </h2>
            <div className='space-y-3'>
              <p>1. 회원가입은 Google OAuth 2.0을 통해 진행됩니다.</p>
              <p>
                2. 회원가입 신청자가 본 약관에 동의하고 회원가입을 완료하면
                회사는 원칙적으로 회원으로 등록합니다.
              </p>
              <p>3. 다음의 경우 회원가입을 거절할 수 있습니다:</p>
              <ul className='ml-6 space-y-1 list-disc'>
                <li>실명이 아니거나 타인의 정보를 이용한 경우</li>
                <li>서비스 운영을 고의로 방해한 이력이 있는 경우</li>
                <li>기타 회사가 정한 이용신청 요건을 충족하지 않는 경우</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className='text-xl font-semibold text-primary mb-4'>
              제6조 (개인정보 보호)
            </h2>
            <div className='space-y-3'>
              <p>
                1. 회사는 이용자의 개인정보를 보호하기 위해 최선을 다합니다.
              </p>
              <p>
                2. 개인정보의 수집, 이용, 제공에 관한 사항은 별도의
                개인정보처리방침에 따릅니다.
              </p>
              <p>
                3. Google 서비스 연동 시 최소 권한 원칙을 적용하며, 필요한
                데이터만을 수집합니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-xl font-semibold text-primary mb-4'>
              제7조 (이용자의 의무)
            </h2>
            <div className='space-y-3'>
              <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
              <ul className='ml-6 space-y-1 list-disc'>
                <li>허위 정보 입력 또는 타인의 정보 도용</li>
                <li>서비스의 정상적 운영을 방해하는 행위</li>
                <li>다른 이용자의 개인정보를 수집하거나 이용하는 행위</li>
                <li>
                  서비스를 통해 얻은 정보를 회사의 사전 승낙 없이 복제, 유통하는
                  행위
                </li>
                <li>공공질서나 미풍양속에 위배되는 행위</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className='text-xl font-semibold text-primary mb-4'>
              제8조 (서비스 제공의 중단)
            </h2>
            <div className='space-y-3'>
              <p>회사는 다음의 경우 서비스 제공을 중단할 수 있습니다:</p>
              <ul className='ml-6 space-y-1 list-disc'>
                <li>
                  컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절
                </li>
                <li>정전, 제반 설비의 장애 또는 이용량의 폭증</li>
                <li>기타 불가항력적 사유</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className='text-xl font-semibold text-primary mb-4'>
              제9조 (면책조항)
            </h2>
            <div className='space-y-3'>
              <p>
                1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를
                제공할 수 없는 경우에는 책임을 지지 않습니다.
              </p>
              <p>
                2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는
                책임을 지지 않습니다.
              </p>
              <p>
                3. 본 서비스에서 제공하는 비자 및 출입국 정보는 참고용이며,
                정확한 정보는 해당 국가의 공식 기관에서 확인하시기 바랍니다.
              </p>
              <p>
                4. 회사는 셰겐 계산 결과의 정확성을 보장하지 않으며, 실제 출입국
                시에는 관련 법규를 별도로 확인하시기 바랍니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-xl font-semibold text-primary mb-4'>
              제10조 (분쟁해결)
            </h2>
            <p>
              본 약관과 관련하여 발생한 분쟁에 대해서는 대한민국 법을 적용하며,
              관할법원은 서울중앙지방법원으로 합니다.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold text-primary mb-4'>부칙</h2>
            <p>본 약관은 2024년 7월 28일부터 시행됩니다.</p>
          </section>
        </div>

        <div className='mt-12 pt-8 border-t border-border'>
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
