# 🏷️ 출처 표기 가이드

프로젝트에서 외부 리소스를 사용할 때 올바른 출처 표기 방법을 안내합니다.

## 🎯 왜 출처 표기가 중요한가?

### 법적 보호
- **저작권 준수**: 원작자의 권리 존중
- **라이선스 컴플라이언스**: 법적 요구사항 충족
- **특허 침해 방지**: 지적재산권 보호

### 윤리적 개발
- **크레딧 제공**: 창작자에게 합당한 인정
- **투명성**: 사용한 자료의 출처 명시
- **커뮤니티 기여**: 오픈소스 생태계 지원

### 실용적 이점
- **업데이트 추적**: 원본 변경사항 모니터링
- **문제 해결**: 이슈 발생 시 빠른 대응
- **학습 자료**: 다른 개발자들의 참고 자료

## 📋 표기 대상

### 필수 표기 대상
- ✅ **오픈소스 라이브러리** (npm packages, GitHub repos)
- ✅ **이미지 및 아이콘** (Unsplash, icons8, Heroicons)
- ✅ **폰트** (Google Fonts, Adobe Fonts)
- ✅ **코드 조각** (Stack Overflow, GitHub gists)
- ✅ **디자인 템플릿** (Tailwind UI, Figma 템플릿)
- ✅ **문서 및 가이드** (MDN, 공식 문서 참조)

### 권장 표기 대상
- 📝 **영감을 받은 디자인** (참고한 웹사이트, 앱)
- 📝 **학습 자료** (튜토리얼, 블로그 포스트)
- 📝 **도구 및 서비스** (배포 플랫폼, API 서비스)

## 🔧 표기 방법

### 1. package.json에서의 표기

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "next": "^13.4.0",
    "tailwindcss": "^3.3.0"
  },
  "credits": {
    "ui-inspiration": "https://tailwindui.com",
    "icons": "https://heroicons.com",
    "images": "https://unsplash.com"
  }
}
```

### 2. README.md에서의 표기

```markdown
## 🙏 Credits

### 기술 스택
- [React](https://reactjs.org) - UI 라이브러리
- [Next.js](https://nextjs.org) - React 프레임워크
- [Tailwind CSS](https://tailwindcss.com) - CSS 프레임워크

### 디자인 리소스
- Icons by [Heroicons](https://heroicons.com)
- Images from [Unsplash](https://unsplash.com)
- UI inspiration from [Dribbble](https://dribbble.com)

### 참고 자료
- [Next.js Documentation](https://nextjs.org/docs)
- [React Tutorial](https://reactjs.org/tutorial)
```

### 3. 코드 내 주석으로 표기

```typescript
// 이 함수는 Stack Overflow 답변을 참고했습니다
// Source: https://stackoverflow.com/questions/12345/example
// Author: @username
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

### 4. 별도 CREDITS.md 파일

```markdown
# Credits

## 라이브러리
| 이름 | 버전 | 라이선스 | 용도 |
|------|------|---------|------|
| React | 18.2.0 | MIT | UI 프레임워크 |
| Tailwind | 3.3.0 | MIT | CSS 유틸리티 |

## 이미지
- hero-image.jpg: Photo by [John Doe](https://unsplash.com/@johndoe) on [Unsplash](https://unsplash.com)
- icon-set: [Heroicons](https://heroicons.com) by Steve Schoger

## 코드 참조
- Authentication logic: Inspired by [Auth0 Tutorial](https://auth0.com/docs)
- Database schema: Based on [Prisma Examples](https://github.com/prisma/prisma-examples)
```

## 📄 라이선스별 요구사항

### MIT License
```
Copyright (c) [year] [author]

Permission is hereby granted, free of charge, to any person obtaining a copy...
```
**요구사항**: 
- ✅ 저작권 표시
- ✅ 라이선스 텍스트 포함
- ❌ 상표 사용 제한 없음

### Apache 2.0
```
Copyright [year] [author]

Licensed under the Apache License, Version 2.0...
```
**요구사항**:
- ✅ 저작권 표시  
- ✅ 라이선스 텍스트 포함
- ✅ 변경사항 명시
- ⚠️ 특허 보호 조항

### GPL (v2/v3)
**요구사항**:
- ✅ 소스코드 공개
- ✅ 동일 라이선스 적용
- ✅ 저작권 표시
- ⚠️ 전염성 있음

### Creative Commons
- **CC0**: 퍼블릭 도메인, 표기 불필요
- **CC BY**: 출처 표기 필수
- **CC BY-SA**: 출처 표기 + 동일 라이선스
- **CC BY-NC**: 비상업적 사용만 허용

## 🛠️ 자동화 도구

### License Checker
```bash
# npm 패키지 라이선스 확인
npx license-checker

# 특정 라이선스만 필터링
npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause'
```

### 자동 크레딧 생성
```javascript
// scripts/generate-credits.js
const fs = require('fs');
const packageJson = require('../package.json');

function generateCredits() {
  const dependencies = packageJson.dependencies;
  let credits = '# Credits\n\n## Dependencies\n\n';
  
  for (const [name, version] of Object.entries(dependencies)) {
    credits += `- [${name}](https://npmjs.com/package/${name}) (${version})\n`;
  }
  
  fs.writeFileSync('CREDITS.md', credits);
}

generateCredits();
```

### GitHub Actions로 자동화
```yaml
# .github/workflows/update-credits.yml
name: Update Credits
on:
  push:
    paths: ['package.json']

jobs:
  update-credits:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: node scripts/generate-credits.js
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: '📝 Update credits automatically'
```

## ✅ 체크리스트

### 프로젝트 시작 시
- [ ] 라이선스 호환성 확인
- [ ] 필수 표기 대상 식별
- [ ] CREDITS.md 파일 생성
- [ ] 자동화 스크립트 설정

### 새로운 의존성 추가 시
- [ ] 라이선스 확인
- [ ] 출처 표기 추가
- [ ] 호환성 검증
- [ ] 문서 업데이트

### 배포 전
- [ ] 모든 크레딧 표기 완료
- [ ] 라이선스 파일 포함
- [ ] 법적 요구사항 충족
- [ ] 자동 검증 통과

## 🚨 피해야 할 실수

### 흔한 위반 사례
- ❌ MIT 라이선스 저작권 표시 누락
- ❌ GPL 라이브러리를 상용 소프트웨어에 사용
- ❌ 이미지 출처 표기 없이 사용
- ❌ Stack Overflow 코드 복사 후 출처 미표기

### 위험한 가정
- ❌ "GitHub에 공개 = 자유 사용 가능"
- ❌ "개인 프로젝트는 표기 불필요"
- ❌ "작은 코드 조각은 상관없음"
- ❌ "상업적 사용이 아니면 괜찮음"

## 📞 도움이 필요할 때

### 라이선스 관련 문의
- [Choose a License](https://choosealicense.com) - 라이선스 선택 가이드
- [SPDX License List](https://spdx.org/licenses/) - 표준 라이선스 목록
- [TLDRLegal](https://tldrlegal.com) - 라이선스 요약 설명

### 법적 조언
복잡한 상황에서는 전문가 상담을 권장합니다:
- 지적재산권 전문 변호사
- 회사 법무팀
- 오픈소스 재단 가이드라인

## 📈 모범 사례

### 투명성 우선
```markdown
## 🙏 Full Attribution

이 프로젝트는 다음 리소스를 사용합니다:

### UI Framework
- **React 18.2.0** ([MIT](https://github.com/facebook/react/blob/main/LICENSE))
  - 출처: https://reactjs.org
  - 사용 목적: 사용자 인터페이스 구축
  - 변경사항: TypeScript 래퍼 추가

### 아이콘
- **Heroicons** ([MIT](https://github.com/tailwindlabs/heroicons/blob/master/LICENSE))
  - 작성자: Steve Schoger, Adam Wathan
  - 출처: https://heroicons.com
  - 사용 아이콘: home, user, settings (총 23개)
```

### 정기적 업데이트
- 월 1회 의존성 라이선스 검토
- 분기별 크레딧 문서 업데이트
- 연 1회 라이선스 컴플라이언스 감사

---

**올바른 출처 표기는 개발자의 기본 소양입니다!** 🎯

**함께 만드는 건전한 개발 생태계** 🌱