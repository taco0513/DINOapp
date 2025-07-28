# DINO Production Deployment Checklist

## 🚀 프로덕션 배포 체크리스트

### 1. 필수 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

#### 인증 관련
- [ ] `NEXTAUTH_URL` - 프로덕션 URL (예: https://dino.vercel.app)
- [ ] `NEXTAUTH_SECRET` - 강력한 랜덤 문자열 (openssl rand -base64 32로 생성)
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth 클라이언트 ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth 클라이언트 시크릿

#### 데이터베이스
- [ ] `DATABASE_URL` - 프로덕션 데이터베이스 URL (SQLite 또는 PostgreSQL)

#### 보안
- [ ] `CSRF_SECRET` - CSRF 토큰용 시크릿
- [ ] `JWT_SECRET` - JWT 토큰 서명용 시크릿

#### 선택적 설정
- [ ] `SENTRY_DSN` - 에러 모니터링용 (선택사항)
- [ ] `GOOGLE_ANALYTICS_ID` - 분석용 (선택사항)

### 2. Google OAuth 설정

Google Cloud Console에서:

1. [ ] 프로덕션 도메인을 승인된 JavaScript 원본에 추가
   - `https://your-domain.vercel.app`
   - `https://your-custom-domain.com` (커스텀 도메인 사용 시)

2. [ ] 리디렉션 URI 추가
   - `https://your-domain.vercel.app/api/auth/callback/google`
   - `https://your-custom-domain.com/api/auth/callback/google`

### 3. 데이터베이스 설정

#### SQLite 사용 시 (개발/테스트용)
- Vercel은 서버리스 환경이므로 SQLite 파일 시스템 제한 있음
- 프로덕션에서는 PostgreSQL 또는 MySQL 권장

#### PostgreSQL 사용 시 (권장)
1. [ ] Vercel PostgreSQL 또는 Supabase 설정
2. [ ] DATABASE_URL 환경 변수 설정
3. [ ] Prisma 스키마 마이그레이션 실행

### 4. 보안 점검

- [ ] 모든 API 엔드포인트에 인증 확인
- [ ] CORS 설정 검토
- [ ] CSP(Content Security Policy) 헤더 확인
- [ ] 민감한 정보가 클라이언트 코드에 노출되지 않는지 확인

### 5. 성능 최적화

- [ ] 이미지 최적화 (next/image 사용)
- [ ] 코드 스플리팅 확인
- [ ] 불필요한 의존성 제거
- [ ] 번들 사이즈 분석

### 6. 배포 전 테스트

```bash
# 프로덕션 빌드 테스트
npm run build

# 타입 체크
npm run type-check

# 린트 체크
npm run lint

# 테스트 실행
npm test
```

### 7. Vercel 배포

#### CLI를 통한 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로덕션 배포
vercel --prod
```

#### GitHub 통합 (권장)
1. [ ] GitHub 저장소를 Vercel에 연결
2. [ ] main 브랜치를 프로덕션으로 설정
3. [ ] 자동 배포 활성화

### 8. 배포 후 확인

- [ ] 홈페이지 로드 확인
- [ ] Google OAuth 로그인 테스트
- [ ] 여행 기록 CRUD 작업 테스트
- [ ] Schengen 계산기 테스트
- [ ] PWA 설치 프롬프트 확인
- [ ] 모바일 반응성 테스트

### 9. 모니터링 설정

- [ ] Vercel Analytics 활성화
- [ ] 에러 모니터링 (Sentry) 설정
- [ ] 성능 모니터링 설정
- [ ] 사용자 피드백 채널 구축

### 10. 백업 및 복구 계획

- [ ] 데이터베이스 백업 자동화
- [ ] 환경 변수 백업
- [ ] 롤백 절차 문서화

## 📝 배포 명령어

### Vercel 배포 (권장)
```bash
# 프리뷰 배포
npm run deploy:preview

# 프로덕션 배포
npm run deploy:production
```

### Docker 배포
```bash
# Docker 이미지 빌드 및 실행
npm run deploy:docker
```

### 기타 플랫폼
```bash
# Railway
npm run deploy:railway

# Netlify
npm run deploy:netlify
```

## ⚠️ 주의사항

1. **환경 변수**: 절대 시크릿 정보를 코드에 하드코딩하지 마세요
2. **데이터베이스**: SQLite는 개발용으로만 사용하고, 프로덕션에서는 PostgreSQL 사용
3. **보안**: 모든 사용자 입력은 검증되고 정제되어야 합니다
4. **성능**: 첫 로드 시간이 3초를 넘지 않도록 최적화
5. **모니터링**: 프로덕션 환경에서는 반드시 에러 모니터링 설정

## 🎯 배포 완료 확인

모든 체크리스트 항목을 완료했다면:
1. 프로덕션 URL에서 애플리케이션 접속
2. 모든 주요 기능 테스트
3. 성능 및 보안 모니터링 확인
4. 사용자에게 배포 완료 공지

---

배포 관련 질문이나 이슈가 있다면 [GitHub Issues](https://github.com/your-repo/issues)에 등록해주세요.