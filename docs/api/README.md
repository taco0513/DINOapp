# API 문서

DINOapp REST API 완전 가이드입니다.

## 📋 개요

DINOapp API는 RESTful 설계 원칙을 따르며, JSON 형태의 데이터를 주고받습니다.

### 기본 정보
- **Base URL**: `https://dinoapp.vercel.app/api` (프로덕션)
- **Base URL**: `http://localhost:3000/api` (개발)
- **인증**: NextAuth.js 세션 기반
- **응답 형식**: JSON
- **날짜 형식**: ISO 8601 (예: `2024-01-15T10:30:00Z`)

## 🔐 인증

### 세션 인증
모든 보호된 엔드포인트는 유효한 세션이 필요합니다.

```javascript
// 프론트엔드에서 세션 확인
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <p>Loading...</p>
  if (status === "unauthenticated") return <p>Access Denied</p>
  
  return <p>Welcome {session.user.email}!</p>
}
```

### API 요청 예시
```javascript
// 인증된 API 요청
const response = await fetch('/api/travel/countries', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // 세션 쿠키 포함
})
```

## 🌍 여행 관리 API

### 국가 정보

#### GET /api/travel/countries
모든 지원 국가 목록을 조회합니다.

```http
GET /api/travel/countries
```

**응답 예시**:
```json
{
  "success": true,
  "data": [
    {
      "code": "KR",
      "name": "대한민국",
      "continent": "Asia",
      "schengenMember": false,
      "visaRequired": false
    },
    {
      "code": "DE",
      "name": "독일",
      "continent": "Europe", 
      "schengenMember": true,
      "visaRequired": false
    }
  ]
}
```

#### GET /api/travel/countries/[code]
특정 국가의 상세 정보를 조회합니다.

```http
GET /api/travel/countries/DE
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "code": "DE",
    "name": "독일",
    "continent": "Europe",
    "schengenMember": true,
    "visaRequired": false,
    "currency": "EUR",
    "timezone": "Europe/Berlin",
    "language": "German",
    "visaInfo": {
      "type": "visa_free",
      "maxStay": 90,
      "period": 180
    }
  }
}
```

### 여행 기록

#### GET /api/travel/records
사용자의 여행 기록을 조회합니다.

```http
GET /api/travel/records?page=1&limit=10&country=DE
```

**쿼리 매개변수**:
- `page` (number): 페이지 번호 (기본값: 1)
- `limit` (number): 페이지당 항목 수 (기본값: 10, 최대: 100)
- `country` (string): 국가 코드 필터
- `year` (number): 연도 필터

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "record_123",
        "countryCode": "DE",
        "countryName": "독일",
        "entryDate": "2024-01-15T10:30:00Z",
        "exitDate": "2024-01-25T14:20:00Z",
        "duration": 10,
        "purpose": "tourism",
        "notes": "베를린 방문"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### POST /api/travel/records
새로운 여행 기록을 추가합니다.

```http
POST /api/travel/records
Content-Type: application/json

{
  "countryCode": "FR",
  "entryDate": "2024-02-01T09:00:00Z",
  "exitDate": "2024-02-10T18:00:00Z", 
  "purpose": "business",
  "notes": "파리 출장"
}
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "id": "record_124",
    "countryCode": "FR",
    "countryName": "프랑스",
    "entryDate": "2024-02-01T09:00:00Z",
    "exitDate": "2024-02-10T18:00:00Z",
    "duration": 9,
    "purpose": "business",
    "notes": "파리 출장",
    "createdAt": "2024-01-30T12:00:00Z"
  }
}
```

#### PUT /api/travel/records/[id]
기존 여행 기록을 수정합니다.

```http
PUT /api/travel/records/record_124
Content-Type: application/json

{
  "exitDate": "2024-02-11T18:00:00Z",
  "notes": "파리 출장 - 1일 연장"
}
```

#### DELETE /api/travel/records/[id]
여행 기록을 삭제합니다.

```http
DELETE /api/travel/records/record_124
```

## 🛂 비자 관리 API

### 비자 상태

#### GET /api/travel/visas
사용자의 비자 상태를 조회합니다.

```http
GET /api/travel/visas
```

**응답 예시**:
```json
{
  "success": true,
  "data": [
    {
      "id": "visa_123",
      "countryCode": "US",
      "countryName": "미국",
      "visaType": "B1/B2",
      "status": "approved",
      "issueDate": "2023-12-01T00:00:00Z",
      "expiryDate": "2028-12-01T00:00:00Z",
      "multipleEntry": true,
      "maxStay": 90
    }
  ]
}
```

#### POST /api/travel/visas
새로운 비자 정보를 추가합니다.

```http
POST /api/travel/visas
Content-Type: application/json

{
  "countryCode": "JP",
  "visaType": "tourist",
  "status": "pending",
  "applicationDate": "2024-01-15T00:00:00Z"
}
```

## 🇪🇺 셰겐 계산기 API

#### POST /api/travel/schengen/calculate
셰겐 체류 일수를 계산합니다.

```http
POST /api/travel/schengen/calculate
Content-Type: application/json

{
  "travelRecords": [
    {
      "countryCode": "DE",
      "entryDate": "2024-01-15T00:00:00Z",
      "exitDate": "2024-01-25T00:00:00Z"
    },
    {
      "countryCode": "FR", 
      "entryDate": "2024-02-01T00:00:00Z",
      "exitDate": "2024-02-10T00:00:00Z"
    }
  ],
  "calculationDate": "2024-03-01T00:00:00Z"
}
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "totalDays": 19,
    "remainingDays": 71,
    "periodStart": "2023-12-01T00:00:00Z",
    "periodEnd": "2024-03-01T00:00:00Z",
    "warning": null,
    "recommendations": [
      "71일 더 체류 가능합니다",
      "다음 리셋일: 2024-04-15"
    ]
  }
}
```

## 🤖 AI 기능 API

### 여행 추천

#### POST /api/ai/recommendations
AI 기반 여행 추천을 받습니다.

```http
POST /api/ai/recommendations
Content-Type: application/json

{
  "preferences": {
    "budget": "medium",
    "duration": 7,
    "interests": ["culture", "food", "history"],
    "season": "spring"
  },
  "currentLocation": "KR",
  "travelHistory": ["JP", "TH", "SG"]
}
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "country": "IT",
        "reason": "문화와 역사에 관심이 있으시고 봄 여행을 계획하신다면 이탈리아를 추천합니다.",
        "highlights": ["로마 콜로세움", "피렌체 우피치 미술관", "베네치아 곤돌라"],
        "estimatedBudget": "$1200-1800",
        "bestTime": "4월-5월",
        "visaRequired": false
      }
    ],
    "generatedAt": "2024-01-30T12:00:00Z"
  }
}
```

## 📊 통계 API

#### GET /api/travel/stats
사용자의 여행 통계를 조회합니다.

```http
GET /api/travel/stats?year=2024
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "totalCountries": 15,
    "totalDays": 120,
    "schengenDays": 45,
    "continents": {
      "Asia": 8,
      "Europe": 6,
      "Americas": 1
    },
    "monthlyStats": [
      {"month": "2024-01", "countries": 2, "days": 15},
      {"month": "2024-02", "countries": 1, "days": 9}
    ]
  }
}
```

## ⚡ 유틸리티 API

### 헬스 체크

#### GET /api/health
시스템 상태를 확인합니다.

```http
GET /api/health
```

**응답 예시**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-30T12:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "external_apis": "healthy"
  }
}
```

## 🚨 오류 처리

### 오류 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 유효하지 않습니다",
    "details": {
      "field": "countryCode",
      "issue": "잘못된 국가 코드입니다"
    }
  }
}
```

### 일반적인 오류 코드
- `400`: 잘못된 요청 (VALIDATION_ERROR)
- `401`: 인증 필요 (UNAUTHORIZED)
- `403`: 권한 없음 (FORBIDDEN) 
- `404`: 리소스 없음 (NOT_FOUND)
- `429`: 요청 제한 초과 (RATE_LIMIT_EXCEEDED)
- `500`: 서버 오류 (INTERNAL_SERVER_ERROR)

## 📝 요청/응답 예시

### 성공적인 요청
```javascript
// 여행 기록 조회
const response = await fetch('/api/travel/records', {
  credentials: 'include'
})
const data = await response.json()

if (data.success) {
  console.log('여행 기록:', data.data.records)
} else {
  console.error('오류:', data.error.message)
}
```

### 오류 처리
```javascript
try {
  const response = await fetch('/api/travel/records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      countryCode: 'INVALID',
      entryDate: '2024-01-15T00:00:00Z'
    })
  })
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error.message)
  }
  
  console.log('생성됨:', data.data)
} catch (error) {
  console.error('API 오류:', error.message)
}
```

## 🔄 버전 관리

현재 API 버전: **v1**

향후 버전 업데이트 시 하위 호환성을 유지하며, 주요 변경 사항은 사전 공지됩니다.

---

**관련 문서**: [개발환경 설정](../development/setup.md) | [아키텍처 가이드](../development/architecture.md)