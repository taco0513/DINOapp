# 비즈니스 및 법적 기초

## 개요

개발자가 사업을 시작할 때 꼭 알아야 할 비즈니스와 법적 기초 사항을 다룹니다. 복잡한 법률 용어 없이 실무에 필요한 핵심만 정리했습니다.

## 사업자 등록

### 언제 해야 하나요?

```typescript
// 사업자 등록 타이밍 체커
class BusinessRegistrationChecker {
  shouldRegister(): RegistrationDecision {
    const criteria = {
      // 즉시 등록 필요
      immediate: [
        "첫 매출 발생",
        "계약서 체결 필요",
        "세금계산서 발행 필요",
        "결제 시스템 등록 필요"
      ],
      
      // 한달 내 등록 권장
      withinMonth: [
        "월 100만원 이상 매출 예상",
        "유료 사용자 10명 이상",
        "광고 집행 계획",
        "투자 유치 필요"
      ],
      
      // 아직 기다려도 OK
      canWait: [
        "무료 베타 테스트 중",
        "취미 프로젝트",
        "아직 수익 모델 불확실",
        "개인 학습 목적"
      ]
    };
    
    return this.evaluateCriteria(criteria);
  }
}
```

### 사업자 등록 프로세스 (한국)

```typescript
// 사업자 등록 가이드
class KoreanBusinessRegistration {
  async registerBusiness(): Promise<RegistrationGuide> {
    return {
      // 1. 온라인 신청 (10분)
      online: {
        site: "www.hometax.go.kr",
        process: [
          "공동인증서 로그인",
          "사업자등록 신청",
          "개인사업자 선택",
          "업종 선택 (SW 개발, 웹서비스 등)",
          "주소지 입력",
          "즉시 발급"
        ],
        required: [
          "공동인증서",
          "주민등록번호",
          "사업장 주소 (자택 가능)"
        ],
        cost: 0
      },
      
      // 2. 업종 선택 팁
      businessTypes: {
        recommended: [
          {
            code: "63111",
            name: "컴퓨터 프로그래밍 서비스업",
            good: "SaaS, 웹 개발"
          },
          {
            code: "63112",
            name: "컴퓨터 시스템 통합 자문업",
            good: "컨설팅, 기술 자문"
          },
          {
            code: "63991",
            name: "그 외 정보 서비스업",
            good: "모바일 앱, AI 서비스"
          }
        ]
      },
      
      // 3. 세금 기초
      taxes: {
        basicRate: "10% 부가세 (매출의 10%)",
        filing: "3개월마다 신고",
        simplified: "연 4800만원 미만 시 간이과세자 가능",
        tips: [
          "비용 처리 가능 항목 확인",
          "세금계산서 보관 의무",
          "세무사 상담은 월 500만원 넘을 때"
        ]
      }
    };
  }
}
```

## 개인정보보호

### 필수 준비 사항

```typescript
// 개인정보보호 체크리스트
class PrivacyComplianceChecker {
  getRequirements(): PrivacyRequirements {
    return {
      // 필수 페이지
      requiredPages: [
        {
          page: "개인정보처리방침",
          mustInclude: [
            "수집 항목 (이름, 이메일 등)",
            "수집 목적",
            "보관 기간",
            "제3자 제공 여부",
            "사용자 권리",
            "책임자 연락처"
          ],
          template: this.getPrivacyPolicyTemplate()
        },
        {
          page: "서비스 이용약관",
          mustInclude: [
            "서비스 내용",
            "사용자 의무",
            "금지사항",
            "책임 제한",
            "분쟁 해결"
          ],
          template: this.getTermsTemplate()
        }
      ],
      
      // 동의 받기
      consentRequirements: {
        signupProcess: [
          "필수 동의와 선택 동의 분리",
          "전체 동의 버튼 하나로 처리",
          "각 항목 별도 동의 받기",
          "동의 기록 저장"
        ],
        marketingConsent: {
          separate: true,
          optional: true,
          withdrawable: true
        }
      },
      
      // 보안 조치
      securityMeasures: [
        "HTTPS 필수",
        "비밀번호 암호화",
        "민감 정보 마스킹",
        "접근 기록 보관",
        "정기 보안 점검"
      ]
    };
  }
  
  private getPrivacyPolicyTemplate(): string {
    return `# 개인정보처리방침

[Service Name](이하 '회사')는 사용자의 개인정보를 중요시합니다.

## 1. 수집하는 개인정보
- 필수: 이메일, 닉네임
- 선택: 프로필 사진

## 2. 수집 목적
- 회원 가입 및 관리
- 서비스 제공
- 고객 지원

## 3. 보관 기간
- 회원 탈퇴 시까지
- 법령에 따른 보관

## 4. 사용자 권리
- 열람, 수정, 삭제 권리
- 처리 정지 요구권
- 동의 철회권

## 5. 문의
이메일: privacy@example.com`;
  }
}
```

## 결제 시스템

### 결제 수단 선택

```typescript
// 결제 시스템 비교
class PaymentSystemComparison {
  compareOptions(): PaymentComparison[] {
    return [
      {
        provider: "Stripe",
        pros: [
          "글로벌 지원 최고",
          "개발자 친화적 API",
          "다양한 결제 수단",
          "구독 결제 지원 우수"
        ],
        cons: [
          "한국 직접 진출 안함",
          "한국 카드 수수료 높음"
        ],
        fees: {
          domestic: "3.4% + ₩340",
          international: "4.4% + ₩340",
          monthly: "없음"
        },
        bestFor: "글로벌 SaaS"
      },
      {
        provider: "토스페이먼츠",
        pros: [
          "한국 카드사 직접 연동",
          "낮은 수수료",
          "간편한 연동",
          "한국어 지원"
        ],
        cons: [
          "해외 결제 제한적",
          "API 문서 부족"
        ],
        fees: {
          domestic: "2.8%",
          international: "3.9%",
          monthly: "없음"
        },
        bestFor: "한국 대상 서비스"
      },
      {
        provider: "아임포트",
        pros: [
          "가장 저렴한 수수료",
          "다양한 PG사 통합",
          "한국 시장 최적화"
        ],
        cons: [
          "복잡한 연동 과정",
          "개발 문서 부족"
        ],
        fees: {
          domestic: "2.2% ~ 2.8%",
          setup: "초기 설치비 있음",
          monthly: "월 고정비 가능"
        },
        bestFor: "대규모 결제"
      }
    ];
  }
}
```

## 세무 기초

### 초기 세무 가이드

```typescript
// 개발자를 위한 세무 기초
class TaxBasicsForDevs {
  getEssentials(): TaxEssentials {
    return {
      // 기본 개념
      basics: {
        "매출": "받은 돈 전체",
        "비용": "쓴 돈 (증빙 필요)",
        "소득": "매출 - 비용",
        "세금": "소득의 일정 비율"
      },
      
      // 비용 처리 가능 항목
      deductibleExpenses: [
        {
          category: "개발 비용",
          items: [
            "서버 호스팅",
            "도메인",
            "API 사용료",
            "개발 도구 라이센스",
            "클라우드 서비스"
          ]
        },
        {
          category: "마케팅",
          items: [
            "광고비",
            "콘텐츠 제작",
            "이벤트 비용"
          ]
        },
        {
          category: "인건비",
          items: [
            "프리랜서 비용",
            "외주 개발비",
            "직원 급여 (법인)"
          ]
        }
      ],
      
      // 세금 일정
      taxSchedule: {
        "부가세": {
          frequency: "분기별 (3개월마다)",
          dates: ["1월 25일", "4월 25일", "7월 25일", "10월 25일"],
          tip: "예정신고 가능 (예상 매출로)"
        },
        "종합소듍세": {
          frequency: "연 1회",
          date: "5월 31일",
          tip: "세무사 도움 받기"
        }
      },
      
      // 초보자 팁
      beginnerTips: [
        "모든 영수증 보관 (전자영수증 포함)",
        "사업용 통장 분리",
        "매월 정리 습관화",
        "세무 프로그램 사용 (삼쭉이, 더존 등)",
        "월 매출 500만원 넘으면 세무사 상담"
      ]
    };
  }
}
```

## 계약서 기초

### 필수 계약서 템플릿

```typescript
// 계약서 템플릿 관리자
class ContractTemplateManager {
  getEssentialContracts(): ContractTemplate[] {
    return [
      {
        type: "서비스 개발 계약서",
        essentialClauses: [
          "개발 범위 명확히 정의",
          "납기일 및 마일스톤",
          "대금 지급 조건",
          "지적재산권 귀속",
          "유지보수 조건",
          "책임 범위 및 제한",
          "계약 해지 조건"
        ],
        redFlags: [
          "무제한 책임 조항",
          "모호한 범위 정의",
          "일방적 변경 권한",
          "과도한 위약금"
        ]
      },
      {
        type: "프리랜서 계약서",
        essentialClauses: [
          "업무 범위 상세 기술",
          "시간당/프로젝트 단가",
          "작업 기간",
          "수정 횟수 및 범위",
          "비밀유지 조항",
          "산출물 소유권"
        ]
      },
      {
        type: "NDA (비밀유지계약)",
        essentialClauses: [
          "비밀 정보 정의",
          "사용 제한",
          "계약 기간",
          "위반 시 책임",
          "예외 사항"
        ]
      }
    ];
  }
  
  generateSimpleNDA(): string {
    return `# 비밀유지계약서

본 계약은 [Company A]와 [Company B] 간에 체결됩니다.

## 1. 목적
양 당사자는 [Project Name] 프로젝트를 위해 정보를 공유합니다.

## 2. 비밀 정보
- 기술 정보, 사업 계획, 고객 데이터 등
- "대외비"로 표시된 모든 정보

## 3. 의무
- 비밀 정보를 제3자에게 공개하지 않습니다
- 계약 목적에만 사용합니다

## 4. 기간
본 계약 체결일로부터 3년간 유효합니다.

날짜: 20XX년 XX월 XX일`;
  }
}
```

## 투자 및 지원

### 정부 지원 프로그램

```typescript
// 스타트업 지원 프로그램 가이드
class StartupSupportPrograms {
  getKoreanPrograms(): SupportProgram[] {
    return [
      {
        name: "예비창업패키지",
        provider: "창업진흥원",
        benefits: [
          "창업교육 (40시간)",
          "창업자금 최대 1억원",
          "멘토링"
        ],
        requirements: [
          "예비창업자",
          "창업 3년 미만"
        ],
        difficulty: "LOW",
        timeline: "3-6개월"
      },
      {
        name: "TIPS 프로그램",
        provider: "중소벤처기업부",
        benefits: [
          "최대 5억원 지원",
          "민간 투자 연계",
          "R&D 자금"
        ],
        requirements: [
          "기술 기반 스타트업",
          "민간 투자 유치"
        ],
        difficulty: "HIGH",
        timeline: "6-12개월"
      },
      {
        name: "창업사관학교",
        provider: "각 지역별",
        benefits: [
          "무료 사무공간",
          "멘토링",
          "네트워킹"
        ],
        requirements: [
          "창업 아이템",
          "선발 테스트"
        ],
        difficulty: "MEDIUM",
        timeline: "1-2개월"
      }
    ];
  }
  
  getApplicationTips(): ApplicationTips {
    return {
      preparation: [
        "사업계획서 완성도 높이기",
        "시장 조사 데이터 준비",
        "MVP 또는 프로토타입 준비",
        "팀 구성 명확히"
      ],
      
      commonMistakes: [
        "기술만 강조 (시장성 무시)",
        "비현실적 수치 제시",
        "경쟁사 분석 부족",
        "수익 모델 불명확"
      ],
      
      timeline: {
        "6개월 전": "아이디어 검증, MVP 개발",
        "3개월 전": "사업계획서 작성, 팀 구성",
        "1개월 전": "서류 준비, 멘토 섭외",
        "신청": "최종 검토 및 제출"
      }
    };
  }
}
```

## SuperClaude 비즈니스/법적 명령어

```bash
# 사업자 등록 체크
/check-business-registration --timing --requirements

# 개인정보보호 체크리스트
/privacy-compliance --checklist --templates

# 결제 시스템 비교
/compare-payment-systems --fees --features

# 세무 기초 가이드
/tax-basics --deductibles --schedule

# 계약서 템플릿
/contract-templates --essential --red-flags

# 정부 지원 프로그램
/startup-support-programs --korea --requirements

# 법적 리스크 체크
/legal-risk-assessment --startup --mitigation

# 비용 처리 가이드
/expense-guide --tax-deductible --documentation

# 투자 준비 체크리스트
/investment-readiness --legal --documents

# 해외 진출 가이드
/global-expansion --legal-basics --payment
```

이 비즈니스 및 법적 기초 가이드를 통해 개발자가 사업을 시작할 때 필요한 최소한의 지식을 습듉할 수 있습니다.