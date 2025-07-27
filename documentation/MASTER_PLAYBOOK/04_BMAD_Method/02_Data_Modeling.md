# 🗄️ Data Modeling (데이터 모델링)

## 🎯 개요

비즈니스 정의를 기반으로 **데이터 구조를 설계**하는 단계입니다. 좋은 데이터 모델은 확장 가능하고 유지보수가 쉬운 시스템의 기초입니다.

### 핵심 원칙
1. **비즈니스 중심**: 기술이 아닌 비즈니스 요구사항 반영
2. **단순성**: 복잡한 것보다 간단한 것이 좋다
3. **확장성**: 미래 변화를 고려한 설계
4. **일관성**: 명명 규칙과 구조의 통일성

## 📊 데이터 모델링 프로세스

### Step 1: 핵심 엔티티 도출

#### 엔티티 식별 방법
```
비즈니스 요구사항에서 명사 추출:
"고객이 상품을 장바구니에 담고 주문한다"

추출된 엔티티:
- 고객 (Customer)
- 상품 (Product)
- 장바구니 (Cart)
- 주문 (Order)
```

#### 엔티티 정의 템플릿
```typescript
Entity: User
설명: 서비스를 사용하는 고객
속성:
  - id: 고유 식별자
  - email: 로그인용 이메일
  - name: 사용자 이름
  - created_at: 가입일시
  
비즈니스 규칙:
  - email은 유니크해야 함
  - 삭제 시 관련 데이터 처리 방법
```

### Step 2: 관계 설계

#### 관계 유형
```
1:1 (One-to-One)
User ─── Profile
한 사용자는 하나의 프로필

1:N (One-to-Many)
User ─── Orders
한 사용자는 여러 주문

N:M (Many-to-Many)
Products ─── Categories
상품은 여러 카테고리, 카테고리는 여러 상품
```

#### 관계 설계 예시
```mermaid
User (1) ──< Orders (N)
Order (1) ──< OrderItems (N)
OrderItem (N) >── Product (1)
Product (N) >──< Category (N)
```

### Step 3: 속성 정의

#### 속성 타입 가이드
```typescript
// 기본 타입
id: UUID // 고유 식별자
name: String(255) // 문자열
price: Decimal(10,2) // 금액
quantity: Integer // 수량
is_active: Boolean // 상태
created_at: Timestamp // 일시

// 관계 타입
user_id: UUID // Foreign Key
category_ids: Array<UUID> // Many-to-Many

// JSON 타입
metadata: JSON // 유연한 추가 정보
settings: JSON // 설정 정보
```

#### 필수 vs 선택 속성
```typescript
// User 엔티티
{
  // 필수 속성
  id: UUID (required, unique)
  email: String (required, unique)
  password_hash: String (required)
  
  // 선택 속성
  name: String (optional)
  phone: String (optional)
  avatar_url: String (optional)
  
  // 시스템 속성
  created_at: Timestamp (required, auto)
  updated_at: Timestamp (required, auto)
  deleted_at: Timestamp (optional) // Soft delete
}
```

## 🏗️ 실전 데이터 모델링

### 사례: 이커머스 플랫폼

#### 핵심 엔티티
```typescript
// 1. User (사용자)
{
  id: UUID
  email: String
  password_hash: String
  role: Enum('customer', 'seller', 'admin')
  created_at: Timestamp
}

// 2. Product (상품)
{
  id: UUID
  seller_id: UUID (FK → User)
  name: String
  description: Text
  price: Decimal
  stock: Integer
  images: Array<String>
  created_at: Timestamp
}

// 3. Order (주문)
{
  id: UUID
  user_id: UUID (FK → User)
  status: Enum('pending', 'paid', 'shipped', 'delivered')
  total_amount: Decimal
  shipping_address: JSON
  created_at: Timestamp
}

// 4. OrderItem (주문 항목)
{
  id: UUID
  order_id: UUID (FK → Order)
  product_id: UUID (FK → Product)
  quantity: Integer
  price: Decimal // 주문 시점 가격
}
```

#### 관계 다이어그램
```
User
 ├── Products (seller)
 └── Orders (customer)
      └── OrderItems
           └── Product
```

### 사례: SaaS 구독 서비스

#### 핵심 엔티티
```typescript
// 1. Account (계정)
{
  id: UUID
  name: String
  plan: Enum('free', 'basic', 'pro', 'enterprise')
  created_at: Timestamp
}

// 2. User (사용자)
{
  id: UUID
  account_id: UUID (FK → Account)
  email: String
  role: Enum('owner', 'admin', 'member')
  created_at: Timestamp
}

// 3. Subscription (구독)
{
  id: UUID
  account_id: UUID (FK → Account)
  plan: String
  status: Enum('active', 'cancelled', 'expired')
  current_period_start: Date
  current_period_end: Date
  created_at: Timestamp
}

// 4. Usage (사용량)
{
  id: UUID
  account_id: UUID (FK → Account)
  metric: String
  value: Integer
  timestamp: Timestamp
}
```

## 💾 데이터베이스 선택

### SQL vs NoSQL 결정 트리
```
정형화된 데이터? → YES → 관계가 중요? → YES → PostgreSQL
                                    → NO → MySQL

정형화된 데이터? → NO → 실시간 필요? → YES → MongoDB
                                  → NO → DynamoDB
```

### 데이터베이스별 적합한 경우

#### PostgreSQL
- 복잡한 관계형 데이터
- ACID 트랜잭션 필요
- 복잡한 쿼리와 분석
- 예: 이커머스, ERP

#### MongoDB
- 유연한 스키마
- 비정형 데이터
- 빠른 프로토타이핑
- 예: CMS, 실시간 분석

#### Redis
- 캐싱
- 세션 저장
- 실시간 데이터
- 예: 실시간 순위, 채팅

## 🔄 데이터 마이그레이션

### 버전 관리 전략
```javascript
// migrations/001_create_users.js
exports.up = function(db) {
  return db.createTable('users', {
    id: { type: 'uuid', primaryKey: true },
    email: { type: 'string', unique: true },
    created_at: { type: 'timestamp', defaultValue: 'now()' }
  });
};

exports.down = function(db) {
  return db.dropTable('users');
};
```

### 무중단 마이그레이션
1. **추가만 하기**: 컬럼/테이블 추가는 안전
2. **단계적 변경**: 삭제 전 deprecation 기간
3. **롤백 가능**: down 마이그레이션 준비
4. **데이터 백업**: 변경 전 항상 백업

## 📐 모범 사례

### 명명 규칙
```
테이블: 복수형, snake_case
  좋음: users, order_items
  나쁨: User, OrderItem

컬럼: 단수형, snake_case
  좋음: user_id, created_at
  나쁨: userId, createdAt

관계: 명확한 의미
  좋음: author_id, seller_id
  나쁨: user_id (모호함)
```

### 인덱스 전략
```sql
-- 기본 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- 복합 인덱스
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- 부분 인덱스
CREATE INDEX idx_products_active ON products(id) WHERE is_active = true;
```

### 성능 고려사항
1. **N+1 쿼리 방지**: Eager Loading 사용
2. **인덱스 최적화**: 자주 쓰는 쿼리 분석
3. **파티셔닝**: 대용량 테이블 분할
4. **캐싱**: 자주 읽는 데이터

## 🎯 Day 4-7 실행 계획

### Day 4: 엔티티 도출
```
오전:
- 비즈니스 요구사항 분석
- 핵심 엔티티 5-7개 도출
- 엔티티 정의서 작성

오후:
- 속성 정의
- 데이터 타입 결정
- 제약 조건 설정
```

### Day 5: 관계 설계
```
오전:
- ERD 작성
- 관계 유형 정의
- 정규화 검토

오후:
- 비정규화 결정
- 인덱스 계획
- 성능 고려사항
```

### Day 6: 데이터베이스 구현
```
오전:
- 데이터베이스 선택
- 스키마 생성
- 초기 데이터 준비

오후:
- 마이그레이션 작성
- 시드 데이터 생성
- 백업 전략 수립
```

### Day 7: 검증 및 최적화
```
오전:
- 쿼리 테스트
- 성능 측정
- 병목 지점 발견

오후:
- 인덱스 최적화
- 쿼리 최적화
- 문서화
```

## ✅ 체크리스트

### 데이터 모델링 완료 기준
- [ ] 모든 비즈니스 요구사항 반영
- [ ] ERD 완성
- [ ] 정규화/비정규화 결정
- [ ] 인덱스 전략 수립
- [ ] 마이그레이션 준비
- [ ] 성능 테스트 완료

## 💡 실전 팁

### Do's ✅
1. **작게 시작**: 5-7개 핵심 테이블로 시작
2. **미래 대비**: 확장 가능한 구조
3. **문서화**: 모든 결정 이유 기록
4. **테스트**: 실제 데이터로 검증

### Don'ts ❌
1. **과도한 정규화**: 성능 vs 정규화 균형
2. **미리 최적화**: 실제 병목 확인 후
3. **복잡한 구조**: KISS 원칙 준수
4. **백업 없이 변경**: 항상 백업 먼저

## 🔍 트러블슈팅

### 흔한 문제와 해결
```
문제: 쿼리가 느림
해결: EXPLAIN 분석 → 인덱스 추가

문제: 데이터 불일치
해결: 트랜잭션 사용 → 제약 조건 추가

문제: 스키마 변경 어려움
해결: 마이그레이션 도구 → 버전 관리
```

---

> 🗄️ **"좋은 데이터 모델은 좋은 시스템의 70%"**

다음: [API 설계](03_API_Design.md) →