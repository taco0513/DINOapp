# 🚀 BMAD Method 워크플로우 플레이북

## 코딩 초보자를 위한 체계적인 앱 개발 완벽 가이드

### 목차

1. [BMAD Method란?](#bmad-method란)
2. [BMAD vs 다른 방법론](#bmad-vs-다른-방법론)
3. [시작하기 전 마인드셋](#시작하기-전-마인드셋)
4. [Phase B: Business Logic First (Day 1-5)](#phase-b-business-logic-first-day-1-5)
5. [Phase M: Mockup Development (Day 6-10)](#phase-m-mockup-development-day-6-10)
6. [Phase A: API Integration (Day 11-15)](#phase-a-api-integration-day-11-15)
7. [Phase D: Design Polish (Day 16-20)](#phase-d-design-polish-day-16-20)
8. [BMAD 실전 프로젝트](#bmad-실전-프로젝트)
9. [트러블슈팅 가이드](#트러블슈팅-가이드)
10. [BMAD 마스터하기](#bmad-마스터하기)

---

## BMAD Method란?

### 개념 정의

**BMAD Method**는 비즈니스 로직을 우선으로 하는 체계적인 개발 방법론입니다.

```
B - Business Logic (비즈니스 로직)
M - Mockup (목업/프로토타입)
A - API Integration (API 통합)
D - Design Polish (디자인 완성)
```

### 핵심 철학

- 🧠 **로직 우선**: UI보다 핵심 기능부터
- 🔄 **반복 가능**: 각 단계가 독립적
- 📊 **측정 가능**: 명확한 완료 기준
- 🎯 **목표 지향**: 비즈니스 가치 중심

### BMAD가 특히 효과적인 경우

```
✅ 복잡한 비즈니스 로직이 있는 앱
✅ MVP를 빠르게 검증해야 할 때
✅ 팀 협업이 필요한 프로젝트
✅ 요구사항이 명확한 경우
✅ 단계별 진행상황 추적이 중요할 때
```

---

## BMAD vs 다른 방법론

### 비교 분석

| 특징              | BMAD          | 바이브 코딩 | 워터폴    | 애자일   |
| ----------------- | ------------- | ----------- | --------- | -------- |
| **시작점**        | 비즈니스 로직 | 자연어 설명 | 전체 설계 | 스프린트 |
| **진행 방식**     | 단계별 구축   | 대화형 개발 | 순차적    | 반복적   |
| **유연성**        | 높음          | 매우 높음   | 낮음      | 높음     |
| **예측 가능성**   | 높음          | 중간        | 매우 높음 | 중간     |
| **초보자 친화도** | 매우 높음     | 높음        | 낮음      | 중간     |

### BMAD 선택 기준

```
"다음 상황에서 BMAD가 최적입니다:"
1. 명확한 비즈니스 요구사항이 있을 때
2. 단계별로 진행상황을 확인하고 싶을 때
3. 디자인보다 기능이 중요할 때
4. 체계적인 접근이 필요할 때
```

---

## 시작하기 전 마인드셋

### BMAD 성공 원칙

#### 1. **기능 우선, 디자인 나중**

```
❌ "예쁜 버튼부터 만들자"
✅ "버튼이 할 일부터 정의하자"
```

#### 2. **작동하는 코드 > 완벽한 코드**

```
❌ "처음부터 완벽하게"
✅ "일단 작동하게, 그 다음 개선"
```

#### 3. **단계별 완료**

```
❌ "여러 단계를 동시에"
✅ "한 단계씩 확실하게"
```

#### 4. **테스트 가능한 결과**

```
❌ "대충 되는 것 같은데..."
✅ "이 기능은 이렇게 테스트할 수 있어"
```

### 필요한 도구

```bash
# 기본 개발 환경
- VS Code
- Node.js (v18+)
- Git
- Chrome DevTools

# BMAD 특화 도구
- Postman (API 테스트)
- Figma/Excalidraw (목업)
- JSON Server (목 API)
```

---

## Phase B: Business Logic First (Day 1-5)

### B단계 목표

**"UI 없이도 핵심 기능이 작동하는 상태"**

### Step B.1: 비즈니스 요구사항 정의 (Day 1)

#### 요구사항 명세서 작성

```markdown
# 여행 기록 앱 비즈니스 요구사항

## 핵심 기능

1. 여행 기록 CRUD
   - 생성: 국가, 날짜, 비자 정보
   - 조회: 전체 목록, 상세 정보
   - 수정: 모든 필드 수정 가능
   - 삭제: 소프트 삭제

2. 셰겐 계산
   - 90/180일 규칙 자동 계산
   - 남은 일수 표시
   - 위반 경고

3. 통계 생성
   - 총 방문 국가
   - 올해 여행 일수
   - 비자 타입별 통계
```

#### 데이터 모델 설계

```typescript
// models/Trip.ts
interface Trip {
  id: string;
  userId: string;
  country: string;
  entryDate: Date;
  exitDate?: Date;
  visaType: string;
  purpose: 'tourism' | 'business' | 'study' | 'other';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// models/User.ts
interface User {
  id: string;
  email: string;
  name: string;
  passportCountry: string;
  preferences: UserPreferences;
}

// models/SchengenCalculation.ts
interface SchengenCalculation {
  usedDays: number;
  remainingDays: number;
  periodStart: Date;
  periodEnd: Date;
  violations: Violation[];
}
```

### Step B.2: 핵심 비즈니스 로직 구현 (Day 2-3)

#### 여행 관리 로직

```javascript
// business/TripManager.js
class TripManager {
  constructor() {
    this.trips = [];
  }

  // 여행 추가
  addTrip(tripData) {
    // 비즈니스 규칙 검증
    this.validateTrip(tripData);

    const trip = {
      id: generateId(),
      ...tripData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.trips.push(trip);
    return trip;
  }

  // 비즈니스 규칙 검증
  validateTrip(tripData) {
    // 날짜 검증
    if (tripData.entryDate > tripData.exitDate) {
      throw new Error('출국일이 입국일보다 빠를 수 없습니다');
    }

    // 중복 검증
    const overlap = this.checkOverlap(tripData);
    if (overlap) {
      throw new Error('해당 기간에 이미 다른 여행 기록이 있습니다');
    }

    // 비자 유효성 검증
    if (!this.isValidVisaType(tripData.visaType, tripData.country)) {
      throw new Error('해당 국가에서 사용할 수 없는 비자 타입입니다');
    }
  }

  // 겹치는 여행 확인
  checkOverlap(newTrip) {
    return this.trips.find(trip => {
      const newStart = new Date(newTrip.entryDate);
      const newEnd = new Date(newTrip.exitDate || newTrip.entryDate);
      const existingStart = new Date(trip.entryDate);
      const existingEnd = new Date(trip.exitDate || trip.entryDate);

      return newStart <= existingEnd && newEnd >= existingStart;
    });
  }
}
```

#### 셰겐 계산기 로직

```javascript
// business/SchengenCalculator.js
class SchengenCalculator {
  constructor() {
    this.SCHENGEN_COUNTRIES = [
      'Austria',
      'Belgium',
      'Czech Republic',
      'Denmark',
      'Estonia',
      'Finland',
      'France',
      'Germany',
      'Greece',
      'Hungary',
      'Iceland',
      'Italy',
      'Latvia',
      'Lithuania',
      'Luxembourg',
      'Malta',
      'Netherlands',
      'Norway',
      'Poland',
      'Portugal',
      'Slovakia',
      'Slovenia',
      'Spain',
      'Sweden',
      'Switzerland',
    ];
  }

  // 90/180일 규칙 계산
  calculateUsage(trips, referenceDate = new Date()) {
    const relevantTrips = this.getRelevantTrips(trips, referenceDate);
    const daysUsed = this.countDaysInSchengen(relevantTrips);

    return {
      usedDays: daysUsed,
      remainingDays: Math.max(0, 90 - daysUsed),
      periodStart: this.get180DaysAgo(referenceDate),
      periodEnd: referenceDate,
      status: this.getComplianceStatus(daysUsed),
      nextResetDate: this.calculateNextResetDate(relevantTrips),
    };
  }

  // 지난 180일 내의 셰겐 여행만 필터
  getRelevantTrips(trips, referenceDate) {
    const cutoffDate = this.get180DaysAgo(referenceDate);

    return trips.filter(trip => {
      if (!this.isSchengenCountry(trip.country)) return false;

      const exitDate = trip.exitDate || referenceDate;
      return new Date(exitDate) >= cutoffDate;
    });
  }

  // 셰겐 체류 일수 계산
  countDaysInSchengen(trips) {
    let totalDays = 0;

    trips.forEach(trip => {
      const entry = new Date(trip.entryDate);
      const exit = trip.exitDate ? new Date(trip.exitDate) : new Date();
      const days = Math.ceil((exit - entry) / (1000 * 60 * 60 * 24)) + 1;
      totalDays += days;
    });

    return totalDays;
  }

  // 준수 상태 확인
  getComplianceStatus(daysUsed) {
    if (daysUsed > 90) return 'violation';
    if (daysUsed > 80) return 'warning';
    if (daysUsed > 60) return 'caution';
    return 'safe';
  }
}
```

#### 통계 생성 로직

```javascript
// business/StatisticsGenerator.js
class StatisticsGenerator {
  generateStatistics(trips) {
    return {
      overview: this.generateOverview(trips),
      byCountry: this.groupByCountry(trips),
      byVisaType: this.groupByVisaType(trips),
      byYear: this.groupByYear(trips),
      patterns: this.analyzePatterns(trips),
    };
  }

  generateOverview(trips) {
    const countries = new Set(trips.map(t => t.country));
    const totalDays = trips.reduce((sum, trip) => {
      const days = this.calculateDays(trip);
      return sum + days;
    }, 0);

    return {
      totalTrips: trips.length,
      uniqueCountries: countries.size,
      totalDays: totalDays,
      averageTripLength: totalDays / trips.length || 0,
      mostVisitedCountry: this.getMostVisited(trips),
    };
  }

  groupByCountry(trips) {
    const grouped = trips.reduce((acc, trip) => {
      if (!acc[trip.country]) {
        acc[trip.country] = {
          visits: 0,
          totalDays: 0,
          lastVisit: null,
        };
      }

      acc[trip.country].visits++;
      acc[trip.country].totalDays += this.calculateDays(trip);
      acc[trip.country].lastVisit = trip.entryDate;

      return acc;
    }, {});

    return Object.entries(grouped)
      .sort((a, b) => b[1].visits - a[1].visits)
      .slice(0, 10);
  }
}
```

### Step B.3: 콘솔 기반 테스트 (Day 4)

#### 테스트 스크립트 작성

```javascript
// test-business-logic.js
const TripManager = require('./business/TripManager');
const SchengenCalculator = require('./business/SchengenCalculator');
const StatisticsGenerator = require('./business/StatisticsGenerator');

// 테스트 데이터
const testTrips = [
  {
    country: 'France',
    entryDate: '2024-01-15',
    exitDate: '2024-01-25',
    visaType: 'Tourist',
    purpose: 'tourism',
  },
  {
    country: 'Germany',
    entryDate: '2024-03-10',
    exitDate: '2024-03-20',
    visaType: 'Business',
    purpose: 'business',
  },
];

// 비즈니스 로직 테스트
console.log('=== 여행 관리 테스트 ===');
const tripManager = new TripManager();
testTrips.forEach(trip => {
  try {
    const added = tripManager.addTrip(trip);
    console.log('✅ 여행 추가 성공:', added.id);
  } catch (error) {
    console.log('❌ 여행 추가 실패:', error.message);
  }
});

console.log('\n=== 셰겐 계산 테스트 ===');
const calculator = new SchengenCalculator();
const usage = calculator.calculateUsage(tripManager.trips);
console.log('사용 일수:', usage.usedDays);
console.log('남은 일수:', usage.remainingDays);
console.log('상태:', usage.status);

console.log('\n=== 통계 생성 테스트 ===');
const stats = new StatisticsGenerator();
const statistics = stats.generateStatistics(tripManager.trips);
console.log('총 여행:', statistics.overview.totalTrips);
console.log('방문 국가:', statistics.overview.uniqueCountries);
```

### Step B.4: 데이터 영속성 추가 (Day 5)

#### 간단한 파일 기반 저장소

```javascript
// storage/FileStorage.js
const fs = require('fs').promises;
const path = require('path');

class FileStorage {
  constructor(filename = 'trips.json') {
    this.filepath = path.join(__dirname, '..', 'data', filename);
  }

  async save(data) {
    try {
      await fs.mkdir(path.dirname(this.filepath), { recursive: true });
      await fs.writeFile(this.filepath, JSON.stringify(data, null, 2));
      console.log('✅ 데이터 저장 완료');
    } catch (error) {
      console.error('❌ 저장 실패:', error);
    }
  }

  async load() {
    try {
      const data = await fs.readFile(this.filepath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📄 새 파일 생성');
        return [];
      }
      throw error;
    }
  }
}

// 통합 테스트
async function testWithStorage() {
  const storage = new FileStorage();
  const tripManager = new TripManager();

  // 기존 데이터 로드
  const savedTrips = await storage.load();
  tripManager.trips = savedTrips;

  // 새 여행 추가
  const newTrip = tripManager.addTrip({
    country: 'Spain',
    entryDate: '2024-06-01',
    exitDate: '2024-06-10',
    visaType: 'Tourist',
  });

  // 저장
  await storage.save(tripManager.trips);
}
```

### B단계 체크리스트

```markdown
✅ 데이터 모델 정의 완료
✅ 핵심 비즈니스 로직 구현
✅ 비즈니스 규칙 검증 로직
✅ 콘솔에서 모든 기능 테스트 가능
✅ 데이터 저장/불러오기 가능
```

---

## Phase M: Mockup Development (Day 6-10)

### M단계 목표

**"실제 작동하는 UI 프로토타입"**

### Step M.1: 목업 설계 (Day 6)

#### 화면 구성 계획

```markdown
# 화면 구성도

1. 메인 화면 (/)
   - 여행 목록
   - 간단한 통계
   - 추가 버튼

2. 여행 추가 (/add)
   - 입력 폼
   - 유효성 검사
   - 저장/취소

3. 셰겐 계산기 (/schengen)
   - 현재 사용량
   - 그래프 표시
   - 경고 메시지

4. 통계 대시보드 (/stats)
   - 종합 통계
   - 차트/그래프
```

#### HTML 프로토타입

```html
<!-- mockup/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>여행 기록 앱</title>
    <style>
      /* 최소한의 스타일 */
      body {
        font-family: Arial;
        margin: 20px;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
      }
      .trip-card {
        border: 1px solid #ddd;
        padding: 15px;
        margin: 10px 0;
      }
      .button {
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        cursor: pointer;
      }
      .form-group {
        margin: 10px 0;
      }
      .form-group label {
        display: block;
        margin-bottom: 5px;
      }
      .form-group input,
      .form-group select {
        width: 100%;
        padding: 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>여행 기록</h1>

      <!-- 통계 요약 -->
      <div class="stats-summary">
        <span>총 여행: <strong id="totalTrips">0</strong></span> |
        <span>방문 국가: <strong id="totalCountries">0</strong></span> |
        <span>셰겐 사용: <strong id="schengenDays">0</strong>/90일</span>
      </div>

      <!-- 여행 목록 -->
      <div id="tripList"></div>

      <!-- 추가 버튼 -->
      <button class="button" onclick="showAddForm()">여행 추가</button>
    </div>

    <script src="mockup-app.js"></script>
  </body>
</html>
```

### Step M.2: JavaScript로 인터랙션 추가 (Day 7-8)

#### 목업 앱 로직

```javascript
// mockup/mockup-app.js

// 전역 상태
let trips = [];
let currentView = 'list';

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  loadTrips();
  renderApp();
});

// 데이터 로드
function loadTrips() {
  const saved = localStorage.getItem('trips');
  if (saved) {
    trips = JSON.parse(saved);
  }
}

// 데이터 저장
function saveTrips() {
  localStorage.setItem('trips', JSON.stringify(trips));
}

// 앱 렌더링
function renderApp() {
  switch (currentView) {
    case 'list':
      renderTripList();
      break;
    case 'add':
      renderAddForm();
      break;
    case 'schengen':
      renderSchengenCalculator();
      break;
  }
  updateStats();
}

// 여행 목록 렌더링
function renderTripList() {
  const container = document.getElementById('tripList');
  container.innerHTML = '';

  if (trips.length === 0) {
    container.innerHTML = '<p>아직 여행 기록이 없습니다.</p>';
    return;
  }

  trips.forEach(trip => {
    const card = document.createElement('div');
    card.className = 'trip-card';
    card.innerHTML = `
      <h3>${trip.country}</h3>
      <p>기간: ${trip.entryDate} ~ ${trip.exitDate || '진행중'}</p>
      <p>비자: ${trip.visaType}</p>
      <button onclick="editTrip('${trip.id}')">수정</button>
      <button onclick="deleteTrip('${trip.id}')">삭제</button>
    `;
    container.appendChild(card);
  });
}

// 여행 추가 폼
function renderAddForm() {
  const container = document.getElementById('tripList');
  container.innerHTML = `
    <h2>새 여행 추가</h2>
    <form id="addTripForm">
      <div class="form-group">
        <label>국가</label>
        <select id="country" required>
          <option value="">선택하세요</option>
          <option value="France">프랑스</option>
          <option value="Germany">독일</option>
          <option value="Spain">스페인</option>
          <option value="Italy">이탈리아</option>
          <option value="Japan">일본</option>
          <option value="USA">미국</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>입국일</label>
        <input type="date" id="entryDate" required>
      </div>
      
      <div class="form-group">
        <label>출국일</label>
        <input type="date" id="exitDate">
      </div>
      
      <div class="form-group">
        <label>비자 종류</label>
        <select id="visaType" required>
          <option value="Tourist">관광</option>
          <option value="Business">비즈니스</option>
          <option value="Student">학생</option>
          <option value="Work">취업</option>
        </select>
      </div>
      
      <button type="submit" class="button">저장</button>
      <button type="button" onclick="currentView='list'; renderApp()">취소</button>
    </form>
  `;

  document
    .getElementById('addTripForm')
    .addEventListener('submit', handleAddTrip);
}

// 여행 추가 처리
function handleAddTrip(e) {
  e.preventDefault();

  const newTrip = {
    id: Date.now().toString(),
    country: document.getElementById('country').value,
    entryDate: document.getElementById('entryDate').value,
    exitDate: document.getElementById('exitDate').value,
    visaType: document.getElementById('visaType').value,
  };

  // 비즈니스 로직 적용
  try {
    validateTrip(newTrip);
    trips.push(newTrip);
    saveTrips();
    currentView = 'list';
    renderApp();
    alert('여행이 추가되었습니다!');
  } catch (error) {
    alert('오류: ' + error.message);
  }
}

// 여행 유효성 검사
function validateTrip(trip) {
  if (trip.exitDate && trip.entryDate > trip.exitDate) {
    throw new Error('출국일이 입국일보다 빠를 수 없습니다');
  }

  // 중복 체크
  const overlap = trips.some(t => {
    if (t.id === trip.id) return false;
    const newStart = new Date(trip.entryDate);
    const newEnd = new Date(trip.exitDate || '2099-12-31');
    const existingStart = new Date(t.entryDate);
    const existingEnd = new Date(t.exitDate || '2099-12-31');

    return newStart <= existingEnd && newEnd >= existingStart;
  });

  if (overlap) {
    throw new Error('해당 기간에 이미 다른 여행이 있습니다');
  }
}

// 통계 업데이트
function updateStats() {
  const countries = new Set(trips.map(t => t.country));
  document.getElementById('totalTrips').textContent = trips.length;
  document.getElementById('totalCountries').textContent = countries.size;

  // 셰겐 계산
  const schengenDays = calculateSchengenDays();
  document.getElementById('schengenDays').textContent = schengenDays;
}

// 셰겐 일수 계산
function calculateSchengenDays() {
  const schengenCountries = ['France', 'Germany', 'Spain', 'Italy'];
  const now = new Date();
  const cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  return trips
    .filter(t => schengenCountries.includes(t.country))
    .filter(t => new Date(t.exitDate || now) > cutoff)
    .reduce((total, trip) => {
      const entry = new Date(trip.entryDate);
      const exit = new Date(trip.exitDate || now);
      const days = Math.ceil((exit - entry) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);
}
```

### Step M.3: 셰겐 계산기 뷰 (Day 9)

```javascript
// 셰겐 계산기 화면
function renderSchengenCalculator() {
  const container = document.getElementById('tripList');
  const days = calculateSchengenDays();
  const remaining = 90 - days;
  const status = days > 90 ? 'danger' : days > 80 ? 'warning' : 'safe';

  container.innerHTML = `
    <h2>셰겐 지역 체류 현황</h2>
    
    <div class="schengen-summary ${status}">
      <h3>${days} / 90일 사용</h3>
      <p>남은 일수: ${remaining}일</p>
      
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${Math.min(100, (days / 90) * 100)}%"></div>
      </div>
    </div>
    
    <h3>최근 180일 셰겐 여행</h3>
    <div id="schengenTrips"></div>
    
    <button class="button" onclick="currentView='list'; renderApp()">돌아가기</button>
  `;

  // 셰겐 여행 목록
  const schengenDiv = document.getElementById('schengenTrips');
  const schengenTrips = getRecentSchengenTrips();

  if (schengenTrips.length === 0) {
    schengenDiv.innerHTML = '<p>최근 180일 내 셰겐 여행이 없습니다.</p>';
  } else {
    schengenTrips.forEach(trip => {
      const div = document.createElement('div');
      div.className = 'trip-card';
      div.innerHTML = `
        <strong>${trip.country}</strong>
        <span>${trip.entryDate} ~ ${trip.exitDate || '진행중'}</span>
        <span>(${calculateDays(trip)}일)</span>
      `;
      schengenDiv.appendChild(div);
    });
  }
}

// 최근 셰겐 여행 조회
function getRecentSchengenTrips() {
  const schengenCountries = ['France', 'Germany', 'Spain', 'Italy'];
  const now = new Date();
  const cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  return trips
    .filter(t => schengenCountries.includes(t.country))
    .filter(t => new Date(t.exitDate || now) > cutoff)
    .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
}
```

### Step M.4: 네비게이션 추가 (Day 10)

```javascript
// 네비게이션 바 추가
function addNavigation() {
  const nav = document.createElement('nav');
  nav.innerHTML = `
    <button onclick="navigateTo('list')">여행 목록</button>
    <button onclick="navigateTo('add')">여행 추가</button>
    <button onclick="navigateTo('schengen')">셰겐 계산기</button>
    <button onclick="navigateTo('stats')">통계</button>
  `;
  document.body.insertBefore(nav, document.body.firstChild);
}

// 네비게이션 처리
function navigateTo(view) {
  currentView = view;
  renderApp();
}

// 통계 화면
function renderStats() {
  const container = document.getElementById('tripList');
  const stats = generateStatistics();

  container.innerHTML = `
    <h2>여행 통계</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>${stats.totalTrips}</h3>
        <p>총 여행</p>
      </div>
      
      <div class="stat-card">
        <h3>${stats.uniqueCountries}</h3>
        <p>방문 국가</p>
      </div>
      
      <div class="stat-card">
        <h3>${stats.totalDays}일</h3>
        <p>총 여행 일수</p>
      </div>
      
      <div class="stat-card">
        <h3>${stats.averageDays}일</h3>
        <p>평균 여행 기간</p>
      </div>
    </div>
    
    <h3>국가별 방문 횟수</h3>
    <div id="countryStats"></div>
  `;

  // 국가별 통계
  const countryDiv = document.getElementById('countryStats');
  Object.entries(stats.byCountry).forEach(([country, count]) => {
    const bar = document.createElement('div');
    bar.className = 'stat-bar';
    bar.innerHTML = `
      <span>${country}</span>
      <div class="bar" style="width: ${count * 50}px">${count}회</div>
    `;
    countryDiv.appendChild(bar);
  });
}
```

### M단계 체크리스트

```markdown
✅ HTML/CSS/JS로 작동하는 프로토타입
✅ 모든 핵심 기능 UI 구현
✅ 비즈니스 로직 통합
✅ 로컬 스토리지 데이터 저장
✅ 기본적인 유효성 검사
```

---

## Phase A: API Integration (Day 11-15)

### A단계 목표

**"실제 백엔드 API와 연동된 앱"**

### Step A.1: API 서버 설계 (Day 11)

#### RESTful API 설계

```markdown
# API 엔드포인트 설계

## 인증

POST /api/auth/register # 회원가입
POST /api/auth/login # 로그인
POST /api/auth/logout # 로그아웃
GET /api/auth/me # 현재 사용자 정보

## 여행 관리

GET /api/trips # 여행 목록 조회
POST /api/trips # 여행 추가
GET /api/trips/:id # 여행 상세 조회
PUT /api/trips/:id # 여행 수정
DELETE /api/trips/:id # 여행 삭제

## 통계

GET /api/stats # 전체 통계
GET /api/stats/schengen # 셰겐 계산

## 데이터

GET /api/countries # 국가 목록
GET /api/visa-types # 비자 종류 목록
```

#### Express.js 서버 구현

```javascript
// server/app.js
const express = require('express');
const cors = require('cors');
const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// 임시 데이터 저장소
let trips = [];
let users = [];

// 여행 API 라우트
app.get('/api/trips', (req, res) => {
  // TODO: 실제로는 사용자별 필터링 필요
  res.json({ success: true, data: trips });
});

app.post('/api/trips', (req, res) => {
  try {
    const newTrip = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 비즈니스 로직 검증
    validateTrip(newTrip);

    trips.push(newTrip);
    res.status(201).json({ success: true, data: newTrip });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/trips/:id', (req, res) => {
  const trip = trips.find(t => t.id === req.params.id);

  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  res.json({ success: true, data: trip });
});

app.put('/api/trips/:id', (req, res) => {
  const index = trips.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  try {
    const updatedTrip = {
      ...trips[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date(),
    };

    validateTrip(updatedTrip);
    trips[index] = updatedTrip;

    res.json({ success: true, data: updatedTrip });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/trips/:id', (req, res) => {
  const index = trips.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  trips.splice(index, 1);
  res.json({ success: true, message: 'Trip deleted' });
});

// 통계 API
app.get('/api/stats', (req, res) => {
  const stats = generateStatistics(trips);
  res.json({ success: true, data: stats });
});

app.get('/api/stats/schengen', (req, res) => {
  const schengenStats = calculateSchengenUsage(trips);
  res.json({ success: true, data: schengenStats });
});

// 서버 시작
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API 서버가 포트 ${PORT}에서 실행 중입니다`);
});
```

### Step A.2: API 클라이언트 구현 (Day 12)

#### API 클라이언트 클래스

```javascript
// client/api-client.js
class ApiClient {
  constructor(baseURL = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  // 기본 요청 메서드
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // 여행 관련 메서드
  async getTrips() {
    const response = await this.request('/trips');
    return response.data;
  }

  async getTrip(id) {
    const response = await this.request(`/trips/${id}`);
    return response.data;
  }

  async createTrip(tripData) {
    const response = await this.request('/trips', {
      method: 'POST',
      body: tripData,
    });
    return response.data;
  }

  async updateTrip(id, tripData) {
    const response = await this.request(`/trips/${id}`, {
      method: 'PUT',
      body: tripData,
    });
    return response.data;
  }

  async deleteTrip(id) {
    await this.request(`/trips/${id}`, {
      method: 'DELETE',
    });
  }

  // 통계 관련 메서드
  async getStats() {
    const response = await this.request('/stats');
    return response.data;
  }

  async getSchengenStats() {
    const response = await this.request('/stats/schengen');
    return response.data;
  }
}

// 전역 인스턴스 생성
const apiClient = new ApiClient();
```

### Step A.3: UI와 API 연결 (Day 13-14)

#### 기존 목업 코드를 API 연동으로 변환

```javascript
// client/app.js

// API 클라이언트 인스턴스
const api = new ApiClient();

// 데이터 로드 (API 사용)
async function loadTrips() {
  try {
    showLoading();
    trips = await api.getTrips();
    hideLoading();
    renderApp();
  } catch (error) {
    showError('여행 목록을 불러올 수 없습니다: ' + error.message);
  }
}

// 여행 추가 (API 사용)
async function handleAddTrip(e) {
  e.preventDefault();

  const formData = {
    country: document.getElementById('country').value,
    entryDate: document.getElementById('entryDate').value,
    exitDate: document.getElementById('exitDate').value || null,
    visaType: document.getElementById('visaType').value,
    purpose: document.getElementById('purpose').value,
  };

  try {
    showLoading();
    const newTrip = await api.createTrip(formData);
    trips.push(newTrip);
    currentView = 'list';
    renderApp();
    showSuccess('여행이 추가되었습니다!');
  } catch (error) {
    showError('여행 추가 실패: ' + error.message);
  } finally {
    hideLoading();
  }
}

// 여행 수정
async function editTrip(id) {
  const trip = trips.find(t => t.id === id);
  if (!trip) return;

  // 수정 폼 표시
  currentView = 'edit';
  currentEditId = id;
  renderEditForm(trip);
}

// 수정 폼 렌더링
function renderEditForm(trip) {
  const container = document.getElementById('tripList');
  container.innerHTML = `
    <h2>여행 수정</h2>
    <form id="editTripForm">
      <!-- 추가 폼과 동일한 필드들 -->
      <input type="hidden" id="tripId" value="${trip.id}">
      <!-- ... 기타 필드들 ... -->
      <button type="submit" class="button">수정</button>
      <button type="button" onclick="currentView='list'; renderApp()">취소</button>
    </form>
  `;

  // 폼에 기존 값 채우기
  document.getElementById('country').value = trip.country;
  document.getElementById('entryDate').value = trip.entryDate;
  // ... 기타 필드들 ...

  document
    .getElementById('editTripForm')
    .addEventListener('submit', handleEditTrip);
}

// 수정 처리
async function handleEditTrip(e) {
  e.preventDefault();

  const id = document.getElementById('tripId').value;
  const formData = {
    // ... 폼 데이터 수집 ...
  };

  try {
    showLoading();
    const updatedTrip = await api.updateTrip(id, formData);

    // 로컬 배열 업데이트
    const index = trips.findIndex(t => t.id === id);
    trips[index] = updatedTrip;

    currentView = 'list';
    renderApp();
    showSuccess('여행이 수정되었습니다!');
  } catch (error) {
    showError('수정 실패: ' + error.message);
  } finally {
    hideLoading();
  }
}

// 여행 삭제
async function deleteTrip(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    showLoading();
    await api.deleteTrip(id);
    trips = trips.filter(t => t.id !== id);
    renderApp();
    showSuccess('여행이 삭제되었습니다!');
  } catch (error) {
    showError('삭제 실패: ' + error.message);
  } finally {
    hideLoading();
  }
}

// 통계 로드
async function loadStats() {
  try {
    const stats = await api.getStats();
    renderStats(stats);
  } catch (error) {
    showError('통계를 불러올 수 없습니다');
  }
}

// 셰겐 통계 로드
async function loadSchengenStats() {
  try {
    const schengenStats = await api.getSchengenStats();
    renderSchengenCalculator(schengenStats);
  } catch (error) {
    showError('셰겐 통계를 불러올 수 없습니다');
  }
}
```

### Step A.4: 에러 처리 및 로딩 상태 (Day 15)

#### UI 피드백 시스템

```javascript
// client/ui-feedback.js

// 로딩 표시
function showLoading() {
  const loader = document.getElementById('loader') || createLoader();
  loader.style.display = 'block';
}

function hideLoading() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
}

function createLoader() {
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.className = 'loader';
  loader.innerHTML = '<div class="spinner"></div><p>로딩 중...</p>';
  document.body.appendChild(loader);
  return loader;
}

// 알림 시스템
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // 3초 후 자동 제거
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showSuccess(message) {
  showNotification(message, 'success');
}

function showError(message) {
  showNotification(message, 'error');
}

function showWarning(message) {
  showNotification(message, 'warning');
}

// 오프라인 처리
window.addEventListener('online', () => {
  showSuccess('인터넷 연결이 복구되었습니다');
  loadTrips(); // 데이터 새로고침
});

window.addEventListener('offline', () => {
  showWarning('인터넷 연결이 끊어졌습니다. 오프라인 모드로 전환합니다.');
});

// API 재시도 로직
async function retryableRequest(requestFn, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError;
}
```

### A단계 체크리스트

```markdown
✅ RESTful API 서버 구현
✅ API 클라이언트 구현
✅ 모든 CRUD 작업 API 연동
✅ 에러 처리 및 재시도 로직
✅ 로딩 상태 표시
✅ 오프라인 대응
```

---

## Phase D: Design Polish (Day 16-20)

### D단계 목표

**"프로덕션 레벨의 완성된 앱"**

### Step D.1: UI 프레임워크 적용 (Day 16-17)

#### CSS 프레임워크 선택 및 적용

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>DINO - 여행 기록 앱</title>
    <!-- Bootstrap 5 -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <!-- Bootstrap Icons -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
    />
    <!-- Custom CSS -->
    <link rel="stylesheet" href="styles/app.css" />
  </head>
  <body>
    <!-- 네비게이션 바 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="#">
          <i class="bi bi-airplane-fill"></i> DINO
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" href="#" onclick="navigateTo('list')">
                <i class="bi bi-list-ul"></i> 여행 목록
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" onclick="navigateTo('add')">
                <i class="bi bi-plus-circle"></i> 여행 추가
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" onclick="navigateTo('schengen')">
                <i class="bi bi-calculator"></i> 셰겐 계산기
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" onclick="navigateTo('stats')">
                <i class="bi bi-bar-chart"></i> 통계
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 메인 컨테이너 -->
    <div class="container mt-4">
      <div id="app"></div>
    </div>

    <!-- 로더 -->
    <div id="loader" class="d-none">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/app.js"></script>
  </body>
</html>
```

#### 커스텀 스타일

```css
/* styles/app.css */

:root {
  --primary-color: #0066cc;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --schengen-safe: #28a745;
  --schengen-warning: #ffc107;
  --schengen-danger: #dc3545;
}

/* 네비게이션 개선 */
.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

/* 카드 스타일 */
.trip-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
}

.trip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 통계 카드 */
.stat-card {
  text-align: center;
  padding: 2rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card h3 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

/* 셰겐 계산기 */
.schengen-meter {
  position: relative;
  height: 200px;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
}

.schengen-progress {
  height: 30px;
  border-radius: 15px;
  overflow: hidden;
  background: #e9ecef;
}

.schengen-progress-bar {
  height: 100%;
  transition: width 0.5s ease;
}

.schengen-safe .schengen-progress-bar {
  background: var(--schengen-safe);
}

.schengen-warning .schengen-progress-bar {
  background: var(--schengen-warning);
}

.schengen-danger .schengen-progress-bar {
  background: var(--schengen-danger);
}

/* 로더 */
#loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* 알림 */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 5px;
  color: white;
  animation: slideIn 0.3s ease;
  z-index: 1000;
}

.notification.success {
  background: var(--success-color);
}

.notification.error {
  background: var(--danger-color);
}

.notification.warning {
  background: var(--warning-color);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 1rem;
  }

  .trip-card {
    margin-bottom: 1rem;
  }
}
```

### Step D.2: 컴포넌트 리팩토링 (Day 18)

#### 컴포넌트 기반 구조로 변환

```javascript
// components/TripCard.js
class TripCard {
  constructor(trip, onEdit, onDelete) {
    this.trip = trip;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
  }

  render() {
    const days = this.calculateDays();
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-3';

    card.innerHTML = `
      <div class="card trip-card h-100">
        <div class="card-body">
          <h5 class="card-title">
            <span class="flag-icon flag-icon-${this.getCountryCode()}"></span>
            ${this.trip.country}
          </h5>
          <p class="card-text">
            <i class="bi bi-calendar3"></i> 
            ${this.formatDate(this.trip.entryDate)} - 
            ${this.trip.exitDate ? this.formatDate(this.trip.exitDate) : '진행 중'}
          </p>
          <p class="card-text">
            <span class="badge bg-primary">${this.trip.visaType}</span>
            <span class="badge bg-secondary ms-1">${days}일</span>
          </p>
          <div class="d-flex justify-content-end">
            <button class="btn btn-sm btn-outline-primary me-2" 
                    onclick="editTrip('${this.trip.id}')">
              <i class="bi bi-pencil"></i> 수정
            </button>
            <button class="btn btn-sm btn-outline-danger" 
                    onclick="deleteTrip('${this.trip.id}')">
              <i class="bi bi-trash"></i> 삭제
            </button>
          </div>
        </div>
      </div>
    `;

    return card;
  }

  calculateDays() {
    if (!this.trip.exitDate) return '진행 중';
    const entry = new Date(this.trip.entryDate);
    const exit = new Date(this.trip.exitDate);
    return Math.ceil((exit - entry) / (1000 * 60 * 60 * 24)) + 1;
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ko-KR');
  }

  getCountryCode() {
    // 국가 코드 매핑 (실제로는 더 완전한 매핑 필요)
    const countryMap = {
      France: 'fr',
      Germany: 'de',
      Spain: 'es',
      Italy: 'it',
      Japan: 'jp',
      USA: 'us',
    };
    return countryMap[this.trip.country] || 'un';
  }
}

// components/TripForm.js
class TripForm {
  constructor(trip = null, onSubmit) {
    this.trip = trip;
    this.onSubmit = onSubmit;
    this.isEdit = !!trip;
  }

  render() {
    const form = document.createElement('form');
    form.className = 'needs-validation';
    form.noValidate = true;

    form.innerHTML = `
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="country" class="form-label">국가</label>
          <select class="form-select" id="country" required>
            <option value="">선택하세요</option>
            ${this.renderCountryOptions()}
          </select>
          <div class="invalid-feedback">
            국가를 선택해주세요.
          </div>
        </div>
        
        <div class="col-md-6 mb-3">
          <label for="visaType" class="form-label">비자 종류</label>
          <select class="form-select" id="visaType" required>
            <option value="">선택하세요</option>
            <option value="Tourist">관광</option>
            <option value="Business">비즈니스</option>
            <option value="Student">학생</option>
            <option value="Work">취업</option>
            <option value="Transit">경유</option>
          </select>
          <div class="invalid-feedback">
            비자 종류를 선택해주세요.
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="entryDate" class="form-label">입국일</label>
          <input type="date" class="form-control" id="entryDate" required>
          <div class="invalid-feedback">
            입국일을 선택해주세요.
          </div>
        </div>
        
        <div class="col-md-6 mb-3">
          <label for="exitDate" class="form-label">출국일 (선택)</label>
          <input type="date" class="form-control" id="exitDate">
          <div class="form-text">
            아직 출국하지 않았다면 비워두세요.
          </div>
        </div>
      </div>
      
      <div class="mb-3">
        <label for="purpose" class="form-label">여행 목적</label>
        <select class="form-select" id="purpose" required>
          <option value="">선택하세요</option>
          <option value="tourism">관광</option>
          <option value="business">업무</option>
          <option value="study">학업</option>
          <option value="other">기타</option>
        </select>
        <div class="invalid-feedback">
          여행 목적을 선택해주세요.
        </div>
      </div>
      
      <div class="mb-3">
        <label for="notes" class="form-label">메모 (선택)</label>
        <textarea class="form-control" id="notes" rows="3"></textarea>
      </div>
      
      <div class="d-flex justify-content-end">
        <button type="button" class="btn btn-secondary me-2" 
                onclick="navigateTo('list')">
          취소
        </button>
        <button type="submit" class="btn btn-primary">
          ${this.isEdit ? '수정' : '추가'}
        </button>
      </div>
    `;

    form.addEventListener('submit', e => this.handleSubmit(e));

    // 수정 모드일 때 기존 값 채우기
    if (this.isEdit) {
      setTimeout(() => this.fillForm(), 0);
    }

    return form;
  }

  renderCountryOptions() {
    const countries = [
      'France',
      'Germany',
      'Spain',
      'Italy',
      'Netherlands',
      'Belgium',
      'Austria',
      'Greece',
      'Portugal',
      'Sweden',
      'Japan',
      'South Korea',
      'USA',
      'Canada',
      'UK',
      'Australia',
      'Singapore',
      'Thailand',
      'Vietnam',
    ];

    return countries
      .map(country => `<option value="${country}">${country}</option>`)
      .join('');
  }

  fillForm() {
    if (!this.trip) return;

    document.getElementById('country').value = this.trip.country;
    document.getElementById('visaType').value = this.trip.visaType;
    document.getElementById('entryDate').value = this.trip.entryDate;
    document.getElementById('exitDate').value = this.trip.exitDate || '';
    document.getElementById('purpose').value = this.trip.purpose;
    document.getElementById('notes').value = this.trip.notes || '';
  }

  handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    const form = e.target;

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const formData = {
      country: document.getElementById('country').value,
      visaType: document.getElementById('visaType').value,
      entryDate: document.getElementById('entryDate').value,
      exitDate: document.getElementById('exitDate').value || null,
      purpose: document.getElementById('purpose').value,
      notes: document.getElementById('notes').value || null,
    };

    this.onSubmit(formData);
  }
}
```

### Step D.3: 차트 및 시각화 추가 (Day 19)

```javascript
// components/StatsChart.js
class StatsChart {
  constructor(stats) {
    this.stats = stats;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'row';

    container.innerHTML = `
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">국가별 방문 횟수</h5>
            <canvas id="countryChart"></canvas>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">월별 여행 통계</h5>
            <canvas id="monthlyChart"></canvas>
          </div>
        </div>
      </div>
    `;

    // Chart.js로 차트 그리기
    setTimeout(() => {
      this.drawCountryChart();
      this.drawMonthlyChart();
    }, 0);

    return container;
  }

  drawCountryChart() {
    const ctx = document.getElementById('countryChart').getContext('2d');
    const data = this.prepareCountryData();

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: '방문 횟수',
            data: data.values,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  drawMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const data = this.prepareMonthlyData();

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: '여행 일수',
            data: data.values,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  prepareCountryData() {
    const countries = Object.entries(this.stats.byCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      labels: countries.map(([country]) => country),
      values: countries.map(([, count]) => count),
    };
  }

  prepareMonthlyData() {
    // 최근 12개월 데이터 준비
    const months = [];
    const values = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      months.push(monthKey);
      values.push(this.stats.byMonth?.[monthKey] || 0);
    }

    return { labels: months, values };
  }
}
```

### Step D.4: 최종 마무리 (Day 20)

#### PWA 설정

```javascript
// service-worker.js
const CACHE_NAME = 'dino-travel-v1';
const urlsToCache = [
  '/',
  '/styles/app.css',
  '/js/app.js',
  '/js/api-client.js',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
```

#### 매니페스트 파일

```json
// manifest.json
{
  "name": "DINO Travel Tracker",
  "short_name": "DINO",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0066cc",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### D단계 체크리스트

```markdown
✅ UI 프레임워크 적용 (Bootstrap)
✅ 반응형 디자인 구현
✅ 컴포넌트 기반 구조
✅ 데이터 시각화 (차트)
✅ 애니메이션 및 트랜지션
✅ PWA 기능 추가
✅ 성능 최적화
✅ 접근성 개선
```

---

## BMAD 실전 프로젝트

### 프로젝트: 여행 기록 앱 완성

#### 최종 파일 구조

```
travel-app/
├── client/
│   ├── index.html
│   ├── manifest.json
│   ├── service-worker.js
│   ├── css/
│   │   └── app.css
│   ├── js/
│   │   ├── app.js
│   │   ├── api-client.js
│   │   └── ui-feedback.js
│   └── components/
│       ├── TripCard.js
│       ├── TripForm.js
│       ├── StatsChart.js
│       └── SchengenMeter.js
├── server/
│   ├── app.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── trips.js
│   │   └── stats.js
│   ├── models/
│   │   ├── Trip.js
│   │   └── User.js
│   ├── business/
│   │   ├── TripManager.js
│   │   ├── SchengenCalculator.js
│   │   └── StatisticsGenerator.js
│   └── middleware/
│       ├── auth.js
│       └── validation.js
└── package.json
```

#### 배포 준비

```bash
# 프로덕션 빌드
npm run build

# 환경 변수 설정
NODE_ENV=production
API_URL=https://api.your-domain.com
DATABASE_URL=postgresql://...

# PM2로 서버 실행
pm2 start server/app.js --name dino-api

# Nginx 설정
server {
  listen 80;
  server_name your-domain.com;

  location / {
    root /var/www/travel-app/client;
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
  }
}
```

---

## 트러블슈팅 가이드

### 자주 발생하는 문제들

#### 1. 비즈니스 로직 에러

```javascript
문제: '날짜 계산이 이상해요';

// 시간대 문제 해결
해결: function normalizeDate(dateString) {
  const date = new Date(dateString);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// 포함적 일수 계산
function calculateDays(entry, exit) {
  const start = normalizeDate(entry);
  const end = normalizeDate(exit);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}
```

#### 2. API 연동 문제

```javascript
문제: "CORS 에러가 발생해요"

해결:
// 서버에서 CORS 설정
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true
}))

// 개발 중에는 프록시 사용
// package.json
"proxy": "http://localhost:3001"
```

#### 3. 상태 동기화 문제

```javascript
문제: "UI가 업데이트 안 돼요"

해결:
// 상태 변경 후 재렌더링
async function updateTrip(id, data) {
  const updated = await api.updateTrip(id, data)

  // 로컬 상태 업데이트
  const index = trips.findIndex(t => t.id === id)
  trips[index] = updated

  // UI 재렌더링
  renderApp()
}
```

---

## BMAD 마스터하기

### BMAD 성공 전략

#### 1. **단계별 집중**

```
B단계: 비즈니스 로직에만 집중
M단계: 작동하는 UI에만 집중
A단계: API 연동에만 집중
D단계: 디자인 완성에만 집중
```

#### 2. **테스트 주도 진행**

```javascript
// 각 단계마다 테스트
B단계: console.log로 로직 테스트
M단계: 브라우저에서 UI 테스트
A단계: Postman으로 API 테스트
D단계: 실제 사용자 테스트
```

#### 3. **점진적 개선**

```
초기: 기본 기능만
중기: 엣지 케이스 처리
후기: 성능 최적화
최종: 사용자 경험 개선
```

### BMAD 체크리스트 템플릿

```markdown
# 프로젝트명: **\*\***\_\_\_**\*\***

## B단계 (Business Logic)

- [ ] 요구사항 정의
- [ ] 데이터 모델 설계
- [ ] 핵심 비즈니스 로직 구현
- [ ] 콘솔 테스트 완료
- [ ] 데이터 영속성 구현

## M단계 (Mockup)

- [ ] 화면 구성 계획
- [ ] HTML 프로토타입
- [ ] JavaScript 인터랙션
- [ ] 로컬 스토리지 연동
- [ ] 모든 기능 UI 구현

## A단계 (API)

- [ ] API 설계
- [ ] 서버 구현
- [ ] 클라이언트 연동
- [ ] 에러 처리
- [ ] 로딩 상태 구현

## D단계 (Design)

- [ ] UI 프레임워크 적용
- [ ] 반응형 디자인
- [ ] 애니메이션 추가
- [ ] 성능 최적화
- [ ] 최종 테스트
```

### 마무리

BMAD Method를 통해 체계적으로 앱을 개발할 수 있습니다:

1. **명확한 단계**: 각 단계의 목표가 분명
2. **측정 가능**: 진행 상황을 확인 가능
3. **위험 감소**: 단계별 검증으로 리스크 최소화
4. **협업 용이**: 팀원과 역할 분담 가능

**이제 BMAD Method로 여러분만의 앱을 만들어보세요! 🚀**
