# 보안 패턴

## 개요

AI 개발 워크플로우에서 보안을 체계적으로 구현하고 관리하기 위한 핵심 패턴과 전략을 제시합니다.

## 보안 기본 원칙

### Defense in Depth (다층 방어)
```yaml
security_layers:
  perimeter:
    - "방화벽"
    - "웹 애플리케이션 방화벽 (WAF)"
    - "DDoS 보호"
  
  network:
    - "네트워크 분할"
    - "VPN"
    - "네트워크 모니터링"
  
  application:
    - "입력 검증"
    - "출력 인코딩"
    - "인증/인가"
  
  data:
    - "암호화"
    - "데이터 마스킹"
    - "접근 제어"
```

### Zero Trust Architecture
```yaml
zero_trust_principles:
  verify_explicitly:
    - "모든 요청 검증"
    - "컨텍스트 기반 인증"
    - "지속적 검증"
  
  least_privilege:
    - "최소 권한 원칙"
    - "역할 기반 접근 제어"
    - "시간 제한 권한"
  
  assume_breach:
    - "침해 가정"
    - "격리 및 제한"
    - "실시간 모니터링"
```

## 패턴 1: Secure by Design

### 설계 단계 보안 고려사항
```yaml
secure_design_checklist:
  architecture:
    - "보안 요구사항 정의"
    - "위협 모델링"
    - "보안 아키텍처 설계"
  
  implementation:
    - "안전한 코딩 가이드라인"
    - "보안 라이브러리 사용"
    - "코드 리뷰 프로세스"
  
  deployment:
    - "보안 설정 검증"
    - "취약점 스캔"
    - "침투 테스트"
```

### SuperClaude 보안 적용
```bash
# 보안 중심 분석
/analyze --focus security --persona-security

# 위협 모델링
/design threat-model --attack-vectors all

# 보안 코드 생성
/implement --security-first --validate-input
```

## 패턴 2: Input Validation and Sanitization

### 입력 검증 계층
```yaml
validation_layers:
  syntactic:
    - "데이터 타입 검증"
    - "길이 제한"
    - "형식 검증"
  
  semantic:
    - "비즈니스 규칙 검증"
    - "컨텍스트 검증"
    - "무결성 검증"
  
  security:
    - "악성 패턴 탐지"
    - "인젝션 방지"
    - "스크립트 차단"
```

### 구현 예시
```javascript
// 포괄적 입력 검증
function validateInput(input, rules) {
  // 1. 기본 검증
  if (!input || typeof input !== 'string') {
    throw new ValidationError('Invalid input type');
  }
  
  // 2. 길이 검증
  if (input.length > rules.maxLength) {
    throw new ValidationError('Input too long');
  }
  
  // 3. 패턴 검증
  if (!rules.pattern.test(input)) {
    throw new ValidationError('Invalid format');
  }
  
  // 4. 보안 검증
  if (containsMaliciousPattern(input)) {
    throw new SecurityError('Malicious input detected');
  }
  
  return sanitizeInput(input);
}
```

### SuperClaude 검증 패턴
```bash
# 입력 검증 코드 생성
/implement "input-validation" --security-patterns xss,sqli,csrf

# 검증 규칙 생성
/generate validation-rules --for "user-registration"
```

## 패턴 3: Authentication and Authorization

### 다단계 인증 (MFA)
```yaml
mfa_factors:
  knowledge:
    - "비밀번호"
    - "PIN"
    - "보안 질문"
  
  possession:
    - "SMS 코드"
    - "앱 기반 토큰"
    - "하드웨어 토큰"
  
  inherence:
    - "지문"
    - "얼굴 인식"
    - "음성 인식"
```

### JWT 기반 인증 패턴
```yaml
jwt_security:
  best_practices:
    - "강력한 서명 알고리즘 (RS256)"
    - "짧은 만료 시간"
    - "리프레시 토큰 사용"
    - "토큰 블랙리스트"
  
  payload_security:
    - "민감 정보 제외"
    - "최소 필요 정보만"
    - "서명 검증 필수"
```

### 권한 기반 접근 제어 (RBAC)
```yaml
rbac_structure:
  users:
    - id: "user123"
      roles: ["editor", "viewer"]
  
  roles:
    editor:
      permissions: ["read", "write", "update"]
    viewer:
      permissions: ["read"]
  
  resources:
    - id: "document1"
      owner: "user123"
      permissions: ["read:public", "write:owner"]
```

## 패턴 4: Encryption and Data Protection

### 암호화 전략
```yaml
encryption_strategy:
  data_at_rest:
    algorithm: "AES-256-GCM"
    key_management: "AWS KMS / Azure Key Vault"
    rotation: "90일마다"
  
  data_in_transit:
    protocol: "TLS 1.3"
    certificate: "Let's Encrypt / 상용 인증서"
    validation: "인증서 핀닝"
  
  data_in_use:
    method: "동형 암호화 / TEE"
    use_case: "민감한 계산"
    performance: "고려 필요"
```

### 키 관리 모범 사례
```yaml
key_management:
  generation:
    - "하드웨어 난수 생성기"
    - "충분한 엔트로피"
    - "검증된 알고리즘"
  
  storage:
    - "하드웨어 보안 모듈 (HSM)"
    - "키 관리 서비스"
    - "분리된 환경"
  
  rotation:
    - "정기적 교체"
    - "이벤트 기반 교체"
    - "자동화된 프로세스"
```

## 패턴 5: Secure API Design

### API 보안 체크리스트
```yaml
api_security:
  authentication:
    - "강력한 인증 메커니즘"
    - "API 키 관리"
    - "토큰 기반 인증"
  
  authorization:
    - "세분화된 권한"
    - "리소스 기반 접근 제어"
    - "컨텍스트 기반 인가"
  
  rate_limiting:
    - "요청 속도 제한"
    - "사용자별 쿼터"
    - "DDoS 방지"
  
  data_validation:
    - "입력 스키마 검증"
    - "출력 필터링"
    - "에러 정보 제한"
```

### GraphQL 보안 패턴
```yaml
graphql_security:
  query_complexity:
    - "최대 깊이 제한"
    - "복잡도 분석"
    - "타임아웃 설정"
  
  introspection:
    - "프로덕션에서 비활성화"
    - "권한 기반 제한"
    - "스키마 정보 보호"
  
  authorization:
    - "필드 레벨 권한"
    - "동적 권한 검사"
    - "데이터 필터링"
```

## 패턴 6: Logging and Monitoring

### 보안 로깅 전략
```yaml
security_logging:
  authentication_events:
    - "로그인 시도"
    - "인증 실패"
    - "권한 상승"
  
  access_events:
    - "리소스 접근"
    - "권한 변경"
    - "데이터 수정"
  
  security_events:
    - "의심스러운 활동"
    - "보안 정책 위반"
    - "시스템 변경"
```

### 실시간 보안 모니터링
```yaml
security_monitoring:
  anomaly_detection:
    - "비정상 접근 패턴"
    - "권한 남용"
    - "데이터 유출 시도"
  
  threat_intelligence:
    - "알려진 위협 지표"
    - "악성 IP 차단"
    - "공격 패턴 탐지"
  
  automated_response:
    - "계정 잠금"
    - "IP 차단"
    - "관리자 알림"
```

### SuperClaude 보안 모니터링
```bash
# 보안 이벤트 분석
/analyze security-logs --pattern suspicious

# 위협 탐지
/detect threats --realtime --auto-block

# 보안 대시보드
/monitor security --dashboard --alerts
```

## 패턴 7: Incident Response

### 보안 사고 대응 절차
```yaml
incident_response:
  preparation:
    - "대응 팀 구성"
    - "절차 문서화"
    - "도구 준비"
  
  detection:
    - "사고 탐지"
    - "영향 범위 확인"
    - "심각도 평가"
  
  containment:
    - "공격 차단"
    - "확산 방지"
    - "증거 보존"
  
  eradication:
    - "위협 제거"
    - "취약점 패치"
    - "시스템 정화"
  
  recovery:
    - "서비스 복구"
    - "모니터링 강화"
    - "정상화 확인"
  
  lessons_learned:
    - "사후 분석"
    - "프로세스 개선"
    - "교육 실시"
```

### 자동화된 대응
```bash
# 자동 사고 대응
/incident-response auto --severity high

# 포렌식 데이터 수집
/collect forensics --preserve-chain-of-custody

# 복구 프로세스 실행
/recover --verified-clean --gradual-rollout
```

## 보안 테스트 패턴

### 정적 보안 분석 (SAST)
```yaml
sast_tools:
  code_analysis:
    - "SonarQube"
    - "Checkmarx"
    - "Veracode"
  
  dependency_scan:
    - "OWASP Dependency Check"
    - "Snyk"
    - "WhiteSource"
  
  infrastructure:
    - "Terraform Security"
    - "CloudFormation Guard"
    - "Prowler"
```

### 동적 보안 분석 (DAST)
```yaml
dast_tools:
  web_application:
    - "OWASP ZAP"
    - "Burp Suite"
    - "Nessus"
  
  api_testing:
    - "Postman Security"
    - "RestAPI Security"
    - "GraphQL Cop"
  
  network_scanning:
    - "Nmap"
    - "Masscan"
    - "Zmap"
```

### 침투 테스트
```yaml
penetration_testing:
  scope:
    - "웹 애플리케이션"
    - "API 엔드포인트"
    - "네트워크 인프라"
    - "클라우드 환경"
  
  methodology:
    - "OWASP Testing Guide"
    - "NIST SP 800-115"
    - "PTES"
  
  frequency:
    - "연간 정기 테스트"
    - "주요 변경 시"
    - "사고 발생 후"
```

## 컴플라이언스 패턴

### GDPR 준수
```yaml
gdpr_compliance:
  data_protection:
    - "개인정보 최소화"
    - "목적 제한"
    - "저장 기간 제한"
  
  user_rights:
    - "접근권"
    - "정정권"
    - "삭제권"
    - "이동권"
  
  technical_measures:
    - "가명 처리"
    - "암호화"
    - "접근 통제"
```

### SOC 2 Type II
```yaml
soc2_controls:
  security:
    - "접근 통제"
    - "논리적 물리적 보안"
    - "시스템 운영"
  
  availability:
    - "시스템 가용성"
    - "모니터링"
    - "백업 및 복구"
  
  confidentiality:
    - "데이터 보호"
    - "암호화"
    - "접근 제한"
```

## DevSecOps 통합

### 보안 파이프라인
```yaml
security_pipeline:
  commit:
    - "보안 커밋 훅"
    - "비밀 정보 스캔"
    - "코드 서명"
  
  build:
    - "정적 분석"
    - "의존성 스캔"
    - "컨테이너 스캔"
  
  test:
    - "동적 분석"
    - "권한 테스트"
    - "API 보안 테스트"
  
  deploy:
    - "보안 설정 검증"
    - "런타임 보호"
    - "모니터링 활성화"
```

### 자동화된 보안 검증
```bash
# CI/CD 보안 검증
/security-check ci-cd --stage all

# 보안 게이트 설정
/set security-gate --block-on critical

# 컴플라이언스 검증
/validate compliance --standards "SOC2,GDPR"
```

## 모범 사례

### Do's
1. ✅ 설계 단계부터 보안 고려
2. ✅ 다층 방어 전략 적용
3. ✅ 정기적인 보안 테스트
4. ✅ 자동화된 보안 모니터링
5. ✅ 보안 교육 및 인식 제고

### Don'ts
1. ❌ 보안을 나중에 고려
2. ❌ 단일 보안 메커니즘 의존
3. ❌ 하드코딩된 비밀 정보
4. ❌ 과도한 권한 부여
5. ❌ 보안 업데이트 지연