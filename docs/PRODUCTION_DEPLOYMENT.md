# 🚀 DINO Production Deployment Guide

프로덕션 배포를 위한 완성된 Phase 4 가이드입니다.

## 📋 Phase 4 완료 사항

### ✅ 데이터베이스 최적화
- **Connection Pool**: 최적화된 연결 풀 관리 (`/lib/database/connection-pool.ts`)
- **Query Optimizer**: 캐싱 및 성능 최적화 (`/lib/database/query-optimizer.ts`)
- **Indexes**: 프로덕션 최적화된 데이터베이스 인덱스
- **Health Checks**: 자동 데이터베이스 상태 모니터링

### ✅ 실시간 모니터링 대시보드
- **Metrics Collection**: 시스템 메트릭 실시간 수집
- **Dashboard**: `/monitoring` 페이지에서 실시간 모니터링
- **Performance Tracking**: CPU, 메모리, 데이터베이스 성능 추적
- **Historical Data**: 시간별 성능 히스토리 저장

### ✅ 통합 알림 시스템
- **Multi-Channel**: Console, Email, Webhook, Database 알림 지원
- **Alert Manager**: 임계값 기반 자동 알림 발송
- **Templates**: 시스템 에러, 성능 경고, 보안 알림 템플릿
- **Real-time Notifications**: 실시간 시스템 상태 알림

### ✅ 백업 및 복구 시스템
- **Automated Backup**: 압축 및 암호화 지원 백업
- **Restore System**: Dry-run 지원 복구 시스템
- **Backup Management**: 백업 목록, 삭제, 통계 관리
- **Production Safety**: 프로덕션 환경 안전 장치

## 🔧 설정 방법

### 1. 환경 변수 설정

```bash
cp .env.production.example .env.production
```

필수 환경 변수 설정:
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"
DATABASE_URL_UNPOOLED="postgresql://user:pass@host:5432/db"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Admin & Security
ADMIN_EMAILS="admin@example.com"
INTERNAL_API_KEY="your-api-key"

# Monitoring
FORCE_MONITORING=true
```

### 2. 데이터베이스 설정

```bash
# 프로덕션 마이그레이션
npm run db:migrate:prod

# 인덱스 생성 확인
npm run db:push
```

### 3. 모니터링 시스템 활성화

모니터링 시스템은 프로덕션 환경에서 자동 시작됩니다:

- 📊 **메트릭 수집**: 30초 간격
- 🔔 **알림 시스템**: 실시간 임계값 모니터링
- ❤️ **헬스체크**: 5분 간격
- 💾 **백업**: 수동/자동 백업 시스템

### 4. 배포 명령어

```bash
# 프로덕션 빌드
npm run build:production

# 타입 체크 & 린트
npm run check:all

# 배포 (Vercel)
npm run vercel-build
```

## 📊 모니터링 대시보드 사용법

### 접근 방법
1. 관리자 계정으로 로그인
2. `/monitoring` 페이지 접속
3. 실시간 시스템 상태 확인

### 주요 메트릭
- **시스템 상태**: CPU, 메모리, 데이터베이스
- **성능 지표**: 쿼리 성능, 응답 시간
- **에러 추적**: 에러율, 실패한 쿼리
- **연결 상태**: 데이터베이스 연결 풀 상태

### 알림 설정
```typescript
// 임계값 기반 자동 알림
- CPU 사용률 > 80% → 경고
- CPU 사용률 > 90% → 위험
- 메모리 사용률 > 70% → 경고
- 메모리 사용률 > 85% → 위험
- DB 레이턴시 > 1000ms → 경고
- DB 레이턴시 > 2000ms → 위험
```

## 💾 백업 시스템 사용법

### 수동 백업 생성
```bash
# API를 통한 백업 생성
POST /api/backup
{
  "includeUserData": true,
  "includeSessions": false,
  "compress": true
}
```

### 백업 목록 조회
```bash
GET /api/backup
```

### 복구 실행
```bash
# Dry-run 테스트
POST /api/backup/restore
{
  "backupId": "backup_xxx",
  "dryRun": true
}

# 실제 복구 (프로덕션에서는 확인 문구 필요)
POST /api/backup/restore
{
  "backupId": "backup_xxx",
  "dryRun": false,
  "confirmationPhrase": "RESTORE DATABASE CONFIRM"
}
```

## 🔔 알림 채널 설정

### Slack 연동
```env
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
WEBHOOK_FORMAT="slack"
```

### Discord 연동
```env
WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK"
WEBHOOK_FORMAT="discord"
```

### 이메일 알림
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@your-domain.com"
```

## 🔒 보안 고려사항

### 관리자 접근 제어
- 모니터링 대시보드는 `ADMIN_EMAILS`에 등록된 이메일만 접근 가능
- 백업/복구 기능은 관리자 권한 필수
- API 키 기반 내부 서비스 인증

### 데이터 보호
- 백업 데이터 압축 및 체크섬 검증
- 민감한 정보 (토큰, 비밀번호) 백업 제외
- HTTPS 강제 및 보안 헤더 설정

## 📈 성능 최적화

### 데이터베이스 최적화
- 연결 풀링으로 연결 재사용
- 쿼리 캐싱 (5-30분 TTL)
- 최적화된 인덱스 사용
- 슬로우 쿼리 자동 감지

### API 최적화
- Rate limiting 적용
- 응답 압축 활성화
- CDN 캐싱 설정
- 번들 크기 최적화

## 🚨 장애 대응

### 자동 알림 수신 시
1. 모니터링 대시보드에서 상태 확인
2. 시스템 메트릭 분석
3. 로그 확인 및 원인 파악
4. 필요시 백업에서 복구

### 수동 대응 절차
```bash
# 헬스체크 실행
GET /api/monitoring/metrics

# 백업 생성
POST /api/backup

# 시스템 재시작 (필요시)
# pm2 restart dino
```

## 🎯 다음 단계

Phase 4 완료로 DINO는 완전한 프로덕션 준비 상태입니다:

1. ✅ **보안 강화** (Phase 3)
2. ✅ **성능 최적화** (Phase 3)  
3. ✅ **데이터베이스 최적화** (Phase 4)
4. ✅ **실시간 모니터링** (Phase 4)
5. ✅ **알림 시스템** (Phase 4)
6. ✅ **백업/복구** (Phase 4)

이제 안정적이고 확장 가능한 프로덕션 환경에서 DINO를 운영할 수 있습니다! 🚀