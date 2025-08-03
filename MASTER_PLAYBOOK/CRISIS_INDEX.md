# 🆘 위기 대응 빠른 인덱스 (300토큰)

## 🔥 긴급도별 대응

### Critical (5분 내 해결)
- [ ] 프로덕션 다운 → @crisis/prod-down
- [ ] 데이터 손실 위험 → @crisis/data-loss
- [ ] 보안 침해 → @crisis/security
- [ ] 사용자 접속 불가 → @crisis/access-fail

### High (30분 내 해결)
- [ ] 1000+ 에러 → @crisis/mass-errors
- [ ] 배포 실패 반복 → @crisis/deploy-fail
- [ ] 성능 급격 저하 → @crisis/performance
- [ ] 메모리 누수 → @crisis/memory-leak

### Medium (2시간 내 해결)
- [ ] 테스트 전체 실패 → @crisis/test-fail
- [ ] 마이그레이션 중단 → @crisis/migration
- [ ] API 응답 없음 → @crisis/api-down
- [ ] 빌드 실패 → @crisis/build-fail

## ⚡ 즉시 실행 명령어
```bash
# TypeScript 에러 자동 수정
@tools/fix-typescript-errors

# Import 경로 자동 수정
@tools/fix-import-paths

# Hydration 문제 해결
@tools/fix-hydration

# 롤백 실행
@tools/emergency-rollback
```

## 📞 에스컬레이션
1차: @31_Crisis/protocols
2차: @team/senior-dev
3차: @external/consultant