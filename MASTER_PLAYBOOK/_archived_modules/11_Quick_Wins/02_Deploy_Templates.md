# 즉시 배포 템플릿

## 개요

1클릭 배포가 가능한 사전 구성된 템플릿들입니다. 복잡한 설정 없이 바로 프로덕션 환경에서 실행할 수 있도록 최적화된 스택과 자동화 스크립트를 제공합니다.

## 플랫폼별 즉시 배포

### Vercel 원클릭 템플릿

```typescript
// vercel-templates.ts - Vercel 최적화 템플릿
export const vercelTemplates = {
  // Next.js 풀스택 SaaS
  saas: {
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/your-org/saas-template",
    features: [
      "Next.js 14 + App Router",
      "Supabase 인증 및 데이터베이스",
      "Stripe 결제 시스템",
      "이메일 자동화",
      "관리자 대시보드",
      "SEO 최적화"
    ],
    envVariables: {
      NEXT_PUBLIC_SUPABASE_URL: "Your Supabase project URL",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "Your Supabase anon key",
      SUPABASE_SERVICE_ROLE_KEY: "Your Supabase service role key",
      NEXTAUTH_SECRET: "Random secret key",
      NEXTAUTH_URL: "Your domain",
      STRIPE_SECRET_KEY: "Your Stripe secret key",
      STRIPE_WEBHOOK_SECRET: "Your Stripe webhook secret"
    },
    postDeploy: [
      "Supabase 테이블 생성",
      "Stripe 제품 및 가격 설정",
      "도메인 연결",
      "SSL 인증서 자동 설정"
    ]
  },

  // E-commerce 스토어
  ecommerce: {
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/commerce",
    features: [
      "Shopify/BigCommerce 연동",
      "상품 검색 및 필터링",
      "장바구니 및 결제",
      "사용자 계정 관리",
      "주문 추적",
      "모바일 최적화"
    ],
    setupTime: "5분",
    customization: {
      theme: "30초로 브랜드 색상 변경",
      products: "CMS에서 즉시 상품 추가",
      payment: "Stripe 연동 2분"
    }
  },

  // 블로그/CMS
  blog: {
    deployUrl: "https://vercel.com/new/clone?repository-url=https://github.com/vercel/next.js/tree/canary/examples/blog",
    features: [
      "Markdown 기반 블로그",
      "SEO 최적화",
      "RSS 피드 자동 생성",
      "댓글 시스템",
      "검색 기능",
      "다크 모드"
    ],
    contentManagement: "Notion, Contentful, 또는 로컬 Markdown"
  }
};
```

### Railway 원클릭 API 서버

```typescript
// railway-api-templates.ts
export const railwayTemplates = {
  // Express.js API 서버
  expressApi: {
    deployUrl: "https://railway.app/template/express-api",
    stack: ["Express.js", "TypeScript", "PostgreSQL", "Redis"],
    features: [
      "RESTful API 엔드포인트",
      "JWT 인증",
      "PostgreSQL 데이터베이스",
      "Redis 캐싱",
      "API 문서 자동 생성",
      "로깅 및 모니터링"
    ],
    deployTime: "3분",
    autoSetup: {
      database: "PostgreSQL 인스턴스 자동 생성",
      environment: "환경 변수 자동 설정",
      ssl: "HTTPS 자동 활성화",
      monitoring: "헬스 체크 자동 설정"
    }
  },

  // FastAPI Python 서버
  fastapi: {
    deployUrl: "https://railway.app/template/fastapi",
    stack: ["FastAPI", "Python 3.11", "PostgreSQL", "Redis"],
    features: [
      "자동 API 문서 (Swagger)",
      "Pydantic 데이터 검증",
      "SQLAlchemy ORM",
      "Celery 백그라운드 작업",
      "JWT 인증",
      "CORS 설정"
    ],
    specialFeatures: {
      aiIntegration: "OpenAI API 연동 준비",
      dataProcessing: "Pandas, NumPy 사전 설치",
      machineLearning: "scikit-learn 포함"
    }
  },

  // GraphQL API
  graphql: {
    deployUrl: "https://railway.app/template/graphql-api",
    stack: ["Apollo Server", "GraphQL", "Prisma", "PostgreSQL"],
    features: [
      "GraphQL Playground",
      "실시간 구독",
      "데이터베이스 관계 자동 해결",
      "타입 안전성",
      "쿼리 최적화",
      "인증 및 권한 관리"
    ]
  }
};
```

### Netlify JAMstack 템플릿

```typescript
// netlify-jamstack-templates.ts
export const netlifyTemplates = {
  // Gatsby 정적 사이트
  gatsby: {
    deployUrl: "https://app.netlify.com/start/deploy?repository=https://github.com/gatsbyjs/gatsby-starter-default",
    buildTime: "2분",
    features: [
      "정적 사이트 생성",
      "GraphQL 데이터 레이어",
      "이미지 최적화",
      "PWA 지원",
      "Lighthouse 점수 95+",
      "CDN 자동 배포"
    ],
    cmsIntegration: {
      contentful: "1분 연동",
      sanity: "2분 연동",
      strapi: "3분 연동"
    }
  },

  // Hugo 정적 사이트
  hugo: {
    deployUrl: "https://app.netlify.com/start/deploy?repository=https://github.com/gohugoio/hugo",
    buildTime: "30초",
    features: [
      "매우 빠른 빌드 속도",
      "다국어 지원",
      "테마 시스템",
      "이미지 처리",
      "검색 엔진 최적화",
      "RSS/Sitemap 자동 생성"
    ],
    performance: {
      buildSpeed: "1000+ 페이지 < 1분",
      loadSpeed: "99/100 Lighthouse 점수",
      bandwidth: "최소 대역폭 사용"
    }
  }
};
```

## 도커 기반 원클릭 배포

### Docker Compose 스택

```yaml
# docker-compose.production.yml - 프로덕션 환경
version: '3.8'

services:
  # Next.js 프론트엔드
  frontend:
    image: your-org/frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
    depends_on:
      - backend
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"

  # Express.js 백엔드
  backend:
    image: your-org/backend:latest
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/app
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.yourdomain.com`)"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"

  # PostgreSQL 데이터베이스
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=app
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  # Redis 캐시
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Nginx 리버스 프록시 (Traefik 대안)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

  # 자동 SSL 인증서 (Let's Encrypt)
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@yourdomain.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Traefik 대시보드
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  letsencrypt:
```

### 1분 배포 스크립트

```bash
#!/bin/bash
# deploy.sh - 원클릭 배포 스크립트

set -e

echo "🚀 Starting deployment..."

# 1. 환경 설정 확인
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    echo "📝 Creating template..."
    cat > .env.production << EOF
# Database
POSTGRES_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-jwt-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# External APIs
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-key
EOF
    echo "✅ Please fill in .env.production and run again"
    exit 1
fi

# 2. 도메인 설정
read -p "🌐 Enter your domain (e.g., yourdomain.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo "❌ Domain is required"
    exit 1
fi

# 3. SSL 이메일 설정
read -p "📧 Enter email for SSL certificate: " SSL_EMAIL
if [ -z "$SSL_EMAIL" ]; then
    echo "❌ Email is required for SSL certificate"
    exit 1
fi

# 4. Docker Compose 파일 업데이트
sed -i "s/yourdomain.com/$DOMAIN/g" docker-compose.production.yml
sed -i "s/admin@yourdomain.com/$SSL_EMAIL/g" docker-compose.production.yml

# 5. 이미지 빌드 및 배포
echo "🏗️ Building Docker images..."
docker-compose -f docker-compose.production.yml build

echo "🚀 Starting services..."
docker-compose -f docker-compose.production.yml up -d

# 6. 헬스 체크
echo "🏥 Checking health..."
sleep 10

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# 7. SSL 인증서 상태 확인
echo "🔒 Checking SSL certificate..."
sleep 30  # Let's Encrypt 처리 대기

if curl -f https://$DOMAIN > /dev/null 2>&1; then
    echo "✅ SSL certificate is working"
else
    echo "⚠️ SSL certificate might still be processing"
fi

echo "🎉 Deployment completed!"
echo "🌐 Your app is available at: https://$DOMAIN"
echo "📊 Traefik dashboard: http://$DOMAIN:8080"
echo "💾 To stop: docker-compose -f docker-compose.production.yml down"
```

## 모니터링 및 로깅 자동 설정

### Grafana + Prometheus 스택

```yaml
# monitoring.yml - 모니터링 스택
version: '3.8'

services:
  # Prometheus 메트릭 수집
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    restart: unless-stopped

  # Grafana 대시보드
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/var/lib/grafana/dashboards
      - ./grafana/provisioning:/etc/grafana/provisioning
    restart: unless-stopped

  # 로그 수집 (Loki)
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki.yml:/etc/loki/local-config.yaml
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    restart: unless-stopped

  # 로그 전송 (Promtail)
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
```

### 자동 백업 설정

```bash
#!/bin/bash
# backup.sh - 자동 백업 스크립트

BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
mkdir -p $BACKUP_DIR

# 데이터베이스 백업
echo "📦 Backing up database..."
docker exec postgres pg_dump -U user app > $BACKUP_DIR/database.sql

# 볼륨 데이터 백업
echo "📁 Backing up volumes..."
docker run --rm \
  -v postgres_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/postgres_data.tar.gz -C /data .

docker run --rm \
  -v redis_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/redis_data.tar.gz -C /data .

# 설정 파일 백업
echo "⚙️ Backing up configs..."
cp docker-compose.production.yml $BACKUP_DIR/
cp .env.production $BACKUP_DIR/

# 로그 백업
echo "📜 Backing up logs..."
docker logs frontend > $BACKUP_DIR/frontend.log 2>&1
docker logs backend > $BACKUP_DIR/backend.log 2>&1

# 압축 및 정리
echo "🗜️ Compressing backup..."
cd /backups
tar czf $(date +%Y-%m-%d).tar.gz $(date +%Y-%m-%d)/
rm -rf $(date +%Y-%m-%d)/

# 오래된 백업 삭제 (30일)
find /backups -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup completed: /backups/$(date +%Y-%m-%d).tar.gz"
```

## SuperClaude 배포 자동화 명령어

```bash
# 플랫폼별 즉시 배포
/deploy-template --platform vercel --template saas --domain mydomain.com

# Docker 기반 배포
/deploy-docker --stack "nextjs,express,postgres" --ssl auto --monitoring

# 모니터링 설정
/setup-monitoring --stack "prometheus,grafana" --alerts email

# 백업 자동화
/setup-backup --schedule daily --retention 30days --storage s3

# 헬스 체크 설정
/setup-healthcheck --endpoints "/health,/api/health" --alerts slack

# SSL 인증서 자동 갱신
/setup-ssl --provider letsencrypt --auto-renewal --domain mydomain.com

# 로드 밸런싱 설정
/setup-loadbalancer --instances 3 --strategy round-robin --health-check

# 스케일링 자동화
/setup-autoscaling --cpu-threshold 80% --memory-threshold 85% --max-instances 10

# CI/CD 파이프라인
/setup-cicd --provider github-actions --auto-deploy production

# 보안 스캔 자동화
/setup-security --scan-schedule daily --vulnerability-alerts high
```

## 배포 성공 체크리스트

### 즉시 확인 사항 (5분 내)
- [ ] **앱 접근**: 메인 도메인에서 정상 로딩
- [ ] **API 응답**: 주요 엔드포인트 정상 동작
- [ ] **데이터베이스**: 연결 및 쿼리 정상
- [ ] **SSL**: HTTPS 인증서 활성화
- [ ] **모니터링**: 기본 메트릭 수집 중

### 24시간 내 확인 사항
- [ ] **성능**: 평균 응답시간 < 200ms
- [ ] **가용성**: 99.9% 업타임 유지
- [ ] **보안**: 보안 헤더 및 HTTPS 강제
- [ ] **백업**: 첫 번째 자동 백업 완료
- [ ] **로그**: 에러 로그 모니터링 정상

### 일주일 내 최적화
- [ ] **CDN**: 정적 자산 CDN 연결
- [ ] **캐싱**: Redis 캐시 효과 확인
- [ ] **알림**: 중요 알림 채널 테스트
- [ ] **확장성**: 트래픽 증가 대비책 준비
- [ ] **문서화**: 운영 가이드 완성

즉시 배포 템플릿의 핵심은 **"설정 시간 최소화, 운영 안정성 최대화"**입니다. 복잡한 인프라 설정 없이도 프로덕션 품질의 애플리케이션을 빠르게 배포할 수 있습니다.