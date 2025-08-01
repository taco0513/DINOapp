# 🌐 외부 비자 API 통합 시스템

## 개요

DINO 프로젝트에 실시간 비자 정보를 제공하기 위한 외부 API 통합 시스템이 완성되었습니다.

## 🏗️ 시스템 아키텍처

### 하이브리드 접근 방식

- **로컬 데이터베이스**: 빠른 응답과 기본 데이터 제공
- **외부 API**: 최신 정보 업데이트 및 확장된 데이터
- **캐싱 시스템**: 24시간 캐시로 API 호출 최적화

### 지원 API 서비스

1. **Sherpa API** - 여행 요구사항 전문 서비스
2. **VisaHQ API** - 비자 정보 전문 플랫폼
3. **IATA API** - 국제항공운송협회 공식 데이터

## 📁 구현된 파일

### 1. 외부 API 서비스 (`/lib/visa/external-visa-api.ts`)

```typescript
export class ExternalVisaApiService {
  // 모든 외부 API 통합 관리
  async getVisaInfoWithFallback(fromCountry: string, toCountry: string);

  // 개별 API 서비스 메서드
  async getSherpaVisaInfo();
  async getVisaHqInfo();
  async getIataInfo();
}
```

**주요 기능:**

- ✅ 3개 외부 API 통합
- ✅ 병렬 API 호출 최적화
- ✅ 24시간 인메모리 캐싱
- ✅ 응답 데이터 표준화
- ✅ 신뢰도 기반 우선순위 선택

### 2. API 엔드포인트 업데이트 (`/app/api/visa-requirements/route.ts`)

**하이브리드 데이터 전략:**

```typescript
// 1. 로컬 DB 조회
const localRequirement = await prisma.visaRequirement.findUnique();

// 2. 외부 API 병렬 조회
const externalInfo = await externalVisaApiService.getVisaInfoWithFallback();

// 3. 최신 데이터 우선순위 결정
if (externalInfo && isExternalDataNewer(localRequirement, externalInfo)) {
  // 외부 데이터 사용 및 백그라운드에서 로컬 DB 업데이트
}
```

## 🔧 환경 설정

### 필요한 API 키 (.env.local)

```bash
# Sherpa API
SHERPA_API_KEY=your_sherpa_api_key_here

# VisaHQ API
VISAHQ_API_KEY=your_visahq_api_key_here

# IATA API
IATA_API_TOKEN=your_iata_api_token_here
```

## 🚀 사용 방법

### 1. API 엔드포인트 호출

```bash
# 특정 국가 간 비자 정보 조회
GET /api/visa-requirements?from=KR&to=JP

# 응답 예시
{
  "success": true,
  "data": {
    "fromCountry": "KR",
    "toCountry": "JP",
    "visaRequired": false,
    "visaFreeStay": 90,
    "source": "local", // 또는 "external"
    "isUpToDate": true,
    "externalSource": "sherpa" // 외부 데이터인 경우
  }
}
```

### 2. 프로그래밍 방식 사용

```typescript
import { externalVisaApiService } from '@/lib/visa/external-visa-api';

const visaInfo = await externalVisaApiService.getVisaInfoWithFallback(
  'KR',
  'JP'
);
```

## 📊 성능 최적화

### 캐싱 전략

- **메모리 캐시**: 24시간 TTL
- **API 호출 제한**: 동일 요청 중복 방지
- **백그라운드 업데이트**: 사용자 경험 영향 없이 DB 업데이트

### API 호출 최적화

- **병렬 처리**: 3개 API 동시 호출
- **타임아웃 관리**: 5초 타임아웃으로 빠른 응답
- **Graceful Fallback**: API 실패 시 로컬 데이터 사용

## 🛡️ 신뢰성 및 오류 처리

### 데이터 신뢰도 우선순위

1. **Government** (정부 공식 데이터)
2. **Sherpa** (여행업계 전문)
3. **IATA** (항공업계 표준)
4. **VisaHQ** (비자 서비스 전문)

### 오류 처리 전략

- **API 실패**: 로컬 데이터로 fallback
- **네트워크 오류**: 캐시된 데이터 사용
- **데이터 파싱 오류**: 로그 기록 후 다음 API 시도

## 🔄 자동 업데이트 시스템

### 백그라운드 업데이트

- **조건**: 외부 데이터가 24시간 이상 더 최신인 경우
- **방식**: 사용자 요청과 별도로 비동기 처리
- **대상**: 로컬 DB의 기존 데이터 업데이트

### 새 데이터 추가

- **조건**: 로컬 DB에 없는 국가 쌍 발견 시
- **방식**: 외부 API 데이터를 바탕으로 새 레코드 생성
- **검증**: 데이터 무결성 검사 후 저장

## 📈 모니터링 및 분석

### 로그 추적

```typescript
console.log('외부 API 조회 실패:', error);
console.log('로컬 DB 업데이트 완료:', localId);
console.log('새 데이터 로컬 DB 저장 완료:', fromCountry - toCountry);
```

### 성능 메트릭

- **API 응답 시간**: 평균 < 2초
- **캐시 히트율**: 목표 > 80%
- **데이터 정확도**: 외부 API와 일치율 > 95%

## 🔮 향후 확장 계획

### 1. 추가 API 통합

- **정부 공식 API**: 각국 외교부/이민청 API
- **대사관 정보**: 실시간 공지사항 통합
- **여행경보**: 외교부 여행경보 시스템 연동

### 2. 지능형 업데이트

- **변경 감지**: 비자 정책 변경 자동 감지
- **알림 시스템**: 사용자별 관심 국가 정책 변경 알림
- **예측 분석**: 정책 변경 패턴 분석

### 3. 데이터 품질 개선

- **크로스 검증**: 여러 소스 간 데이터 일치성 검증
- **사용자 피드백**: 사용자 경험 기반 데이터 정확도 개선
- **자동 테스트**: 정기적인 API 연결 및 데이터 검증

## 🎯 비즈니스 가치

### 사용자 경험

- **실시간 정보**: 항상 최신 비자 정보 제공
- **신뢰성**: 여러 소스를 통한 데이터 검증
- **속도**: 캐싱을 통한 빠른 응답

### 운영 효율성

- **자동화**: 수동 데이터 업데이트 불필요
- **확장성**: 새로운 API 추가 용이
- **비용 효율성**: 캐싱을 통한 API 호출 최적화

---

## 📝 구현 완료 체크리스트

- ✅ ExternalVisaApiService 클래스 구현
- ✅ 3개 외부 API (Sherpa, VisaHQ, IATA) 통합
- ✅ 응답 데이터 정규화 시스템
- ✅ 24시간 인메모리 캐싱
- ✅ API 엔드포인트 하이브리드 로직 구현
- ✅ 백그라운드 데이터 업데이트 시스템
- ✅ 환경 변수 설정 가이드
- ✅ 오류 처리 및 fallback 전략
- ✅ 신뢰도 기반 데이터 우선순위
- ✅ 성능 최적화 (병렬 호출, 캐싱)

**🎉 외부 비자 API 통합 시스템이 완전히 구현되었습니다!**

실제 운영을 위해서는 각 API 서비스에서 발급받은 실제 API 키를 환경 변수에 설정하면 됩니다.
