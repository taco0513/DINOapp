# 🔌 API Design (API 설계)

## 🎯 개요

데이터 모델을 기반으로 **클라이언트와 서버 간의 통신 인터페이스**를 설계합니다. 좋은 API는 직관적이고, 일관성 있으며, 확장 가능합니다.

### API 설계 원칙
1. **일관성**: 예측 가능한 패턴
2. **단순성**: 복잡함보다 간단함
3. **유연성**: 다양한 클라이언트 지원
4. **보안성**: 처음부터 보안 고려

## 🏗️ RESTful API 설계

### REST 원칙
```
1. Resource 중심 설계
   /users (not /getUsers)
   
2. HTTP 메서드 활용
   GET: 조회
   POST: 생성
   PUT/PATCH: 수정
   DELETE: 삭제
   
3. 상태 코드 활용
   200: 성공
   201: 생성됨
   400: 잘못된 요청
   401: 인증 필요
   404: 없음
   500: 서버 에러
```

### URL 설계 패턴
```
# 리소스 컬렉션
GET    /api/products          # 목록 조회
POST   /api/products          # 새 상품 생성

# 개별 리소스
GET    /api/products/:id      # 특정 상품 조회
PUT    /api/products/:id      # 전체 수정
PATCH  /api/products/:id      # 부분 수정
DELETE /api/products/:id      # 삭제

# 중첩 리소스
GET    /api/products/:id/reviews    # 상품의 리뷰들
POST   /api/products/:id/reviews    # 리뷰 작성

# 액션 (예외적으로 동사 사용)
POST   /api/products/:id/publish    # 상품 게시
POST   /api/orders/:id/cancel       # 주문 취소
```

## 📋 API 스펙 정의

### OpenAPI 3.0 명세
```yaml
openapi: 3.0.0
info:
  title: E-commerce API
  version: 1.0.0
  description: 온라인 쇼핑몰 API

paths:
  /api/products:
    get:
      summary: 상품 목록 조회
      parameters:
        - name: page
          in: query
          type: integer
          default: 1
        - name: limit
          in: query
          type: integer
          default: 20
        - name: category
          in: query
          type: string
      responses:
        200:
          description: 성공
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Product'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
```

### Request/Response 설계

#### Request 구조
```javascript
// 상품 생성 요청
POST /api/products
Headers:
  Content-Type: application/json
  Authorization: Bearer {token}

Body:
{
  "name": "맥북 프로 16인치",
  "description": "최신 M3 Pro 칩셋 탑재",
  "price": 3590000,
  "category_id": "electronics",
  "stock": 10,
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

#### Response 구조
```javascript
// 성공 응답
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "맥북 프로 16인치",
    "price": 3590000,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "request_id": "req_123456",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}

// 에러 응답
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "가격은 0보다 커야 합니다",
    "field": "price",
    "details": {
      "min": 0,
      "provided": -1000
    }
  },
  "meta": {
    "request_id": "req_123457",
    "timestamp": "2024-01-15T10:31:00Z"
  }
}
```

## 🔐 인증/인가 시스템

### JWT 기반 인증
```javascript
// 로그인
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}

// 응답
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "customer"
    }
  }
}

// 토큰 갱신
POST /api/auth/refresh
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 권한 체계
```javascript
// 역할 기반 접근 제어 (RBAC)
const permissions = {
  customer: [
    'products:read',
    'orders:create',
    'orders:read:own',
    'profile:update:own'
  ],
  seller: [
    ...permissions.customer,
    'products:create:own',
    'products:update:own',
    'products:delete:own',
    'orders:read:shop'
  ],
  admin: [
    '*:*' // 모든 권한
  ]
};

// API 엔드포인트별 권한
{
  'GET /api/products': ['public'],
  'POST /api/products': ['seller', 'admin'],
  'DELETE /api/products/:id': ['products:delete:own', 'admin'],
  'GET /api/orders': ['orders:read:own', 'orders:read:shop', 'admin']
}
```

## 📊 API 버전 관리

### 버전 관리 전략
```
1. URL 버전
   /api/v1/products
   /api/v2/products

2. Header 버전
   Accept: application/vnd.api+json;version=1

3. Query 버전
   /api/products?version=1
```

### 하위 호환성 유지
```javascript
// v1 응답 (기존)
{
  "id": 123,
  "name": "상품명",
  "price": 10000
}

// v2 응답 (확장)
{
  "id": 123,
  "name": "상품명",
  "price": 10000,
  "discount": {  // 새 필드 추가
    "rate": 10,
    "until": "2024-12-31"
  }
}

// v1 사용자는 discount 무시
// v2 사용자는 discount 활용
```

## 🚀 성능 최적화

### 페이지네이션
```javascript
// Offset 기반
GET /api/products?page=2&limit=20

{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 1000,
    "pages": 50
  }
}

// Cursor 기반 (대용량)
GET /api/products?cursor=eyJpZCI6MTAwfQ&limit=20

{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTIwfQ",
    "has_more": true
  }
}
```

### 필드 선택
```javascript
// 필요한 필드만 요청
GET /api/products?fields=id,name,price

// GraphQL 스타일
{
  products {
    id
    name
    price
  }
}
```

### 캐싱 전략
```javascript
// ETag 활용
Response Headers:
  ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

// 조건부 요청
Request Headers:
  If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"

// 변경 없으면 304 Not Modified
```

## 📝 API 문서화

### Swagger/OpenAPI 통합
```javascript
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 상품 목록 조회
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *     responses:
 *       200:
 *         description: 상품 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
```

### API 문서 구성
```markdown
# Product API

## 상품 목록 조회
상품 목록을 페이지네이션과 함께 조회합니다.

### Request
`GET /api/products`

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| page | integer | No | 페이지 번호 (기본: 1) |
| limit | integer | No | 페이지당 항목 수 (기본: 20) |
| category | string | No | 카테고리 필터 |

### Response
```json
{
  "success": true,
  "data": [...]
}
```
```

## 🔧 실전 구현

### Express.js 예시
```javascript
// routes/products.js
const router = express.Router();

// 미들웨어
router.use(authenticate);
router.use(rateLimit);

// 상품 목록
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, category } = req.query;
  
  try {
    const products = await Product.find({ category })
      .limit(limit)
      .skip((page - 1) * limit);
      
    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: await Product.count({ category })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
});

// 상품 생성
router.post('/', authorize('products:create'), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.errors
        }
      });
    }
  }
});
```

## 🎯 Day 8-11 실행 계획

### Day 8: API 설계
```
오전:
- 엔드포인트 목록 작성
- URL 패턴 정의
- HTTP 메서드 할당

오후:
- Request/Response 구조
- 에러 응답 설계
- 상태 코드 정의
```

### Day 9: 인증/인가
```
오전:
- 인증 방식 선택 (JWT)
- 토큰 구조 설계
- 갱신 토큰 전략

오후:
- 권한 체계 설계
- API별 권한 매핑
- 보안 정책 수립
```

### Day 10: 구현
```
오전:
- 기본 라우터 구성
- 미들웨어 설정
- 핵심 API 구현

오후:
- 인증 시스템 구현
- 에러 핸들링
- 유효성 검사
```

### Day 11: 문서화/테스트
```
오전:
- OpenAPI 스펙 작성
- Swagger UI 설정
- API 문서 생성

오후:
- 통합 테스트 작성
- 성능 테스트
- 보안 테스트
```

## ✅ 체크리스트

### API 설계 완료 기준
- [ ] 모든 비즈니스 기능 커버
- [ ] RESTful 원칙 준수
- [ ] 일관된 응답 구조
- [ ] 완전한 에러 처리
- [ ] 인증/인가 구현
- [ ] API 문서 완성
- [ ] 테스트 커버리지 80%+

## 💡 Best Practices

### Do's ✅
1. **버전 관리**: 처음부터 버전 고려
2. **일관성**: 네이밍, 구조 통일
3. **문서화**: 코드와 함께 작성
4. **보안**: HTTPS, 인증, 권한

### Don'ts ❌
1. **동사 URL**: /getUsers (X)
2. **민감정보 노출**: 비밀번호, 토큰
3. **과도한 중첩**: /a/b/c/d/e
4. **일관성 없는 응답**: 매번 다른 구조

---

> 🔌 **"API는 개발자를 위한 UI다"**

다음: [UI/UX 디자인](04_UI_UX_Design.md) →