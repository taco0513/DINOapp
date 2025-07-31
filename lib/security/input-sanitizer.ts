// Server-side HTML sanitization utilities
const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
};

const escapeHtml = (str: string): string => {
  return str.replace(/[&<>"']/g, match => htmlEntities[match]);
};

// XSS 방지를 위한 입력 정화
export class InputSanitizer {
  // HTML 태그 제거 및 정화
  static sanitizeHtml(
    input: string,
    options?: {
      allowedTags?: string[];
      allowedAttributes?: string[];
      stripHtml?: boolean;
    }
  ): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Strip HTML tags if requested
    if (options?.stripHtml) {
      return input.replace(/<[^>]*>/g, '');
    }

    // For server-side or when specific tags are allowed, use basic escaping
    if (options?.allowedTags && options.allowedTags.length > 0) {
      // Simple implementation - just escape dangerous characters
      return escapeHtml(input);
    }

    // Default: remove all HTML tags
    return input.replace(/<[^>]*>/g, '');
  }

  // 일반 텍스트 정화 (HTML 태그 완전 제거)
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove all HTML tags
    return input.replace(/<[^>]*>/g, '').trim();
  }

  // SQL Injection 방지를 위한 문자열 이스케이프
  static escapeSql(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\x00/g, '\\0')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\x1a/g, '\\Z');
  }

  // 경로 순회 공격 방지
  static sanitizePath(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/\.\./g, '') // ../ 제거
      .replace(/\\/g, '/') // 백슬래시를 슬래시로 변환
      .replace(/\/+/g, '/') // 연속된 슬래시 정리
      .replace(/^\/+|\/+$/g, ''); // 앞뒤 슬래시 제거
  }

  // 이메일 주소 검증 및 정화
  static sanitizeEmail(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // 기본 정화
    const sanitized = this.sanitizeText(input).toLowerCase().trim();

    // 이메일 형식 검증
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(sanitized) ? sanitized : '';
  }

  // URL 검증 및 정화
  static sanitizeUrl(
    input: string,
    allowedProtocols: string[] = ['http', 'https']
  ): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    try {
      const url = new URL(input.trim());

      // 허용된 프로토콜 확인
      if (!allowedProtocols.includes(url.protocol.slice(0, -1))) {
        return '';
      }

      // 위험한 문자 제거
      const sanitized = url
        .toString()
        .replace(/[<>'"]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '');

      return sanitized;
    } catch {
      return '';
    }
  }

  // 파일명 정화
  static sanitizeFilename(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // 금지된 문자 제거
      .replace(/^\.+/, '') // 앞의 점들 제거
      .replace(/\.+$/, '') // 뒤의 점들 제거
      .replace(/\s+/g, '_') // 공백을 언더스코어로
      .slice(0, 255); // 길이 제한
  }

  // 전화번호 정화
  static sanitizePhone(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // 숫자, +, -, (, ), 공백만 허용
    return input.replace(/[^\d+\-() ]/g, '').trim();
  }

  // 객체의 모든 문자열 필드 정화
  static sanitizeObject<T extends Record<string, any>>(
    obj: T,
    rules: Partial<
      Record<keyof T, 'text' | 'html' | 'email' | 'url' | 'filename' | 'phone'>
    >
  ): T {
    const sanitized = { ...obj };

    for (const [key, rule] of Object.entries(rules)) {
      const value = sanitized[key as keyof T];

      if (typeof value === 'string') {
        switch (rule) {
          case 'text':
            sanitized[key as keyof T] = this.sanitizeText(value) as T[keyof T];
            break;
          case 'html':
            sanitized[key as keyof T] = this.sanitizeHtml(value) as T[keyof T];
            break;
          case 'email':
            sanitized[key as keyof T] = this.sanitizeEmail(value) as T[keyof T];
            break;
          case 'url':
            sanitized[key as keyof T] = this.sanitizeUrl(value) as T[keyof T];
            break;
          case 'filename':
            sanitized[key as keyof T] = this.sanitizeFilename(
              value
            ) as T[keyof T];
            break;
          case 'phone':
            sanitized[key as keyof T] = this.sanitizePhone(value) as T[keyof T];
            break;
          default:
            sanitized[key as keyof T] = this.sanitizeText(value) as T[keyof T];
        }
      }
    }

    return sanitized;
  }

  // 배열의 모든 문자열 요소 정화
  static sanitizeArray(
    arr: string[],
    rule: 'text' | 'html' = 'text'
  ): string[] {
    return arr.map(item => {
      if (typeof item === 'string') {
        return rule === 'html'
          ? this.sanitizeHtml(item)
          : this.sanitizeText(item);
      }
      return item;
    });
  }

  // 검색 쿼리 정화 (특수 문자 처리)
  static sanitizeSearchQuery(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[<>'"\\]/g, '') // 위험한 문자 제거
      .replace(/\s+/g, ' ') // 연속 공백 정리
      .slice(0, 100); // 길이 제한
  }

  // 정수 값 검증 및 정화
  static sanitizeInteger(
    input: any,
    min?: number,
    max?: number
  ): number | null {
    const num = parseInt(String(input), 10);

    if (isNaN(num)) {
      return null;
    }

    if (min !== undefined && num < min) {
      return min;
    }

    if (max !== undefined && num > max) {
      return max;
    }

    return num;
  }

  // 부동소수점 값 검증 및 정화
  static sanitizeFloat(
    input: any,
    min?: number,
    max?: number,
    decimals?: number
  ): number | null {
    const num = parseFloat(String(input));

    if (isNaN(num)) {
      return null;
    }

    let sanitized = num;

    if (min !== undefined && sanitized < min) {
      sanitized = min;
    }

    if (max !== undefined && sanitized > max) {
      sanitized = max;
    }

    if (decimals !== undefined) {
      sanitized =
        Math.round(sanitized * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    return sanitized;
  }

  // 날짜 검증 및 정화
  static sanitizeDate(input: any): Date | null {
    if (!input) return null;

    const date = new Date(input);

    if (isNaN(date.getTime())) {
      return null;
    }

    // 합리적인 날짜 범위 확인 (1900-2100)
    const year = date.getFullYear();
    if (year < 1900 || year > 2100) {
      return null;
    }

    return date;
  }

  // 부울 값 검증 및 정화
  static sanitizeBoolean(input: any): boolean {
    if (typeof input === 'boolean') {
      return input;
    }

    if (typeof input === 'string') {
      const lower = input.toLowerCase().trim();
      return (
        lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on'
      );
    }

    if (typeof input === 'number') {
      return input !== 0;
    }

    return false;
  }
}

// 미들웨어용 요청 본문 정화 함수
export async function sanitizeRequestBody(
  req: Request,
  sanitizationRules?: Record<string, string>
): Promise<any> {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      return null;
    }

    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return body;
    }

    // 기본 정화 규칙
    const defaultRules = {
      country: 'text',
      notes: 'text',
      visaType: 'text',
      email: 'email',
      name: 'text',
      description: 'html',
    };

    const rules = { ...defaultRules, ...sanitizationRules };

    return InputSanitizer.sanitizeObject(body, rules);
  } catch (error) {
    // Request body sanitization failed
    return null;
  }
}
