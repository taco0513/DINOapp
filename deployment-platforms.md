# DINO 배포 플랫폼 옵션

## 1. Docker 컨테이너 배포 (기본 권장)

### 로컬 Docker 실행

```bash
# 이미지 빌드
docker build -t dino-app .

# 컨테이너 실행
docker run -p 3000:3000 \
  -e NEXTAUTH_SECRET="your-secret-key" \
  -e GOOGLE_CLIENT_ID="your-google-client-id" \
  -e GOOGLE_CLIENT_SECRET="your-google-client-secret" \
  -v $(pwd)/prisma/dev.db:/app/prisma/dev.db \
  dino-app

# 또는 docker-compose 사용
docker-compose up -d
```

### Docker Hub 배포

```bash
# 태그 생성 및 푸시
docker tag dino-app your-username/dino-app:latest
docker push your-username/dino-app:latest
```

## 2. Vercel (최고 권장 - Next.js 최적화)

### 설정 파일

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 환경 변수 설정

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (자동 설정됨)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL` (Vercel Postgres 또는 PlanetScale)

### 배포 명령

```bash
npx vercel --prod
```

## 3. Netlify

### netlify.toml 설정

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 배포

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=.next
```

## 4. Railway

### railway.json

```json
{
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300
  }
}
```

### 배포

```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

## 5. Heroku

### Procfile 생성

```
web: npm start
release: npx prisma migrate deploy && npx prisma generate
```

### 배포

```bash
# Heroku CLI 설치 후
heroku create dino-app-prod
heroku config:set NODE_ENV=production
heroku config:set NEXTAUTH_SECRET="your-secret"
git push heroku main
```

## 6. Digital Ocean App Platform

### .do/app.yaml

```yaml
name: dino-app
services:
  - name: web
    source_dir: /
    github:
      repo: your-username/DINOapp
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
databases:
  - engine: PG
    name: db
    num_nodes: 1
    size: db-s-dev-database
    version: '14'
```

## 7. AWS (Elastic Beanstalk/ECS)

### Elastic Beanstalk

```json
// .ebextensions/nodejs.config
{
  "option_settings": [
    {
      "namespace": "aws:elasticbeanstalk:container:nodejs",
      "option_name": "NodeCommand",
      "value": "npm start"
    },
    {
      "namespace": "aws:elasticbeanstalk:application:environment",
      "option_name": "NODE_ENV",
      "value": "production"
    }
  ]
}
```

### ECS (Docker)

```json
// ecs-task-definition.json
{
  "family": "dino-app",
  "containerDefinitions": [
    {
      "name": "dino-app",
      "image": "your-username/dino-app:latest",
      "memory": 512,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ]
    }
  ]
}
```

## 8. Google Cloud Platform

### Cloud Run

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/dino-app', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/dino-app']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      [
        'run',
        'deploy',
        'dino-app',
        '--image',
        'gcr.io/$PROJECT_ID/dino-app',
        '--region',
        'asia-northeast1',
        '--platform',
        'managed',
        '--allow-unauthenticated',
      ]
```

## 성능 비교

| 플랫폼  | 비용       | 성능       | 설정 복잡도 | Next.js 최적화 | 권장도     |
| ------- | ---------- | ---------- | ----------- | -------------- | ---------- |
| Vercel  | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐     | ⭐⭐⭐⭐⭐ |
| Docker  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐      | ⭐⭐⭐⭐       | ⭐⭐⭐⭐   |
| Railway | ⭐⭐⭐     | ⭐⭐⭐⭐   | ⭐⭐⭐⭐    | ⭐⭐⭐         | ⭐⭐⭐⭐   |
| Netlify | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐⭐    | ⭐⭐⭐         | ⭐⭐⭐     |
| Heroku  | ⭐⭐       | ⭐⭐⭐     | ⭐⭐⭐      | ⭐⭐           | ⭐⭐       |

## 권장 배포 전략

1. **개발/테스트**: Docker 로컬 환경
2. **프로덕션**: Vercel (최고 성능 + Next.js 최적화)
3. **대안**: Railway (간편한 설정 + 좋은 성능)
4. **자체 인프라**: Docker + Kubernetes
