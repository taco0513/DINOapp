# Deployment & Scaling Quick Reference (250토큰)

## 즉시 배포 (100토큰)
### Vercel (Next.js)
```bash
npm i -g vercel
vercel
# 끝. 자동 설정
```

### Railway (백엔드)
```bash
railway login
railway up
# 자동 감지 및 배포
```

### Netlify (정적)
```bash
netlify deploy --prod
```

## 체크리스트 (50토큰)
- [ ] 환경변수 설정
- [ ] 빌드 테스트
- [ ] 도메인 연결
- [ ] SSL 확인
- [ ] 모니터링 설정

## 주의사항 (50토큰)
⚠️ .env.local ≠ 프로덕션 환경변수
⚠️ 빌드 명령어 확인
⚠️ Node 버전 지정

## 문제 해결 (50토큰)
- 빌드 실패 → @30_Traps/deploy
- 500 에러 → @31_Crisis/prod-down
- 느린 속도 → @performance/quick