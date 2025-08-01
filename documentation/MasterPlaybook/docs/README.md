# 📚 Documentation

프로젝트 문서화 관련 파일들을 체계적으로 관리합니다.

## 📁 폴더 구조

### 📝 reviews/

프로젝트 리뷰 및 분석 결과

#### ai-generated/

- AI가 자동 생성한 코드 리뷰
- JSON 형식 원본 데이터 + MD 형식 요약
- 파일명 패턴: `ai-review-{filename}-{timestamp}.json`

#### manual/

- 수동으로 작성된 리뷰 보고서
- 전체 프로젝트 상태 요약
- 파일명 패턴: `review-{timestamp}.md`

### 📋 roadmap.md

프로젝트 로드맵 및 마일스톤 관리

## 🔄 자동화 시스템

이 문서들은 다음 시스템에 의해 자동으로 생성/업데이트됩니다:

- `auto-docs/` 시스템
- 로드맵 가드 시스템
- AI 리뷰어 시스템
