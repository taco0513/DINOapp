# 📋 Template i18n - 템플릿에 내장된 다국어 지원

## 📋 개요

Industry Template에 다국어 지원을 기본으로 내장하여, 개발자가 템플릿을 선택하는 순간부터 글로벌 앱을 만들 수 있도록 합니다. 각 업종별 특화된 용어와 문화적 컨벥션을 미리 적용해 둡니다.

## 🎯 핵심 목표

1. **Pre-configured i18n**: 템플릿에 i18n 기본 설정 포함
2. **Industry Glossary**: 업종별 전문 용어집 내장
3. **Cultural Templates**: 문화권별 UI/UX 패턴 적용
4. **Zero Configuration**: 추가 설정 없이 바로 사용
5. **Extensible**: 쉽게 확장 가능한 구조

## 🏗️ 템플릿 i18n 아키텍처

```typescript
interface TemplateI18nSystem {
  // 템플릿 구성
  template: {
    base: BaseTemplate;
    i18n: I18nConfiguration;
    glossary: IndustryGlossary;
    cultural: CulturalAdaptations;
  };

  // 자동 번역
  automation: {
    extractor: StringExtractor;
    translator: AutoTranslator;
    validator: TranslationValidator;
    deployer: I18nDeployer;
  };

  // 커스터마이징
  customization: {
    overrides: LocaleOverrides;
    extensions: GlossaryExtensions;
    themes: CulturalThemes;
  };
}
```

## 🏢 업종별 i18n 템플릿

### 1. E-commerce 템플릿

```typescript
// templates/ecommerce/i18n/config.ts
export const ecommerceI18nConfig: TemplateI18nConfig = {
  // 기본 언어
  defaultLocale: 'en',

  // 지원 언어
  supportedLocales: ['en', 'ko', 'ja', 'zh', 'es', 'fr', 'de'],

  // 업종 특화 번역
  industryTranslations: {
    en: {
      // 제품 관련
      'product.outOfStock': 'Out of Stock',
      'product.addToCart': 'Add to Cart',
      'product.buyNow': 'Buy Now',
      'product.wishlist': 'Add to Wishlist',

      // 결제 프로세스
      'checkout.title': 'Checkout',
      'checkout.shipping': 'Shipping Information',
      'checkout.payment': 'Payment Method',
      'checkout.review': 'Review Order',

      // 주문 상태
      'order.pending': 'Payment Pending',
      'order.processing': 'Processing',
      'order.shipped': 'Shipped',
      'order.delivered': 'Delivered'
    },

    ko: {
      // 제품 관련
      'product.outOfStock': '품절',
      'product.addToCart': '장바구니 담기',
      'product.buyNow': '바로 구매',
      'product.wishlist': '찜하기',

      // 결제 프로세스
      'checkout.title': '주문/결제',
      'checkout.shipping': '배송 정보',
      'checkout.payment': '결제 수단',
      'checkout.review': '주문 확인',

      // 주문 상태
      'order.pending': '결제 대기',
      'order.processing': '처리 중',
      'order.shipped': '배송 중',
      'order.delivered': '배송 완료'
    },

    ja: {
      // 제품 관련
      'product.outOfStock': '在庫切れ',
      'product.addToCart': 'カートに入れる',
      'product.buyNow': '今すぐ購入',
      'product.wishlist': 'お気に入りに追加',

      // 결제 프로세스
      'checkout.title': 'レジに進む',
      'checkout.shipping': '配送情報',
      'checkout.payment': 'お支払い方法',
      'checkout.review': 'ご注文の確認'
    }
  },

  // 통화 설정
  currencies: {
    USD: { symbol: '$', position: 'before' },
    KRW: { symbol: '₩', position: 'before' },
    JPY: { symbol: '¥', position: 'before' },
    EUR: { symbol: '€', position: 'before' }
  }
};

// 컴포넌트 예시
export const ProductCard: React.FC<ProductProps> = ({ product }) => {
  const { t, i18n } = useTranslation();
  const currency = getCurrency(i18n.language);

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">
        {formatPrice(product.price, currency)}
      </p>
      {product.inStock ? (
        <button className="btn-primary">
          {t('product.addToCart')}
        </button>
      ) : (
        <button className="btn-disabled" disabled>
          {t('product.outOfStock')}
        </button>
      )}
    </div>
  );
};
```

### 2. Healthcare 템플릿

```typescript
// templates/healthcare/i18n/config.ts
export const healthcareI18nConfig: TemplateI18nConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'ko', 'ja', 'zh', 'es'],

  industryTranslations: {
    en: {
      // 환자 관련
      'patient.profile': 'Patient Profile',
      'patient.history': 'Medical History',
      'patient.appointments': 'Appointments',
      'patient.prescriptions': 'Prescriptions',

      // 의료 용어
      'medical.diagnosis': 'Diagnosis',
      'medical.symptoms': 'Symptoms',
      'medical.treatment': 'Treatment Plan',
      'medical.medication': 'Medication',

      // 예약 시스템
      'appointment.book': 'Book Appointment',
      'appointment.reschedule': 'Reschedule',
      'appointment.cancel': 'Cancel Appointment',
      'appointment.reminder': 'Appointment Reminder',
    },

    ko: {
      // 환자 관련
      'patient.profile': '환자 정보',
      'patient.history': '진료 기록',
      'patient.appointments': '예약 내역',
      'patient.prescriptions': '처방전',

      // 의료 용어
      'medical.diagnosis': '진단',
      'medical.symptoms': '증상',
      'medical.treatment': '치료 계획',
      'medical.medication': '약물',

      // 예약 시스템
      'appointment.book': '진료 예약',
      'appointment.reschedule': '예약 변경',
      'appointment.cancel': '예약 취소',
      'appointment.reminder': '예약 알림',
    },
  },

  // HIPAA 준수 문구
  privacyNotices: {
    en: 'Your health information is protected by HIPAA',
    ko: '귀하의 건강 정보는 HIPAA에 의해 보호됩니다',
  },
};
```

### 3. Education 템플릿

```typescript
// templates/education/i18n/config.ts
export const educationI18nConfig: TemplateI18nConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'ko', 'ja', 'zh', 'es', 'fr'],

  industryTranslations: {
    en: {
      // 학습 관련
      'course.enroll': 'Enroll Now',
      'course.progress': 'Course Progress',
      'course.complete': 'Complete Course',
      'course.certificate': 'Get Certificate',

      // 학습 자료
      'material.video': 'Video Lesson',
      'material.quiz': 'Quiz',
      'material.assignment': 'Assignment',
      'material.resource': 'Resources',

      // 평가
      'assessment.start': 'Start Test',
      'assessment.submit': 'Submit Answer',
      'assessment.score': 'Your Score',
      'assessment.feedback': 'Feedback',
    },

    ko: {
      // 학습 관련
      'course.enroll': '수강 신청',
      'course.progress': '학습 진도',
      'course.complete': '과정 완료',
      'course.certificate': '수료증 발급',

      // 학습 자료
      'material.video': '동영상 강의',
      'material.quiz': '퀴즈',
      'material.assignment': '과제',
      'material.resource': '학습 자료',

      // 평가
      'assessment.start': '시험 시작',
      'assessment.submit': '답안 제출',
      'assessment.score': '점수',
      'assessment.feedback': '피드백',
    },
  },
};
```

## 🌍 문화적 적응 템플릿

### 1. 날짜/시간 형식

```typescript
interface DateTimeFormats {
  [locale: string]: {
    short: string;
    long: string;
    time: string;
    relative: boolean;
  };
}

const dateTimeFormats: DateTimeFormats = {
  'en-US': {
    short: 'MM/DD/YYYY',
    long: 'MMMM D, YYYY',
    time: '12h',
    relative: true, // "2 hours ago"
  },
  'ko-KR': {
    short: 'YYYY.MM.DD',
    long: 'YYYY년 M월 D일',
    time: '24h',
    relative: false, // "2024.01.15 14:30"
  },
  'ja-JP': {
    short: 'YYYY/MM/DD',
    long: 'YYYY年M月D日',
    time: '24h',
    relative: false,
  },
};

// 사용 예시
function formatDate(
  date: Date,
  locale: string,
  format: 'short' | 'long'
): string {
  const fmt = dateTimeFormats[locale] || dateTimeFormats['en-US'];

  if (fmt.relative && format === 'short') {
    return formatRelativeTime(date, locale);
  }

  return formatAbsoluteDate(date, fmt[format]);
}
```

### 2. 주소 형식

```typescript
interface AddressFormat {
  fields: string[];
  required: string[];
  postalCodeFormat?: RegExp;
  phoneFormat?: RegExp;
}

const addressFormats: Record<string, AddressFormat> = {
  'US': {
    fields: ['street', 'city', 'state', 'zipCode'],
    required: ['street', 'city', 'state', 'zipCode'],
    postalCodeFormat: /^\d{5}(-\d{4})?$/
  },
  'KR': {
    fields: ['postalCode', 'province', 'city', 'street', 'detail'],
    required: ['postalCode', 'street'],
    postalCodeFormat: /^\d{5}$/
  },
  'JP': {
    fields: ['postalCode', 'prefecture', 'city', 'street', 'building'],
    required: ['postalCode', 'prefecture', 'city', 'street'],
    postalCodeFormat: /^\d{3}-\d{4}$/
  }
};

// 동적 폼 생성
function AddressForm({ locale }: { locale: string }) {
  const format = addressFormats[getCountryFromLocale(locale)];

  return (
    <form>
      {format.fields.map(field => (
        <FormField
          key={field}
          name={field}
          label={t(`address.${field}`)}
          required={format.required.includes(field)}
          validation={getFieldValidation(field, format)}
        />
      ))}
    </form>
  );
}
```

## 📝 템플릿 i18n 자동화

### 1. 문자열 추출 자동화

```typescript
class TemplateI18nExtractor {
  async extractStrings(templatePath: string): Promise<ExtractedStrings> {
    const files = await this.scanTemplateFiles(templatePath);
    const strings = new Map<string, string[]>();

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');

      // JSX/TSX 파일에서 추출
      if (file.match(/\.(jsx?|tsx?)$/)) {
        const jsxStrings = this.extractFromJSX(content);
        strings.set(file, jsxStrings);
      }

      // 템플릿 파일에서 추출
      if (file.match(/\.(hbs|ejs|pug)$/)) {
        const templateStrings = this.extractFromTemplate(content);
        strings.set(file, templateStrings);
      }
    }

    return this.generateI18nKeys(strings);
  }

  private extractFromJSX(content: string): string[] {
    const strings: string[] = [];

    // 텍스트 콘텐츠
    const textRegex = />([^<>{]+)</g;
    const matches = content.matchAll(textRegex);

    for (const match of matches) {
      const text = match[1].trim();
      if (text && !this.isVariable(text)) {
        strings.push(text);
      }
    }

    // 속성 값
    const attrRegex = /(placeholder|title|alt|aria-label)=["']([^"']+)["']/g;
    const attrMatches = content.matchAll(attrRegex);

    for (const match of attrMatches) {
      strings.push(match[2]);
    }

    return strings;
  }

  private generateI18nKeys(strings: Map<string, string[]>): I18nKeys {
    const keys: I18nKeys = {};

    strings.forEach((stringList, file) => {
      const namespace = this.getNamespace(file);

      stringList.forEach(str => {
        const key = this.generateKey(str, namespace);
        keys[key] = str;
      });
    });

    return keys;
  }
}
```

### 2. 템플릿 배포 시스템

```typescript
class TemplateI18nDeployer {
  async deployTemplate(
    template: Template,
    targetLocales: string[]
  ): Promise<DeploymentResult> {
    const results: DeploymentResult[] = [];

    // 1. 기본 템플릿 준비
    const baseTemplate = await this.prepareBaseTemplate(template);

    // 2. 각 로케일별 처리
    for (const locale of targetLocales) {
      // 번역 로드
      const translations = await this.loadTranslations(template.id, locale);

      // 문화적 적응
      const culturalAdaptations = await this.getCulturalAdaptations(locale);

      // 템플릿 생성
      const localizedTemplate = await this.createLocalizedTemplate({
        base: baseTemplate,
        locale,
        translations,
        adaptations: culturalAdaptations,
      });

      // 배포
      const result = await this.deploy(localizedTemplate, locale);
      results.push(result);
    }

    return this.consolidateResults(results);
  }

  private async createLocalizedTemplate(
    config: LocalizationConfig
  ): Promise<Template> {
    return {
      ...config.base,
      locale: config.locale,

      // i18n 설정 주입
      config: {
        ...config.base.config,
        i18n: {
          defaultLocale: config.locale,
          translations: config.translations,
          dateFormat: config.adaptations.dateFormat,
          numberFormat: config.adaptations.numberFormat,
          currency: config.adaptations.currency,
        },
      },

      // 컴포넌트 수정
      components: this.localizeComponents(
        config.base.components,
        config.locale
      ),

      // 스타일 조정
      styles: this.adaptStyles(config.base.styles, config.adaptations),
    };
  }
}
```

## 📊 템플릿 i18n 품질 보증

```typescript
class TemplateI18nValidator {
  async validateTemplate(template: Template): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];

    // 1. 번역 완전성 검사
    const missingTranslations =
      await this.checkTranslationCompleteness(template);
    if (missingTranslations.length > 0) {
      issues.push({
        type: 'missing_translation',
        severity: 'error',
        items: missingTranslations,
      });
    }

    // 2. 문화적 적절성 검사
    const culturalIssues = await this.checkCulturalAppropriateness(template);
    issues.push(...culturalIssues);

    // 3. 기능 테스트
    const functionalTests = await this.runFunctionalTests(template);
    issues.push(...functionalTests);

    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      score: this.calculateQualityScore(issues),
    };
  }
}
```

## 🎯 Best Practices

### 1. 템플릿 개발 가이드라인

```typescript
const TEMPLATE_I18N_GUIDELINES = {
  // 필수 언어
  requiredLocales: ['en', 'ko', 'ja', 'zh'],

  // 번역 품질 기준
  qualityThreshold: {
    accuracy: 95, // %
    completeness: 100, // %
    cultural: 90, // %
  },

  // 테스트 요구사항
  testing: {
    locales: 'all',
    scenarios: ['rtl', 'long-text', 'special-chars'],
    devices: ['mobile', 'tablet', 'desktop'],
  },
};
```

### 2. 템플릿 선택 가이드

```typescript
function TemplateSelector({ locale, industry }: SelectorProps) {
  const { t } = useTranslation();
  const templates = getTemplatesForIndustry(industry);

  return (
    <div className="template-grid">
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          preview={
            <LocalizedPreview
              template={template}
              locale={locale}
              industry={industry}
            />
          }
          features={
            template.i18nFeatures.map(feature => (
              <li key={feature}>{t(`template.feature.${feature}`)}</li>
            ))
          }
        />
      ))}
    </div>
  );
}
```

### 3. 성공 지표

```typescript
const TEMPLATE_I18N_METRICS = {
  // 사용성
  adoptionRate: {
    global: 85, // % of users using localized versions
    perLocale: {
      ko: 95,
      ja: 92,
      zh: 88,
    },
  },

  // 품질
  translationQuality: {
    accuracy: 97,
    consistency: 99,
    cultural: 94,
  },

  // 비즈니스 성과
  businessImpact: {
    conversionIncrease: 35, // %
    supportTicketDecrease: 60, // %
    timeToMarket: 80, // % faster
  },
};
```

---

_Template i18n: 글로벌 앱을 위한 완벽한 시작점_
