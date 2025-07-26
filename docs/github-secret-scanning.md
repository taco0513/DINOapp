# GitHub Secret Scanning 활성화 가이드

## 🔒 Secret Scanning이란?
GitHub의 Secret Scanning은 코드에 실수로 포함된 비밀 정보(API 키, 비밀번호, 토큰 등)를 자동으로 감지하여 보안 사고를 예방하는 기능입니다.

## 📋 활성화 단계

### 1. GitHub 저장소 설정 접속
1. https://github.com/[your-username]/DINOapp 접속
2. Settings 탭 클릭
3. 왼쪽 메뉴에서 "Security" 섹션 찾기

### 2. Secret Scanning 활성화
1. "Code security and analysis" 클릭
2. "Secret scanning" 섹션 찾기
3. "Enable" 버튼 클릭

### 3. Push Protection 활성화 (추천)
1. 같은 페이지에서 "Push protection" 찾기
2. "Enable" 버튼 클릭
3. 이 기능은 비밀 정보가 포함된 커밋을 푸시하려 할 때 차단합니다

## 🚨 Secret Scanning이 감지하는 것들

### 자동 감지 항목:
- Database URLs (PostgreSQL, MySQL 등)
- API Keys (Google, AWS, Azure 등)
- OAuth Secrets
- JWT Tokens
- Private Keys
- Passwords in URLs

### DINOapp 프로젝트 특별 주의사항:
- `DATABASE_URL` (Supabase PostgreSQL)
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- 모든 `.env` 파일 내용

## ✅ 추가 보안 조치

### 1. .gitignore 확인
```bash
# 환경 변수 파일
.env
.env.local
.env.production
.env*.local

# 비밀 키 파일
*.pem
*.key
```

### 2. Pre-commit Hook 설정 (선택사항)
```bash
# .git/hooks/pre-commit 파일 생성
#!/bin/sh
# 민감한 패턴 검사
if git diff --cached | grep -E "(DATABASE_URL|CLIENT_SECRET|NEXTAUTH_SECRET)" > /dev/null; then
    echo "⚠️  경고: 민감한 정보가 감지되었습니다!"
    echo "커밋을 중단합니다. .env 파일을 사용하세요."
    exit 1
fi
```

### 3. 환경변수 템플릿 사용
`.env.example` 파일을 만들어 실제 값 없이 필요한 환경변수를 문서화:
```
DATABASE_URL=your_database_url_here
DATABASE_URL_UNPOOLED=your_direct_connection_url_here
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📊 Secret Scanning 알림 관리

### 알림 설정:
1. Settings → Notifications
2. "Security alerts" 활성화
3. 이메일로 즉시 알림 받기

### 알림 받았을 때:
1. 즉시 노출된 비밀 정보 무효화
2. 새로운 비밀 정보 생성
3. 모든 사용처 업데이트 (Vercel, Supabase 등)
4. 커밋 히스토리에서 제거 (필요시)

## 🔄 이미 노출된 비밀 정보 처리

### 커밋 히스토리에서 제거:
```bash
# BFG Repo-Cleaner 사용 (추천)
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# 또는 git filter-branch 사용
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

## 💡 Best Practices

1. **절대 하지 말아야 할 것:**
   - 하드코딩된 비밀 정보 커밋
   - .env 파일을 git에 추가
   - 비밀 정보를 주석에 포함

2. **항상 해야 할 것:**
   - 환경변수 사용
   - .gitignore 확인
   - 커밋 전 변경사항 검토
   - Secret Scanning 알림 즉시 대응

3. **개발 팁:**
   - 로컬 개발용 `.env.local` 사용
   - 프로덕션 비밀 정보는 Vercel에만 저장
   - 정기적으로 비밀 정보 로테이션

## 🚀 다음 단계

1. GitHub에서 Secret Scanning 활성화 ✓
2. Push Protection 활성화 ✓
3. 팀원들에게 보안 가이드라인 공유
4. 정기적인 보안 감사 실시

---

**기억하세요**: 한 번 인터넷에 노출된 비밀 정보는 영원히 노출된 것으로 간주해야 합니다. 즉시 무효화하고 새로 생성하는 것이 유일한 안전한 방법입니다.