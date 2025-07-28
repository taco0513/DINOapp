import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 이미지 최적화 설정
  images: {
    domains: ['lh3.googleusercontent.com'], // Google 프로필 이미지
    formats: ['image/avif', 'image/webp'],
  },
  
  // 국제화 설정
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
  },
  
  // 헤더 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ],
      },
    ]
  },
  
  // 실험적 기능
  experimental: {
    // 서버 컴포넌트 최적화
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  },
  
  // 웹팩 설정
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 번들 크기 최적화
      config.resolve.alias = {
        ...config.resolve.alias,
        '@sentry/node': '@sentry/browser',
      }
    }
    
    return config
  },
  
  // 환경 변수 검증 스킵 (빌드 시)
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
}

// Sentry 설정
const sentryWebpackPluginOptions = {
  // Sentry 조직 및 프로젝트
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // 인증 토큰
  authToken: process.env.SENTRY_AUTH_TOKEN,
  
  // 소스맵 업로드 설정
  silent: true, // 빌드 중 Sentry 로그 숨기기
  hideSourceMaps: true, // 프로덕션에서 소스맵 숨기기
  disableLogger: true, // Sentry 로거 비활성화
  
  // 릴리즈 설정
  release: {
    deploy: {
      env: process.env.NODE_ENV,
    },
  },
}

// Sentry 통합 여부 확인
const shouldIntegrateSentry = 
  process.env.SENTRY_DSN || 
  process.env.NEXT_PUBLIC_SENTRY_DSN

// 조건부 Sentry 통합
export default shouldIntegrateSentry
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig