# 🔒 Runtime Validation - 런타임 타입 안전성 보장

## 📋 개요

TypeScript의 타입 검사는 컴파일 타임에만 작동합니다. 런타임에도 타입 안전성을 보장하기 위해 강력한 런타임 검증 시스템을 구축합니다. AI가 생성한 코드와 외부 데이터를 안전하게 처리합니다.

## 🎯 핵심 목표

1. **Zero Runtime Errors**: 런타임 타입 에러 완전 차단
2. **API Safety**: 외부 API 응답 안전한 처리
3. **User Input Validation**: 사용자 입력 완벽 검증
4. **AI Output Safety**: AI 생성 코드 검증
5. **Graceful Error Handling**: 우아한 에러 처리

## 🏗️ 런타임 검증 아키텍처

```typescript
interface RuntimeValidationSystem {
  // 검증 엔진
  validators: {
    schema: SchemaValidator;
    type: TypeValidator;
    business: BusinessRuleValidator;
    security: SecurityValidator;
  };

  // 에러 처리
  errors: {
    handler: ErrorHandler;
    reporter: ErrorReporter;
    recovery: ErrorRecovery;
    logger: ErrorLogger;
  };

  // 성능 최적화
  optimization: {
    cache: ValidationCache;
    lazy: LazyValidator;
    batch: BatchValidator;
  };
}
```

## 🔧 Zod를 활용한 스키마 검증

### 1. 기본 스키마 정의

```typescript
import { z } from 'zod';

// 사용자 스키마
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150),
  role: z.enum(['admin', 'user', 'guest']),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    language: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/),
    notifications: z.boolean(),
  }),
  createdAt: z.string().datetime(),
  metadata: z.record(z.unknown()).optional(),
});

// 타입 추론
type User = z.infer<typeof UserSchema>;

// 검증 함수
function validateUser(data: unknown): User {
  try {
    return UserSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid user data', error.errors);
    }
    throw error;
  }
}
```

### 2. 고급 스키마 패턴

```typescript
// 조건부 스키마
const PaymentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('credit_card'),
    cardNumber: z.string().regex(/^\d{16}$/),
    cvv: z.string().regex(/^\d{3,4}$/),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
  }),
  z.object({
    type: z.literal('bank_transfer'),
    accountNumber: z.string(),
    routingNumber: z.string(),
    accountHolder: z.string(),
  }),
  z.object({
    type: z.literal('paypal'),
    email: z.string().email(),
    paypalId: z.string(),
  }),
]);

// 상호 의존 필드
const PasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// 비동기 검증
const AsyncUserSchema = UserSchema.extend({
  username: z.string().refine(
    async username => {
      const exists = await checkUsernameExists(username);
      return !exists;
    },
    { message: 'Username already taken' }
  ),
});
```

### 3. 커스텀 타입 가드

```typescript
// 브랜드 타입 검증
const EmailBrand = z.string().email().brand<'Email'>();
type Email = z.infer<typeof EmailBrand>;

// 커스텀 검증 로직
const PhoneNumberSchema = z.string().refine(
  val => {
    // 국제 전화번호 형식 검증
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(val.replace(/\s|-/g, ''));
  },
  {
    message: 'Invalid phone number format',
  }
);

// 복합 검증
const DateRangeSchema = z
  .object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine(data => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });
```

## 🔍 API 응답 검증

### 1. API 클라이언트 래퍼

```typescript
class SafeApiClient {
  private schemas = new Map<string, z.ZodSchema>();

  // 스키마 등록
  registerSchema<T>(endpoint: string, schema: z.ZodSchema<T>): void {
    this.schemas.set(endpoint, schema);
  }

  // 안전한 API 호출
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpoint);
    const data = await response.json();

    // 스키마 검증
    const schema = this.schemas.get(endpoint);
    if (!schema) {
      throw new Error(`No schema registered for ${endpoint}`);
    }

    try {
      return schema.parse(data) as T;
    } catch (error) {
      throw new ApiValidationError(`Invalid response from ${endpoint}`, error);
    }
  }

  // 배치 검증
  async batchValidate<T>(
    items: unknown[],
    schema: z.ZodSchema<T>
  ): Promise<{ valid: T[]; invalid: ValidationError[] }> {
    const results = await Promise.allSettled(
      items.map(item => schema.parseAsync(item))
    );

    const valid: T[] = [];
    const invalid: ValidationError[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        valid.push(result.value);
      } else {
        invalid.push({
          index,
          error: result.reason,
          data: items[index],
        });
      }
    });

    return { valid, invalid };
  }
}
```

### 2. 응답 변환 및 정제

```typescript
class ResponseTransformer {
  // 날짜 문자열을 Date 객체로 변환
  static dateTransform = z.string().transform(val => new Date(val));

  // 숫자 문자열을 number로 변환
  static numberTransform = z.string().transform(val => parseFloat(val));

  // 빈 문자열을 null로 변환
  static nullableTransform = z
    .string()
    .transform(val => (val === '' ? null : val));

  // API 응답 정제
  static createApiResponseSchema<T>(dataSchema: z.ZodSchema<T>) {
    return z.object({
      success: z.boolean(),
      data: dataSchema,
      error: z
        .object({
          code: z.string(),
          message: z.string(),
          details: z.any().optional(),
        })
        .optional(),
      metadata: z.object({
        timestamp: this.dateTransform,
        version: z.string(),
        requestId: z.string().uuid(),
      }),
    });
  }
}

// 사용 예시
const UserApiResponse = ResponseTransformer.createApiResponseSchema(UserSchema);

type UserApiResponse = z.infer<typeof UserApiResponse>;
```

## 🚪 입력 검증 시스템

### 1. 폼 검증

```typescript
class FormValidator {
  private schema: z.ZodSchema;
  private errors: Map<string, string[]> = new Map();

  constructor(schema: z.ZodSchema) {
    this.schema = schema;
  }

  // 필드별 검증
  validateField(fieldName: string, value: unknown): boolean {
    const fieldSchema = this.getFieldSchema(fieldName);
    if (!fieldSchema) return true;

    try {
      fieldSchema.parse(value);
      this.errors.delete(fieldName);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.errors.set(
          fieldName,
          error.errors.map(e => e.message)
        );
      }
      return false;
    }
  }

  // 전체 폼 검증
  validateForm(data: unknown): {
    valid: boolean;
    errors: Record<string, string[]>;
    data?: z.infer<typeof this.schema>;
  } {
    try {
      const validData = this.schema.parse(data);
      return {
        valid: true,
        errors: {},
        data: validData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};

        error.errors.forEach(err => {
          const path = err.path.join('.');
          if (!errors[path]) errors[path] = [];
          errors[path].push(err.message);
        });

        return {
          valid: false,
          errors,
        };
      }
      throw error;
    }
  }

  // 실시간 검증 훅
  createFieldValidator(fieldName: string) {
    return (value: unknown) => {
      const isValid = this.validateField(fieldName, value);
      return {
        valid: isValid,
        errors: this.errors.get(fieldName) || [],
      };
    };
  }
}
```

### 2. 보안 검증

```typescript
class SecurityValidator {
  // XSS 방지
  static sanitizeHtml = z.string().transform(val => {
    const div = document.createElement('div');
    div.textContent = val;
    return div.innerHTML;
  });

  // SQL Injection 방지
  static sqlSafe = z
    .string()
    .refine(
      val =>
        !/['"\\;]|--|\*|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter|grant|revoke/i.test(
          val
        ),
      { message: 'Input contains potentially dangerous characters' }
    );

  // 파일 타입 검증
  static fileType = (allowedTypes: string[]) =>
    z.object({
      name: z.string(),
      type: z
        .string()
        .refine(type => allowedTypes.includes(type), {
          message: `File type must be one of: ${allowedTypes.join(', ')}`,
        }),
      size: z.number().max(10 * 1024 * 1024), // 10MB 제한
    });

  // URL 검증
  static safeUrl = z
    .string()
    .url()
    .refine(
      url => {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      },
      { message: 'Only HTTP(S) URLs are allowed' }
    );
}
```

## 🤖 AI 생성 코드 검증

```typescript
class AICodeValidator {
  // AI 생성 코드 스키마
  static aiGeneratedCodeSchema = z.object({
    code: z.string(),
    language: z.enum(['typescript', 'javascript', 'python']),
    purpose: z.string(),
    safety: z.object({
      hasEval: z.boolean(),
      hasExternalCalls: z.boolean(),
      hasDangerousPatterns: z.boolean(),
    }),
    metadata: z.object({
      model: z.string(),
      timestamp: z.string().datetime(),
      confidence: z.number().min(0).max(1),
    }),
  });

  // 코드 안전성 검사
  static async validateGeneratedCode(code: string): Promise<ValidationResult> {
    const dangerousPatterns = [
      /eval\s*\(/,
      /new\s+Function\s*\(/,
      /require\s*\(['"]child_process['"]\)/,
      /\bexec\s*\(/,
      /__proto__/,
      /constructor\[['"](\w+)['"]\]/,
    ];

    const hasDangerousPatterns = dangerousPatterns.some(pattern =>
      pattern.test(code)
    );

    if (hasDangerousPatterns) {
      return {
        valid: false,
        errors: ['Code contains potentially dangerous patterns'],
        suggestions: ['Review and sanitize the generated code'],
      };
    }

    return { valid: true, errors: [] };
  }
}
```

## 📊 성능 최적화

### 1. 검증 캐싱

```typescript
class ValidationCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000;
  private ttl = 5 * 60 * 1000; // 5분

  set(key: string, result: ValidationResult): void {
    // LRU 캐시 구현
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  get(key: string): ValidationResult | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }
}
```

### 2. 지연 검증

```typescript
class LazyValidator {
  static createLazySchema<T>(schema: z.ZodSchema<T>) {
    return {
      parseAsync: async (data: unknown): Promise<T> => {
        // 비동기 검증으로 CPU 부하 분산
        await new Promise(resolve => setImmediate(resolve));
        return schema.parse(data);
      },

      parseStream: async function* (dataStream: AsyncIterable<unknown>) {
        for await (const data of dataStream) {
          try {
            yield { success: true, data: schema.parse(data) };
          } catch (error) {
            yield { success: false, error };
          }
        }
      },
    };
  }
}
```

## 🎯 Best Practices

### 1. 에러 메시지 커스터마이징

```typescript
const UserSchema = z.object({
  email: z.string().email({
    message: '올바른 이메일 형식이 아닙니다',
  }),
  age: z
    .number()
    .int()
    .min(1, {
      message: '나이는 1세 이상이어야 합니다',
    })
    .max(150, {
      message: '올바른 나이를 입력해주세요',
    }),
});
```

### 2. 점진적 검증

```typescript
// 필수 필드만 먼저 검증
const BasicSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// 나중에 추가 필드 검증
const ExtendedSchema = BasicSchema.extend({
  profile: z.object({
    name: z.string(),
    bio: z.string().optional(),
  }),
});
```

### 3. 타입 안전 함수

```typescript
function createValidatedFunction<TInput, TOutput>(
  inputSchema: z.ZodSchema<TInput>,
  outputSchema: z.ZodSchema<TOutput>,
  fn: (input: TInput) => TOutput
) {
  return (rawInput: unknown): TOutput => {
    // 입력 검증
    const input = inputSchema.parse(rawInput);

    // 함수 실행
    const output = fn(input);

    // 출력 검증
    return outputSchema.parse(output);
  };
}
```

---

_Runtime Validation: 컴파일 타임을 넘어 런타임까지 안전하게_
