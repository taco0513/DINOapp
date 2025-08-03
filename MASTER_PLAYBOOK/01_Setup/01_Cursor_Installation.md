# 💻 Cursor IDE 설치 가이드

## 🎯 Cursor란?

**Cursor**는 AI와 함께 코딩할 수 있는 최신 개발 환경입니다.
- VS Code 기반 (친숙한 인터페이스)
- AI 네이티브 (Claude 내장)
- 무료 사용 가능

## 📥 다운로드 및 설치

### 🪟 Windows 사용자

#### Step 1: 다운로드
1. 브라우저에서 [https://cursor.com](https://cursor.com) 접속
2. **"Download for Windows"** 버튼 클릭
3. `CursorSetup.exe` 파일 다운로드 대기

#### Step 2: 설치
```
1. 다운로드 폴더에서 CursorSetup.exe 더블클릭
2. "Windows Defender" 경고 시 → "추가 정보" → "실행"
3. 설치 진행:
   - Next 클릭
   - 설치 위치 그대로 (기본값)
   - Next → Install
   - Finish
```

#### Step 3: 첫 실행
1. 바탕화면의 Cursor 아이콘 더블클릭
2. **"Sign in with Google"** 클릭
3. 구글 계정으로 로그인

### 🍎 Mac 사용자

#### Step 1: 다운로드
1. Safari/Chrome에서 [https://cursor.com](https://cursor.com) 접속
2. **"Download for Mac"** 버튼 클릭
3. `Cursor.dmg` 파일 다운로드 대기

#### Step 2: 설치
```
1. 다운로드된 Cursor.dmg 더블클릭
2. 열린 창에서:
   - Cursor 아이콘을
   - Applications 폴더로 드래그
3. 설치 완료!
```

#### Step 3: 첫 실행
1. Launchpad 또는 Applications에서 Cursor 클릭
2. "개발자를 확인할 수 없습니다" 경고 시:
   - 시스템 환경설정 → 보안 및 개인정보 보호
   - "확인 없이 열기" 클릭
3. **"Sign in with Google"** 클릭
4. 구글 계정으로 로그인

## 🔧 초기 설정

### 1. 언어 설정 (선택사항)
```
1. 좌측 하단 톱니바퀴 ⚙️ 클릭
2. Settings 클릭
3. 검색창에 "locale" 입력
4. "Locale" 항목에서 "ko" 선택 (한국어)
5. Cursor 재시작
```

### 2. 테마 설정 (선택사항)
```
1. Ctrl+K (Mac: Cmd+K) → Ctrl+T (Mac: Cmd+T)
2. 원하는 테마 선택:
   - Dark+ (추천)
   - Light+
   - 기타 테마
```

### 3. 자동 저장 설정 (추천!)
```
1. File → Preferences → Settings
2. 검색창에 "auto save" 입력
3. "Files: Auto Save" → "afterDelay" 선택
4. "Files: Auto Save Delay" → 1000 (1초)
```

## ✅ 설치 확인

### 정상 설치 확인 방법
1. Cursor가 정상적으로 열림 ✅
2. 상단에 메뉴바 보임 ✅
3. 좌측에 파일 탐색기 보임 ✅
4. 하단에 상태바 보임 ✅

### 테스트
1. `Ctrl+N` (Mac: `Cmd+N`) - 새 파일 생성
2. 아래 텍스트 입력:
```
안녕하세요!
AI와 함께 코딩을 시작합니다.
```
3. `Ctrl+S` (Mac: `Cmd+S`) - 저장
4. 파일명: `test.txt`
5. 저장 위치: 바탕화면

## 🚨 문제 해결

### Windows 문제

#### "Windows Defender가 차단했습니다"
```
해결:
1. "추가 정보" 클릭
2. "실행" 클릭
3. 그래도 안 되면 Windows Defender 일시 중지
```

#### "설치가 안 됩니다"
```
해결:
1. 관리자 권한으로 실행
2. 바이러스 백신 일시 중지
3. 다른 브라우저로 다운로드
```

### Mac 문제

#### "개발자를 확인할 수 없습니다"
```
해결:
1. 시스템 환경설정 → 보안 및 개인정보 보호
2. "확인 없이 열기" 클릭
3. 또는 터미널에서:
   xattr -d com.apple.quarantine /Applications/Cursor.app
```

#### "응용 프로그램이 손상되었습니다"
```
해결:
1. Cursor.app을 휴지통으로
2. 휴지통 비우기
3. 다시 다운로드 및 설치
```

## 🎯 다음 단계

Cursor 설치가 완료되셨나요?

### ✅ 완료했다면
👉 [Step 2: Claude Code CLI 설정](02_Claude_Code_Setup.md)

### ❌ 문제가 있다면
- 스크린샷을 찍어두세요
- 에러 메시지를 복사하세요
- AI에게 물어보면 해결해줍니다!

## 💡 추가 팁

### 유용한 단축키
- **새 파일**: `Ctrl+N` (Mac: `Cmd+N`)
- **저장**: `Ctrl+S` (Mac: `Cmd+S`)
- **실행 취소**: `Ctrl+Z` (Mac: `Cmd+Z`)
- **터미널 열기**: `Ctrl+`` ` (Mac: `Cmd+`` `)

### 추천 확장 프로그램
나중에 설치하면 좋은 것들:
- Korean Language Pack (한국어)
- Material Icon Theme (예쁜 아이콘)
- Prettier (코드 정리)

---

> 🎉 **축하합니다!** Cursor 설치 완료!

**다음 단계로 가볼까요? 🚀**