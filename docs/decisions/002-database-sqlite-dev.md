# Decision: SQLite for Development, PostgreSQL for Production

## DATE
2024-07-28

## CONTEXT
개발 환경과 프로덕션 환경의 데이터베이스 선택. 개발 편의성과 프로덕션 성능/확장성을 모두 고려해야 함.

## OPTIONS_CONSIDERED
1. **PostgreSQL for Both Dev & Prod**
   - Pros: 동일 환경, 호환성 문제 없음
   - Cons: 로컬 설정 복잡, Docker 필요

2. **SQLite for Dev, PostgreSQL for Prod**
   - Pros: 개발 설정 간단, 파일 기반으로 편리
   - Cons: 환경별 차이, 일부 기능 제한

3. **PlanetScale/Supabase for Both**
   - Pros: 관리형 서비스, 확장성
   - Cons: 인터넷 연결 의존, 비용 발생

## DECISION
**SQLite for Development, PostgreSQL for Production** 선택

## REASONING
- 개발 환경 설정 단순화 (파일 하나로 관리)
- 오프라인 개발 가능
- Prisma ORM이 차이점 추상화
- 프로덕션은 확장성 있는 PostgreSQL 사용

## IMPLEMENTATION
```prisma
// Development (schema.prisma)
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// Production (.env.production)
DATABASE_URL="postgresql://..."
```

## CONSEQUENCES
- ✅ 빠른 개발 환경 설정
- ✅ 오프라인 개발 가능
- ✅ 프로덕션 확장성 확보
- ❌ 환경별 스키마 차이 가능성
- ❌ SQLite 특정 제약사항 (JSON 필드 등)

## RELATED_FILES
- prisma/schema.prisma: 데이터베이스 스키마
- lib/database/dev-prisma.ts: 개발용 Prisma 클라이언트
- .env.local, .env.production: 환경 변수

## REVIEW_DATE
2024-10-28 (3개월 후 재검토 - 개발 경험 평가)