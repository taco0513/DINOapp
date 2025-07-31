# 📦 Miscellaneous

> 🤖 이 문서는 자동으로 생성되었습니다. 수정 시 다음 생성에서 덮어쓰여집니다.

## 📚 목차

- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [layout.tsx](#layout-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [page.tsx](#page-tsx)
- [ab-test-manager.ts](#ab-test-manager-ts)
- [documentation-automation.ts](#documentation-automation-ts)
- [workflow-automation.ts](#workflow-automation-ts)
- [vercel.tsx](#vercel-tsx)
- [api-client.ts](#api-client-ts)
- [auth.ts](#auth-ts)
- [automated-backup.ts](#automated-backup-ts)
- [backup-manager.ts](#backup-manager-ts)
- [backup-scheduler.ts](#backup-scheduler-ts)
- [database-backup.ts](#database-backup-ts)
- [file-backup.ts](#file-backup-ts)
- [recovery-manager.ts](#recovery-manager-ts)
- [memory-cache.ts](#memory-cache-ts)
- [calendar.ts](#calendar-ts)
- [environment.ts](#environment-ts)
- [connection-manager.ts](#connection-manager-ts)
- [connection-pool-v2.ts](#connection-pool-v2-ts)
- [connection-pool.ts](#connection-pool-ts)
- [dev-prisma.ts](#dev-prisma-ts)
- [optimized-queries.ts](#optimized-queries-ts)
- [prisma-client.ts](#prisma-client-ts)
- [query-optimizer.ts](#query-optimizer-ts)
- [db-performance.ts](#db-performance-ts)
- [db-utils.ts](#db-utils-ts)
- [parser.ts](#parser-ts)
- [patterns.ts](#patterns-ts)
- [service.ts](#service-ts)
- [email-intelligence.ts](#email-intelligence-ts)
- [error-handler.ts](#error-handler-ts)
- [error-logger.ts](#error-logger-ts)
- [gmail-analytics.ts](#gmail-analytics-ts)
- [gmail-middleware.ts](#gmail-middleware-ts)
- [gmail.ts](#gmail-ts)
- [i18n.ts](#i18n-ts)
- [performance.ts](#performance-ts)
- [alerts-v2.ts](#alerts-v2-ts)
- [alerts.ts](#alerts-ts)
- [logger.ts](#logger-ts)
- [metrics-collector-v2.ts](#metrics-collector-v2-ts)
- [metrics-collector.ts](#metrics-collector-ts)
- [monitoring-init.ts](#monitoring-init-ts)
- [sentry.ts](#sentry-ts)
- [monitoring.ts](#monitoring-ts)
- [alert-manager.ts](#alert-manager-ts)
- [visa-alerts.ts](#visa-alerts-ts)
- [notifications.ts](#notifications-ts)
- [offline-api-client.ts](#offline-api-client-ts)
- [offline-storage.ts](#offline-storage-ts)
- [api-cache.ts](#api-cache-ts)
- [database-optimizer.ts](#database-optimizer-ts)
- [dynamic-imports.ts](#dynamic-imports-ts)
- [resource-optimization.ts](#resource-optimization-ts)
- [prisma.ts](#prisma-ts)
- [schengen-calculator.ts](#schengen-calculator-ts)
- [api-security.ts](#api-security-ts)
- [auth-middleware.ts](#auth-middleware-ts)
- [auth-security.ts](#auth-security-ts)
- [csrf-protection.ts](#csrf-protection-ts)
- [env-validator.ts](#env-validator-ts)
- [input-sanitizer.ts](#input-sanitizer-ts)
- [input-validation.ts](#input-validation-ts)
- [rate-limiter.ts](#rate-limiter-ts)
- [security.ts](#security-ts)
- [travel-manager.ts](#travel-manager-ts)
- [utils.ts](#utils-ts)
- [visa-requirements.ts](#visa-requirements-ts)
- [email.ts](#email-ts)
- [global.ts](#global-ts)
- [gmail.ts](#gmail-ts)
- [gtag.d.ts](#gtag-d-ts)
- [next-auth.d.ts](#next-auth-d-ts)
- [notification.ts](#notification-ts)

## page.tsx

**파일 경로:** `app/(dashboard)/integrations/page.tsx`

**파일 정보:**

- 📏 크기: 25827 bytes
- 📄 라인 수: 687
- 🔧 함수: 9개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `IntegrationsPage`

### 🔧 Functions

#### `WireframeGmailAnalyzer`

#### `startAnalysis`

**특성:** `async`

#### `WireframeCalendarSync`

#### `startSync`

**특성:** `async`

#### `IntegrationsPage`

#### `checkConnections`

**특성:** `async`

#### `handleGmailAnalysisComplete`

#### `handleCalendarSyncComplete`

#### `resetFlow`

### 🔗 Interfaces

#### `ConnectionStatus`

#### `IntegrationStats`

## page.tsx

**파일 경로:** `app/admin/analytics/page.tsx`

**파일 정보:**

- 📏 크기: 915 bytes
- 📄 라인 수: 32
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `metadata`
- `async`

### 🔧 Functions

#### `AdminAnalyticsPage`

**특성:** `async`

## page.tsx

**파일 경로:** `app/admin/backup/page.tsx`

**파일 정보:**

- 📏 크기: 14684 bytes
- 📄 라인 수: 436
- 🔧 함수: 4개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `BackupManagement`

### 🔧 Functions

#### `BackupManagement`

#### `fetchBackupInfo`

**특성:** `async`

#### `createBackup`

**특성:** `async`

#### `testRecovery`

**특성:** `async`

### 🔗 Interfaces

#### `BackupInfo`

## page.tsx

**파일 경로:** `app/admin/metrics/page.tsx`

**파일 정보:**

- 📏 크기: 1014 bytes
- 📄 라인 수: 37
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `metadata`
- `async`

### 🔧 Functions

#### `AdminMetricsPage`

**특성:** `async`

## page.tsx

**파일 경로:** `app/admin/monitoring/page.tsx`

**파일 정보:**

- 📏 크기: 20671 bytes
- 📄 라인 수: 611
- 🔧 함수: 6개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 4개

**Exports:**

- `MonitoringDashboard`

### 🔧 Functions

#### `MonitoringDashboard`

#### `fetchHealth`

**특성:** `async`

#### `fetchMetrics`

**특성:** `async`

#### `fetchLogs`

**특성:** `async`

#### `checkAlerts`

#### `loadData`

**특성:** `async`

### 🔗 Interfaces

#### `HealthCheck`

#### `MetricsData`

#### `LogEntry`

#### `LogsData`

## page.tsx

**파일 경로:** `app/admin/performance/page.tsx`

**파일 정보:**

- 📏 크기: 925 bytes
- 📄 라인 수: 32
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `metadata`
- `async`

### 🔧 Functions

#### `AdminPerformancePage`

**특성:** `async`

## page.tsx

**파일 경로:** `app/ai/page.tsx`

**파일 정보:**

- 📏 크기: 4392 bytes
- 📄 라인 수: 128
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `AIPage`

### 🔧 Functions

#### `AIPage`

## page.tsx

**파일 경로:** `app/analytics/page.tsx`

**파일 정보:**

- 📏 크기: 8812 bytes
- 📄 라인 수: 222
- 🔧 함수: 2개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `AnalyticsPage`

### 🔧 Functions

#### `AnalyticsPage`

#### `loadStats`

**특성:** `async`

## page.tsx

**파일 경로:** `app/auth/error/page.tsx`

**파일 정보:**

- 📏 크기: 4698 bytes
- 📄 라인 수: 163
- 🔧 함수: 3개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `AuthErrorPage`

### 🔧 Functions

#### `AuthErrorContent`

#### `getErrorMessage`

#### `AuthErrorPage`

## page.tsx

**파일 경로:** `app/auth/signin/page.tsx`

**파일 정보:**

- 📏 크기: 5252 bytes
- 📄 라인 수: 192
- 🔧 함수: 3개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `SignInPage`

### 🔧 Functions

#### `SignInContent`

#### `handleGoogleSignIn`

**특성:** `async`

#### `SignInPage`

## page.tsx

**파일 경로:** `app/billing/success/page.tsx`

**파일 정보:**

- 📏 크기: 4272 bytes
- 📄 라인 수: 136
- 🔧 함수: 2개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `metadata`
- `BillingSuccessPage`

### 🔧 Functions

#### `BillingSuccessPage`

#### `getPlanName`

### 🔗 Interfaces

#### `PageProps`

## page.tsx

**파일 경로:** `app/calendar/page.tsx`

**파일 정보:**

- 📏 크기: 21503 bytes
- 📄 라인 수: 548
- 🔧 함수: 4개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `CalendarPage`

### 🔧 Functions

#### `CalendarPage`

#### `loadTravelInfos`

**특성:** `async`

#### `loadCalendarStats`

**특성:** `async`

#### `handleSyncComplete`

### 🔗 Interfaces

#### `CalendarStats`

## page.tsx

**파일 경로:** `app/dashboard/monitoring/page.tsx`

**파일 정보:**

- 📏 크기: 3923 bytes
- 📄 라인 수: 108
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `metadata`
- `async`

### 🔧 Functions

#### `MonitoringPage`

**특성:** `async`

## page.tsx

**파일 경로:** `app/dashboard/page.tsx`

**파일 정보:**

- 📏 크기: 9016 bytes
- 📄 라인 수: 269
- 🔧 함수: 3개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `DashboardPage`

### 🔧 Functions

#### `DashboardPage`

#### `loadDashboardData`

**특성:** `async`

#### `handleLogout`

**특성:** `async`

## page.tsx

**파일 경로:** `app/gmail/page.tsx`

**파일 정보:**

- 📏 크기: 19375 bytes
- 📄 라인 수: 485
- 🔧 함수: 4개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `GmailPage`

### 🔧 Functions

#### `WireframeGmailIntegration`

#### `checkConnection`

**특성:** `async`

#### `analyzeTravelEmails`

**특성:** `async`

#### `GmailPage`

## layout.tsx

**파일 경로:** `app/layout.tsx`

**파일 정보:**

- 📏 크기: 9563 bytes
- 📄 라인 수: 274
- 🔧 함수: 3개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `viewport`
- `metadata`
- `RootLayout`

### 🔧 Functions

#### `RootLayout`

#### `gtag`

#### `preloadCritical`

## page.tsx

**파일 경로:** `app/legal/faq/page.tsx`

**파일 정보:**

- 📏 크기: 6905 bytes
- 📄 라인 수: 207
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `metadata`
- `FAQ`

### 🔧 Functions

#### `FAQ`

## page.tsx

**파일 경로:** `app/legal/privacy/page.tsx`

**파일 정보:**

- 📏 크기: 11135 bytes
- 📄 라인 수: 251
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `metadata`
- `PrivacyPolicy`

### 🔧 Functions

#### `PrivacyPolicy`

## page.tsx

**파일 경로:** `app/legal/terms/page.tsx`

**파일 정보:**

- 📏 크기: 5564 bytes
- 📄 라인 수: 140
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `metadata`
- `TermsOfService`

### 🔧 Functions

#### `TermsOfService`

## page.tsx

**파일 경로:** `app/logout/page.tsx`

**파일 정보:**

- 📏 크기: 1271 bytes
- 📄 라인 수: 48
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `LogoutPage`

### 🔧 Functions

#### `LogoutPage`

## page.tsx

**파일 경로:** `app/monitoring/page.tsx`

**파일 정보:**

- 📏 크기: 15786 bytes
- 📄 라인 수: 474
- 🔧 함수: 7개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `MonitoringPage`

### 🔧 Functions

#### `SimpleChart`

#### `MetricCard`

#### `getStatusColor`

#### `MonitoringPage`

#### `loadMonitoringData`

**특성:** `async`

#### `formatUptime`

#### `formatBytes`

### 🔗 Interfaces

#### `SystemMetrics`

#### `MonitoringData`

## page.tsx

**파일 경로:** `app/notifications/page.tsx`

**파일 정보:**

- 📏 크기: 23275 bytes
- 📄 라인 수: 672
- 🔧 함수: 12개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `NotificationsPage`

### 🔧 Functions

#### `WireframeNotificationList`

#### `loadNotifications`

#### `markAsRead`

#### `markAllAsRead`

#### `deleteNotification`

#### `getNotificationIcon`

#### `formatTime`

#### `WireframeNotificationSettings`

#### `handleSave`

**특성:** `async`

#### `handleRequestPermission`

**특성:** `async`

#### `NotificationsPage`

#### `handleSaveSettings`

**특성:** `async`

## page.tsx

**파일 경로:** `app/offline/page.tsx`

**파일 정보:**

- 📏 크기: 4129 bytes
- 📄 라인 수: 134
- 🔧 함수: 5개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `OfflinePage`

### 🔧 Functions

#### `OfflinePage`

#### `updateOnlineStatus`

#### `getLastSync`

#### `handleRetry`

#### `handleViewCached`

## page.tsx

**파일 경로:** `app/page.tsx`

**파일 정보:**

- 📏 크기: 2272 bytes
- 📄 라인 수: 80
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `HomePage`

### 🔧 Functions

#### `HomePage`

## page.tsx

**파일 경로:** `app/pricing/page.tsx`

**파일 정보:**

- 📏 크기: 3344 bytes
- 📄 라인 수: 93
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `metadata`
- `PricingPage`

### 🔧 Functions

#### `PricingPage`

## page.tsx

**파일 경로:** `app/schengen/page.tsx`

**파일 정보:**

- 📏 크기: 7788 bytes
- 📄 라인 수: 217
- 🔧 함수: 2개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `SchengenPage`

### 🔧 Functions

#### `SchengenPage`

#### `loadSchengenData`

**특성:** `async`

## page.tsx

**파일 경로:** `app/simple/page.tsx`

**파일 정보:**

- 📏 크기: 6773 bytes
- 📄 라인 수: 184
- 🔧 함수: 2개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `SimplePage`

### 🔧 Functions

#### `SimplePage`

#### `handleExport`

## page.tsx

**파일 경로:** `app/trips/page.tsx`

**파일 정보:**

- 📏 크기: 8027 bytes
- 📄 라인 수: 244
- 🔧 함수: 8개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `TripsPage`

### 🔧 Functions

#### `TripsPage`

#### `loadTrips`

**특성:** `async`

#### `handleAddTrip`

#### `handleEditTrip`

#### `handleFormSuccess`

**특성:** `async`

#### `handleFormCancel`

#### `handleDeleteTrip`

**특성:** `async`

#### `getFilteredTrips`

## page.tsx

**파일 경로:** `app/visa-check/page.tsx`

**파일 정보:**

- 📏 크기: 2777 bytes
- 📄 라인 수: 77
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `VisaCheckPage`

### 🔧 Functions

#### `VisaCheckPage`

## ab-test-manager.ts

**파일 경로:** `lib/ab-testing/ab-test-manager.ts`

**파일 정보:**

- 📏 크기: 7612 bytes
- 📄 라인 수: 317
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 3개

**Exports:**

- `ABTest`
- `ABVariant`
- `ABTestResult`
- `ABTestManager`
- `export`

### 📦 Classes

#### `ABTestManager`

**특성:** `exported`

### 🔗 Interfaces

#### `ABTest`

**특성:** `exported`

#### `ABVariant`

**특성:** `exported`

#### `ABTestResult`

**특성:** `exported`

## documentation-automation.ts

**파일 경로:** `lib/ai/documentation-automation.ts`

**파일 정보:**

- 📏 크기: 11120 bytes
- 📄 라인 수: 364
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `DocumentationContext`
- `GeneratedDocumentation`
- `DocumentationAutomation`
- `documentationEngine`

### 📦 Classes

#### `DocumentationAutomation`

**특성:** `exported`

### 🔗 Interfaces

#### `DocumentationContext`

**특성:** `exported`

#### `GeneratedDocumentation`

**특성:** `exported`

## workflow-automation.ts

**파일 경로:** `lib/ai/workflow-automation.ts`

**파일 정보:**

- 📏 크기: 7959 bytes
- 📄 라인 수: 307
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 4개

**Exports:**

- `WorkflowTrigger`
- `WorkflowAction`
- `AutomatedWorkflow`
- `WorkflowResult`
- `WorkflowAutomationEngine`
- `workflowEngine`

### 📦 Classes

#### `WorkflowAutomationEngine`

**특성:** `exported`

### 🔗 Interfaces

#### `WorkflowTrigger`

**특성:** `exported`

#### `WorkflowAction`

**특성:** `exported`

#### `AutomatedWorkflow`

**특성:** `exported`

#### `WorkflowResult`

**특성:** `exported`

## vercel.tsx

**파일 경로:** `lib/analytics/vercel.tsx`

**파일 정보:**

- 📏 크기: 3286 bytes
- 📄 라인 수: 108
- 🔧 함수: 4개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `trackEvent`
- `trackPageView`
- `trackingEvents`
- `AnalyticsWrapper`
- `reportWebVitals`
- `performanceThresholds`

### 🔧 Functions

#### `trackEvent`

**특성:** `exported`

#### `trackPageView`

**특성:** `exported`

#### `AnalyticsWrapper`

**특성:** `exported`

#### `reportWebVitals`

**특성:** `exported`

## api-client.ts

**파일 경로:** `lib/api-client.ts`

**파일 정보:**

- 📏 크기: 9022 bytes
- 📄 라인 수: 326
- 🔧 함수: 3개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `ApiResponse`
- `TripFormData`
- `ApiClient`
- `async`
- `formatApiDate`
- `parseApiDate`

### 🔧 Functions

#### `handleApiError`

**특성:** `exported`, `async`

#### `formatApiDate`

**특성:** `exported`

#### `parseApiDate`

**특성:** `exported`

### 📦 Classes

#### `ApiClient`

**특성:** `exported`

### 🔗 Interfaces

#### `ApiResponse`

**특성:** `exported`

#### `TripFormData`

**특성:** `exported`

## auth.ts

**파일 경로:** `lib/auth.ts`

**설명:** PURPOSE: NextAuth.js 인증 설정 - Google OAuth 2.0 전용

**파일 정보:**

- 📏 크기: 4576 bytes
- 📄 라인 수: 175
- 🔧 함수: 0개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `authOptions`

## automated-backup.ts

**파일 경로:** `lib/backup/automated-backup.ts`

**파일 정보:**

- 📏 크기: 7144 bytes
- 📄 라인 수: 268
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `AutomatedBackupService`
- `backupService`

### 📦 Classes

#### `AutomatedBackupService`

**특성:** `exported`

### 🔗 Interfaces

#### `BackupConfig`

## backup-manager.ts

**파일 경로:** `lib/backup/backup-manager.ts`

**설명:** Database Backup and Recovery System
데이터베이스 백업 및 복구 시스템

**파일 정보:**

- 📏 크기: 11028 bytes
- 📄 라인 수: 403
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 3개

**Exports:**

- `backupManager`
- `type`

### 📦 Classes

#### `BackupManager`

### 🔗 Interfaces

#### `BackupMetadata`

#### `BackupOptions`

#### `RestoreOptions`

## backup-scheduler.ts

**파일 경로:** `lib/backup/backup-scheduler.ts`

**설명:** Backup Scheduler
Manages automated backup schedules

**파일 정보:**

- 📏 크기: 10156 bytes
- 📄 라인 수: 396
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `BackupSchedule`
- `BackupScheduler`
- `backupScheduler`

### 📦 Classes

#### `BackupScheduler`

**특성:** `exported`

### 🔗 Interfaces

#### `BackupSchedule`

**특성:** `exported`

## database-backup.ts

**파일 경로:** `lib/backup/database-backup.ts`

**설명:** Database Backup Management System
Handles automated database backups with versioning

**파일 정보:**

- 📏 크기: 10365 bytes
- 📄 라인 수: 394
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `BackupOptions`
- `BackupResult`
- `DatabaseBackupManager`
- `dbBackupManager`

### 📦 Classes

#### `DatabaseBackupManager`

**특성:** `exported`

### 🔗 Interfaces

#### `BackupOptions`

**특성:** `exported`

#### `BackupResult`

**특성:** `exported`

## file-backup.ts

**파일 경로:** `lib/backup/file-backup.ts`

**설명:** File System Backup Management
Handles backup of uploaded files and static assets

**파일 정보:**

- 📏 크기: 12627 bytes
- 📄 라인 수: 483
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `FileBackupOptions`
- `FileBackupResult`
- `FileBackupManager`
- `fileBackupManager`

### 📦 Classes

#### `FileBackupManager`

**특성:** `exported`

### 🔗 Interfaces

#### `FileBackupOptions`

**특성:** `exported`

#### `FileBackupResult`

**특성:** `exported`

## recovery-manager.ts

**파일 경로:** `lib/backup/recovery-manager.ts`

**설명:** Disaster Recovery Manager
Coordinates backup and recovery operations

**파일 정보:**

- 📏 크기: 15683 bytes
- 📄 라인 수: 519
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 1개
- 🔗 인터페이스: 3개

**Exports:**

- `RecoveryScenario`
- `RecoveryPlan`
- `RecoveryStep`
- `RecoveryResult`
- `DisasterRecoveryManager`
- `recoveryManager`

### 📦 Classes

#### `DisasterRecoveryManager`

**특성:** `exported`

### 🔗 Interfaces

#### `RecoveryPlan`

**특성:** `exported`

#### `RecoveryStep`

**특성:** `exported`

#### `RecoveryResult`

**특성:** `exported`

### 🏷️ Types

- `RecoveryScenario` (exported)

## memory-cache.ts

**파일 경로:** `lib/cache/memory-cache.ts`

**설명:** In-memory cache implementation with TTL support
Optimized for DiNoCal's 5-minute caching strategy

**파일 정보:**

- 📏 크기: 4376 bytes
- 📄 라인 수: 209
- 🔧 함수: 1개
- 📦 클래스: 1개
- 🏷️ 타입: 1개
- 🔗 인터페이스: 1개

**Exports:**

- `memoryCache`
- `async`
- `generateCacheKey`
- `CacheKeys`
- `CacheKeyType`

### 🔧 Functions

#### `generateCacheKey`

In-memory cache implementation with TTL support
Optimized for DiNoCal's 5-minute caching strategy
/

interface CacheItem<T> {
data: T
expiry: number
created: number
}

class MemoryCache {
private cache = new Map<string, CacheItem<any>>()
private readonly defaultTTL = 5 _ 60 _ 1000 // 5 minutes in milliseconds
private cleanupInterval: NodeJS.Timeout

constructor() {
// Cleanup expired items every minute
this.cleanupInterval = setInterval(() => {
this.cleanup()
}, 60 \* 1000)
}

/\*\*
Store data in cache with optional TTL
/
set<T>(key: string, data: T, ttl?: number): void {
const expiry = Date.now() + (ttl || this.defaultTTL)
this.cache.set(key, {
data,
expiry,
created: Date.now()
})
}

/\*\*
Retrieve data from cache
/
get<T>(key: string): T | null {
const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data as T

}

/\*\*
Check if key exists and is not expired
/
has(key: string): boolean {
const item = this.cache.get(key)

    if (!item) {
      return false
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }

    return true

}

/\*\*
Delete a specific key
/
delete(key: string): boolean {
return this.cache.delete(key)
}

/\*\*
Clear all cache
/
clear(): void {
this.cache.clear()
}

/\*\*
Get cache statistics
/
getStats() {
const now = Date.now()
let validItems = 0
let expiredItems = 0

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expiredItems++
      } else {
        validItems++
      }
    }

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
      hitRate: validItems / (validItems + expiredItems) || 0
    }

}

/\*\*
Remove expired items
/
private cleanup(): void {
const now = Date.now()
const keysToDelete: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))

}

/\*\*
Cleanup interval when done
/
destroy(): void {
if (this.cleanupInterval) {
clearInterval(this.cleanupInterval)
}
this.clear()
}
}

// Singleton instance
export const memoryCache = new MemoryCache()

/\*\*
Cache wrapper function for async operations
/
export async function withCache<T>(
key: string,
fetcher: () => Promise<T>,
ttl?: number
): Promise<T> {
// Try to get from cache first
const cached = memoryCache.get<T>(key)
if (cached !== null) {
return cached
}

// Fetch data and cache it
const data = await fetcher()
memoryCache.set(key, data, ttl)

return data
}

/\*\*
Generate cache key for API calls

**특성:** `exported`

### 📦 Classes

#### `MemoryCache`

### 🔗 Interfaces

#### `CacheItem`

In-memory cache implementation with TTL support
Optimized for DiNoCal's 5-minute caching strategy

### 🏷️ Types

- `CacheKeyType` (exported)

## calendar.ts

**파일 경로:** `lib/calendar.ts`

**설명:** Google Calendar API 통합 라이브러리
Gmail에서 추출한 여행 정보를 Google Calendar에 동기화

**파일 정보:**

- 📏 크기: 11124 bytes
- 📄 라인 수: 419
- 🔧 함수: 8개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `CalendarEvent`
- `TravelCalendarEvent`
- `createCalendarClient`
- `async`
- `createTravelEvents`

### 🔧 Functions

#### `createCalendarClient`

Google Calendar API 통합 라이브러리
Gmail에서 추출한 여행 정보를 Google Calendar에 동기화
/

import { google } from 'googleapis'
import { TravelInfo } from './gmail'
import { normalizeDateString } from './email-intelligence'

export interface CalendarEvent {
id?: string
summary: string
description?: string
start: {
dateTime?: string
date?: string
timeZone?: string
}
end: {
dateTime?: string
date?: string
timeZone?: string
}
location?: string
attendees?: { email: string }[]
reminders?: {
useDefault?: boolean
overrides?: Array<{
method: 'email' | 'popup'
minutes: number
}>
}
colorId?: string
source?: {
title: string
url: string
}
}

export interface TravelCalendarEvent extends CalendarEvent {
travelType: 'departure' | 'return' | 'stay'
flightNumber?: string
bookingReference?: string
confidence: number
originalEmailId: string
}

/\*\*
Google Calendar API 클라이언트 생성

**특성:** `exported`

#### `checkCalendarConnection`

Google Calendar API 통합 라이브러리
Gmail에서 추출한 여행 정보를 Google Calendar에 동기화
/

import { google } from 'googleapis'
import { TravelInfo } from './gmail'
import { normalizeDateString } from './email-intelligence'

export interface CalendarEvent {
id?: string
summary: string
description?: string
start: {
dateTime?: string
date?: string
timeZone?: string
}
end: {
dateTime?: string
date?: string
timeZone?: string
}
location?: string
attendees?: { email: string }[]
reminders?: {
useDefault?: boolean
overrides?: Array<{
method: 'email' | 'popup'
minutes: number
}>
}
colorId?: string
source?: {
title: string
url: string
}
}

export interface TravelCalendarEvent extends CalendarEvent {
travelType: 'departure' | 'return' | 'stay'
flightNumber?: string
bookingReference?: string
confidence: number
originalEmailId: string
}

/\*\*
Google Calendar API 클라이언트 생성
/
export function createCalendarClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.calendar({ version: 'v3', auth: oauth2Client })
}

/\*\*
Calendar API 연결 상태 확인

**특성:** `exported`, `async`

#### `getUserCalendars`

Google Calendar API 통합 라이브러리
Gmail에서 추출한 여행 정보를 Google Calendar에 동기화
/

import { google } from 'googleapis'
import { TravelInfo } from './gmail'
import { normalizeDateString } from './email-intelligence'

export interface CalendarEvent {
id?: string
summary: string
description?: string
start: {
dateTime?: string
date?: string
timeZone?: string
}
end: {
dateTime?: string
date?: string
timeZone?: string
}
location?: string
attendees?: { email: string }[]
reminders?: {
useDefault?: boolean
overrides?: Array<{
method: 'email' | 'popup'
minutes: number
}>
}
colorId?: string
source?: {
title: string
url: string
}
}

export interface TravelCalendarEvent extends CalendarEvent {
travelType: 'departure' | 'return' | 'stay'
flightNumber?: string
bookingReference?: string
confidence: number
originalEmailId: string
}

/\*\*
Google Calendar API 클라이언트 생성
/
export function createCalendarClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.calendar({ version: 'v3', auth: oauth2Client })
}

/\*\*
Calendar API 연결 상태 확인
/
export async function checkCalendarConnection(accessToken: string): Promise<boolean> {
try {
const calendar = createCalendarClient(accessToken)

    // 캘린더 목록 요청으로 연결 테스트
    await calendar.calendarList.list({
      maxResults: 1
    })

    return true

} catch (error) {
// Calendar connection failed
return false
}
}

/\*\*
사용자의 캘린더 목록 가져오기

**특성:** `exported`, `async`

#### `createTravelEvents`

Google Calendar API 통합 라이브러리
Gmail에서 추출한 여행 정보를 Google Calendar에 동기화
/

import { google } from 'googleapis'
import { TravelInfo } from './gmail'
import { normalizeDateString } from './email-intelligence'

export interface CalendarEvent {
id?: string
summary: string
description?: string
start: {
dateTime?: string
date?: string
timeZone?: string
}
end: {
dateTime?: string
date?: string
timeZone?: string
}
location?: string
attendees?: { email: string }[]
reminders?: {
useDefault?: boolean
overrides?: Array<{
method: 'email' | 'popup'
minutes: number
}>
}
colorId?: string
source?: {
title: string
url: string
}
}

export interface TravelCalendarEvent extends CalendarEvent {
travelType: 'departure' | 'return' | 'stay'
flightNumber?: string
bookingReference?: string
confidence: number
originalEmailId: string
}

/\*\*
Google Calendar API 클라이언트 생성
/
export function createCalendarClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.calendar({ version: 'v3', auth: oauth2Client })
}

/\*\*
Calendar API 연결 상태 확인
/
export async function checkCalendarConnection(accessToken: string): Promise<boolean> {
try {
const calendar = createCalendarClient(accessToken)

    // 캘린더 목록 요청으로 연결 테스트
    await calendar.calendarList.list({
      maxResults: 1
    })

    return true

} catch (error) {
// Calendar connection failed
return false
}
}

/\*\*
사용자의 캘린더 목록 가져오기
/
export async function getUserCalendars(accessToken: string) {
try {
const calendar = createCalendarClient(accessToken)

    const response = await calendar.calendarList.list({
      maxResults: 50
    })

    return response.data.items?.map(cal => ({
      id: cal.id || '',
      name: cal.summary || '',
      description: cal.description,
      primary: cal.primary || false,
      accessRole: cal.accessRole,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor
    })) || []

} catch (error) {
// Error fetching calendars
throw new Error('캘린더 목록을 가져오는 중 오류가 발생했습니다.')
}
}

/\*\*
여행 정보를 기반으로 캘린더 이벤트 생성

**특성:** `exported`

#### `createCalendarEvent`

Google Calendar API 통합 라이브러리
Gmail에서 추출한 여행 정보를 Google Calendar에 동기화
/

import { google } from 'googleapis'
import { TravelInfo } from './gmail'
import { normalizeDateString } from './email-intelligence'

export interface CalendarEvent {
id?: string
summary: string
description?: string
start: {
dateTime?: string
date?: string
timeZone?: string
}
end: {
dateTime?: string
date?: string
timeZone?: string
}
location?: string
attendees?: { email: string }[]
reminders?: {
useDefault?: boolean
overrides?: Array<{
method: 'email' | 'popup'
minutes: number
}>
}
colorId?: string
source?: {
title: string
url: string
}
}

export interface TravelCalendarEvent extends CalendarEvent {
travelType: 'departure' | 'return' | 'stay'
flightNumber?: string
bookingReference?: string
confidence: number
originalEmailId: string
}

/\*\*
Google Calendar API 클라이언트 생성
/
export function createCalendarClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.calendar({ version: 'v3', auth: oauth2Client })
}

/\*\*
Calendar API 연결 상태 확인
/
export async function checkCalendarConnection(accessToken: string): Promise<boolean> {
try {
const calendar = createCalendarClient(accessToken)

    // 캘린더 목록 요청으로 연결 테스트
    await calendar.calendarList.list({
      maxResults: 1
    })

    return true

} catch (error) {
// Calendar connection failed
return false
}
}

/\*\*
사용자의 캘린더 목록 가져오기
/
export async function getUserCalendars(accessToken: string) {
try {
const calendar = createCalendarClient(accessToken)

    const response = await calendar.calendarList.list({
      maxResults: 50
    })

    return response.data.items?.map(cal => ({
      id: cal.id || '',
      name: cal.summary || '',
      description: cal.description,
      primary: cal.primary || false,
      accessRole: cal.accessRole,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor
    })) || []

} catch (error) {
// Error fetching calendars
throw new Error('캘린더 목록을 가져오는 중 오류가 발생했습니다.')
}
}

/\*\*
여행 정보를 기반으로 캘린더 이벤트 생성
/
export function createTravelEvents(travelInfo: TravelInfo): TravelCalendarEvent[] {
const events: TravelCalendarEvent[] = []
const airportCodes = {
'ICN': '인천국제공항', 'GMP': '김포국제공항', 'CJU': '제주국제공항',
'NRT': '나리타국제공항', 'HND': '하네다공항', 'LAX': '로스앤젤레스국제공항'
// 더 많은 공항 코드 매핑은 travel-patterns.ts에서 가져올 수 있음
}

// 출발 이벤트
if (travelInfo.departureDate) {
const departureDate = normalizeDateString(travelInfo.departureDate)

    if (departureDate) {
      const departureLocation = travelInfo.departure ?
        (airportCodes[travelInfo.departure as keyof typeof airportCodes] || travelInfo.departure) :
        '출발지'

      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'

      events.push({
        summary: `✈️ ${destinationLocation} 출발`,
        description: [
          `항공편: ${travelInfo.flightNumber || '미상'}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          `출발지: ${departureLocation}`,
          `목적지: ${destinationLocation}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: departureDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: departureDate,
          timeZone: 'Asia/Seoul'
        },
        location: departureLocation,
        colorId: '11', // 빨간색 (출발)
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 }, // 1일 전
            { method: 'popup', minutes: 2 * 60 },  // 2시간 전
            { method: 'email', minutes: 24 * 60 }  // 1일 전 이메일
          ]
        },
        travelType: 'departure',
        flightNumber: travelInfo.flightNumber,
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }

}

// 귀국 이벤트
if (travelInfo.returnDate) {
const returnDate = normalizeDateString(travelInfo.returnDate)

    if (returnDate) {
      const departureLocation = travelInfo.departure ?
        (airportCodes[travelInfo.departure as keyof typeof airportCodes] || travelInfo.departure) :
        '출발지'

      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'

      events.push({
        summary: `🏠 ${departureLocation} 귀국`,
        description: [
          `항공편: ${travelInfo.flightNumber || '미상'}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          `출발지: ${destinationLocation}`,
          `도착지: ${departureLocation}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: returnDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: returnDate,
          timeZone: 'Asia/Seoul'
        },
        location: destinationLocation,
        colorId: '10', // 초록색 (귀국)
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 }, // 1일 전
            { method: 'popup', minutes: 2 * 60 },  // 2시간 전
          ]
        },
        travelType: 'return',
        flightNumber: travelInfo.flightNumber,
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }

}

// 숙박 기간 이벤트 (호텔이 있고 출발일과 귀국일이 모두 있는 경우)
if (travelInfo.hotelName && travelInfo.departureDate && travelInfo.returnDate) {
const depDate = normalizeDateString(travelInfo.departureDate)
const retDate = normalizeDateString(travelInfo.returnDate)

    if (depDate && retDate) {
      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'

      events.push({
        summary: `🏨 ${travelInfo.hotelName}`,
        description: [
          `호텔: ${travelInfo.hotelName}`,
          `위치: ${destinationLocation}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: depDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: retDate,
          timeZone: 'Asia/Seoul'
        },
        location: `${travelInfo.hotelName}, ${destinationLocation}`,
        colorId: '9', // 파란색 (숙박)
        travelType: 'stay',
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }

}

return events
}

/\*\*
캘린더에 이벤트 생성

**특성:** `exported`, `async`

#### `syncTravelToCalendar`

Google Calendar API 통합 라이브러리
Gmail에서 추출한 여행 정보를 Google Calendar에 동기화
/

import { google } from 'googleapis'
import { TravelInfo } from './gmail'
import { normalizeDateString } from './email-intelligence'

export interface CalendarEvent {
id?: string
summary: string
description?: string
start: {
dateTime?: string
date?: string
timeZone?: string
}
end: {
dateTime?: string
date?: string
timeZone?: string
}
location?: string
attendees?: { email: string }[]
reminders?: {
useDefault?: boolean
overrides?: Array<{
method: 'email' | 'popup'
minutes: number
}>
}
colorId?: string
source?: {
title: string
url: string
}
}

export interface TravelCalendarEvent extends CalendarEvent {
travelType: 'departure' | 'return' | 'stay'
flightNumber?: string
bookingReference?: string
confidence: number
originalEmailId: string
}

/\*\*
Google Calendar API 클라이언트 생성
/
export function createCalendarClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.calendar({ version: 'v3', auth: oauth2Client })
}

/\*\*
Calendar API 연결 상태 확인
/
export async function checkCalendarConnection(accessToken: string): Promise<boolean> {
try {
const calendar = createCalendarClient(accessToken)

    // 캘린더 목록 요청으로 연결 테스트
    await calendar.calendarList.list({
      maxResults: 1
    })

    return true

} catch (error) {
// Calendar connection failed
return false
}
}

/\*\*
사용자의 캘린더 목록 가져오기
/
export async function getUserCalendars(accessToken: string) {
try {
const calendar = createCalendarClient(accessToken)

    const response = await calendar.calendarList.list({
      maxResults: 50
    })

    return response.data.items?.map(cal => ({
      id: cal.id || '',
      name: cal.summary || '',
      description: cal.description,
      primary: cal.primary || false,
      accessRole: cal.accessRole,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor
    })) || []

} catch (error) {
// Error fetching calendars
throw new Error('캘린더 목록을 가져오는 중 오류가 발생했습니다.')
}
}

/\*\*
여행 정보를 기반으로 캘린더 이벤트 생성
/
export function createTravelEvents(travelInfo: TravelInfo): TravelCalendarEvent[] {
const events: TravelCalendarEvent[] = []
const airportCodes = {
'ICN': '인천국제공항', 'GMP': '김포국제공항', 'CJU': '제주국제공항',
'NRT': '나리타국제공항', 'HND': '하네다공항', 'LAX': '로스앤젤레스국제공항'
// 더 많은 공항 코드 매핑은 travel-patterns.ts에서 가져올 수 있음
}

// 출발 이벤트
if (travelInfo.departureDate) {
const departureDate = normalizeDateString(travelInfo.departureDate)

    if (departureDate) {
      const departureLocation = travelInfo.departure ?
        (airportCodes[travelInfo.departure as keyof typeof airportCodes] || travelInfo.departure) :
        '출발지'

      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'

      events.push({
        summary: `✈️ ${destinationLocation} 출발`,
        description: [
          `항공편: ${travelInfo.flightNumber || '미상'}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          `출발지: ${departureLocation}`,
          `목적지: ${destinationLocation}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: departureDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: departureDate,
          timeZone: 'Asia/Seoul'
        },
        location: departureLocation,
        colorId: '11', // 빨간색 (출발)
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 }, // 1일 전
            { method: 'popup', minutes: 2 * 60 },  // 2시간 전
            { method: 'email', minutes: 24 * 60 }  // 1일 전 이메일
          ]
        },
        travelType: 'departure',
        flightNumber: travelInfo.flightNumber,
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }

}

// 귀국 이벤트
if (travelInfo.returnDate) {
const returnDate = normalizeDateString(travelInfo.returnDate)

    if (returnDate) {
      const departureLocation = travelInfo.departure ?
        (airportCodes[travelInfo.departure as keyof typeof airportCodes] || travelInfo.departure) :
        '출발지'

      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'

      events.push({
        summary: `🏠 ${departureLocation} 귀국`,
        description: [
          `항공편: ${travelInfo.flightNumber || '미상'}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          `출발지: ${destinationLocation}`,
          `도착지: ${departureLocation}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: returnDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: returnDate,
          timeZone: 'Asia/Seoul'
        },
        location: destinationLocation,
        colorId: '10', // 초록색 (귀국)
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 }, // 1일 전
            { method: 'popup', minutes: 2 * 60 },  // 2시간 전
          ]
        },
        travelType: 'return',
        flightNumber: travelInfo.flightNumber,
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }

}

// 숙박 기간 이벤트 (호텔이 있고 출발일과 귀국일이 모두 있는 경우)
if (travelInfo.hotelName && travelInfo.departureDate && travelInfo.returnDate) {
const depDate = normalizeDateString(travelInfo.departureDate)
const retDate = normalizeDateString(travelInfo.returnDate)

    if (depDate && retDate) {
      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'

      events.push({
        summary: `🏨 ${travelInfo.hotelName}`,
        description: [
          `호텔: ${travelInfo.hotelName}`,
          `위치: ${destinationLocation}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: depDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: retDate,
          timeZone: 'Asia/Seoul'
        },
        location: `${travelInfo.hotelName}, ${destinationLocation}`,
        colorId: '9', // 파란색 (숙박)
        travelType: 'stay',
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }

}

return events
}

/\*\*
캘린더에 이벤트 생성
/
export async function createCalendarEvent(
accessToken: string,
calendarId: string,
event: TravelCalendarEvent
): Promise<string | null> {
try {
const calendar = createCalendarClient(accessToken)

    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        reminders: event.reminders,
        colorId: event.colorId,
        source: event.source
      }
    })

    return response.data.id || null

} catch (error) {
// Error creating calendar event
throw new Error('캘린더 이벤트 생성 중 오류가 발생했습니다.')
}
}

/\*\*
여행 정보를 캘린더에 동기화

**특성:** `exported`, `async`

#### `findExistingTravelEvents`

Google Calendar API 통합 라이브러리
Gmail에서 추출한 여행 정보를 Google Calendar에 동기화
/

import { google } from 'googleapis'
import { TravelInfo } from './gmail'
import { normalizeDateString } from './email-intelligence'

export interface CalendarEvent {
id?: string
summary: string
description?: string
start: {
dateTime?: string
date?: string
timeZone?: string
}
end: {
dateTime?: string
date?: string
timeZone?: string
}
location?: string
attendees?: { email: string }[]
reminders?: {
useDefault?: boolean
overrides?: Array<{
method: 'email' | 'popup'
minutes: number
}>
}
colorId?: string
source?: {
title: string
url: string
}
}

export interface TravelCalendarEvent extends CalendarEvent {
travelType: 'departure' | 'return' | 'stay'
flightNumber?: string
bookingReference?: string
confidence: number
originalEmailId: string
}

/\*\*
Google Calendar API 클라이언트 생성
/
export function createCalendarClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.calendar({ version: 'v3', auth: oauth2Client })
}

/\*\*
Calendar API 연결 상태 확인
/
export async function checkCalendarConnection(accessToken: string): Promise<boolean> {
try {
const calendar = createCalendarClient(accessToken)

    // 캘린더 목록 요청으로 연결 테스트
    await calendar.calendarList.list({
      maxResults: 1
    })

    return true

} catch (error) {
// Calendar connection failed
return false
}
}

/\*\*
사용자의 캘린더 목록 가져오기
/
export async function getUserCalendars(accessToken: string) {
try {
const calendar = createCalendarClient(accessToken)

    const response = await calendar.calendarList.list({
      maxResults: 50
    })

    return response.data.items?.map(cal => ({
      id: cal.id || '',
      name: cal.summary || '',
      description: cal.description,
      primary: cal.primary || false,
      accessRole: cal.accessRole,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor
    })) || []

} catch (error) {
// Error fetching calendars
throw new Error('캘린더 목록을 가져오는 중 오류가 발생했습니다.')
}
}

/\*\*
여행 정보를 기반으로 캘린더 이벤트 생성
/
export function createTravelEvents(travelInfo: TravelInfo): TravelCalendarEvent[] {
const events: TravelCalendarEvent[] = []
const airportCodes = {
'ICN': '인천국제공항', 'GMP': '김포국제공항', 'CJU': '제주국제공항',
'NRT': '나리타국제공항', 'HND': '하네다공항', 'LAX': '로스앤젤레스국제공항'
// 더 많은 공항 코드 매핑은 travel-patterns.ts에서 가져올 수 있음
}

// 출발 이벤트
if (travelInfo.departureDate) {
const departureDate = normalizeDateString(travelInfo.departureDate)

    if (departureDate) {
      const departureLocation = travelInfo.departure ?
        (airportCodes[travelInfo.departure as keyof typeof airportCodes] || travelInfo.departure) :
        '출발지'

      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'

      events.push({
        summary: `✈️ ${destinationLocation} 출발`,
        description: [
          `항공편: ${travelInfo.flightNumber || '미상'}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          `출발지: ${departureLocation}`,
          `목적지: ${destinationLocation}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: departureDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: departureDate,
          timeZone: 'Asia/Seoul'
        },
        location: departureLocation,
        colorId: '11', // 빨간색 (출발)
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 }, // 1일 전
            { method: 'popup', minutes: 2 * 60 },  // 2시간 전
            { method: 'email', minutes: 24 * 60 }  // 1일 전 이메일
          ]
        },
        travelType: 'departure',
        flightNumber: travelInfo.flightNumber,
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }

}

// 귀국 이벤트
if (travelInfo.returnDate) {
const returnDate = normalizeDateString(travelInfo.returnDate)

    if (returnDate) {
      const departureLocation = travelInfo.departure ?
        (airportCodes[travelInfo.departure as keyof typeof airportCodes] || travelInfo.departure) :
        '출발지'

      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'

      events.push({
        summary: `🏠 ${departureLocation} 귀국`,
        description: [
          `항공편: ${travelInfo.flightNumber || '미상'}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          `출발지: ${destinationLocation}`,
          `도착지: ${departureLocation}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: returnDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: returnDate,
          timeZone: 'Asia/Seoul'
        },
        location: destinationLocation,
        colorId: '10', // 초록색 (귀국)
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 }, // 1일 전
            { method: 'popup', minutes: 2 * 60 },  // 2시간 전
          ]
        },
        travelType: 'return',
        flightNumber: travelInfo.flightNumber,
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }

}

// 숙박 기간 이벤트 (호텔이 있고 출발일과 귀국일이 모두 있는 경우)
if (travelInfo.hotelName && travelInfo.departureDate && travelInfo.returnDate) {
const depDate = normalizeDateString(travelInfo.departureDate)
const retDate = normalizeDateString(travelInfo.returnDate)

    if (depDate && retDate) {
      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'

      events.push({
        summary: `🏨 ${travelInfo.hotelName}`,
        description: [
          `호텔: ${travelInfo.hotelName}`,
          `위치: ${destinationLocation}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: depDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: retDate,
          timeZone: 'Asia/Seoul'
        },
        location: `${travelInfo.hotelName}, ${destinationLocation}`,
        colorId: '9', // 파란색 (숙박)
        travelType: 'stay',
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }

}

return events
}

/\*\*
캘린더에 이벤트 생성
/
export async function createCalendarEvent(
accessToken: string,
calendarId: string,
event: TravelCalendarEvent
): Promise<string | null> {
try {
const calendar = createCalendarClient(accessToken)

    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        reminders: event.reminders,
        colorId: event.colorId,
        source: event.source
      }
    })

    return response.data.id || null

} catch (error) {
// Error creating calendar event
throw new Error('캘린더 이벤트 생성 중 오류가 발생했습니다.')
}
}

/\*\*
여행 정보를 캘린더에 동기화
/
export async function syncTravelToCalendar(
accessToken: string,
calendarId: string,
travelInfos: TravelInfo[]
): Promise<{
success: boolean
created: number
errors: string[]
eventIds: string[]
}> {
const result = {
success: true,
created: 0,
errors: [] as string[],
eventIds: [] as string[]
}

try {
for (const travelInfo of travelInfos) {
// 신뢰도가 낮은 여행 정보는 건너뛰기
if (travelInfo.confidence < 0.4) {
result.errors.push(`낮은 신뢰도로 인해 건너뜀: ${travelInfo.subject} (${Math.round(travelInfo.confidence * 100)}%)`)
continue
}

      const events = createTravelEvents(travelInfo)

      for (const event of events) {
        try {
          const eventId = await createCalendarEvent(accessToken, calendarId, event)
          if (eventId) {
            result.eventIds.push(eventId)
            result.created++
          }
        } catch (error) {
          result.success = false
          result.errors.push(`이벤트 생성 실패: ${event.summary} - ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
        }
      }
    }

} catch (error) {
result.success = false
result.errors.push(`동기화 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
}

return result
}

/\*\*
기존 여행 이벤트 검색 (중복 방지)

**특성:** `exported`, `async`

#### `deleteCalendarEvent`

Google Calendar API 통합 라이브러리
Gmail에서 추출한 여행 정보를 Google Calendar에 동기화
/

import { google } from 'googleapis'
import { TravelInfo } from './gmail'
import { normalizeDateString } from './email-intelligence'

export interface CalendarEvent {
id?: string
summary: string
description?: string
start: {
dateTime?: string
date?: string
timeZone?: string
}
end: {
dateTime?: string
date?: string
timeZone?: string
}
location?: string
attendees?: { email: string }[]
reminders?: {
useDefault?: boolean
overrides?: Array<{
method: 'email' | 'popup'
minutes: number
}>
}
colorId?: string
source?: {
title: string
url: string
}
}

export interface TravelCalendarEvent extends CalendarEvent {
travelType: 'departure' | 'return' | 'stay'
flightNumber?: string
bookingReference?: string
confidence: number
originalEmailId: string
}

/\*\*
Google Calendar API 클라이언트 생성
/
export function createCalendarClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.calendar({ version: 'v3', auth: oauth2Client })
}

/\*\*
Calendar API 연결 상태 확인
/
export async function checkCalendarConnection(accessToken: string): Promise<boolean> {
try {
const calendar = createCalendarClient(accessToken)

    // 캘린더 목록 요청으로 연결 테스트
    await calendar.calendarList.list({
      maxResults: 1
    })

    return true

} catch (error) {
// Calendar connection failed
return false
}
}

/\*\*
사용자의 캘린더 목록 가져오기
/
export async function getUserCalendars(accessToken: string) {
try {
const calendar = createCalendarClient(accessToken)

    const response = await calendar.calendarList.list({
      maxResults: 50
    })

    return response.data.items?.map(cal => ({
      id: cal.id || '',
      name: cal.summary || '',
      description: cal.description,
      primary: cal.primary || false,
      accessRole: cal.accessRole,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor
    })) || []

} catch (error) {
// Error fetching calendars
throw new Error('캘린더 목록을 가져오는 중 오류가 발생했습니다.')
}
}

/\*\*
여행 정보를 기반으로 캘린더 이벤트 생성
/
export function createTravelEvents(travelInfo: TravelInfo): TravelCalendarEvent[] {
const events: TravelCalendarEvent[] = []
const airportCodes = {
'ICN': '인천국제공항', 'GMP': '김포국제공항', 'CJU': '제주국제공항',
'NRT': '나리타국제공항', 'HND': '하네다공항', 'LAX': '로스앤젤레스국제공항'
// 더 많은 공항 코드 매핑은 travel-patterns.ts에서 가져올 수 있음
}

// 출발 이벤트
if (travelInfo.departureDate) {
const departureDate = normalizeDateString(travelInfo.departureDate)

    if (departureDate) {
      const departureLocation = travelInfo.departure ?
        (airportCodes[travelInfo.departure as keyof typeof airportCodes] || travelInfo.departure) :
        '출발지'

      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'

      events.push({
        summary: `✈️ ${destinationLocation} 출발`,
        description: [
          `항공편: ${travelInfo.flightNumber || '미상'}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          `출발지: ${departureLocation}`,
          `목적지: ${destinationLocation}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: departureDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: departureDate,
          timeZone: 'Asia/Seoul'
        },
        location: departureLocation,
        colorId: '11', // 빨간색 (출발)
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 }, // 1일 전
            { method: 'popup', minutes: 2 * 60 },  // 2시간 전
            { method: 'email', minutes: 24 * 60 }  // 1일 전 이메일
          ]
        },
        travelType: 'departure',
        flightNumber: travelInfo.flightNumber,
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }

}

// 귀국 이벤트
if (travelInfo.returnDate) {
const returnDate = normalizeDateString(travelInfo.returnDate)

    if (returnDate) {
      const departureLocation = travelInfo.departure ?
        (airportCodes[travelInfo.departure as keyof typeof airportCodes] || travelInfo.departure) :
        '출발지'

      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'

      events.push({
        summary: `🏠 ${departureLocation} 귀국`,
        description: [
          `항공편: ${travelInfo.flightNumber || '미상'}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          `출발지: ${destinationLocation}`,
          `도착지: ${departureLocation}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: returnDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: returnDate,
          timeZone: 'Asia/Seoul'
        },
        location: destinationLocation,
        colorId: '10', // 초록색 (귀국)
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 }, // 1일 전
            { method: 'popup', minutes: 2 * 60 },  // 2시간 전
          ]
        },
        travelType: 'return',
        flightNumber: travelInfo.flightNumber,
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }

}

// 숙박 기간 이벤트 (호텔이 있고 출발일과 귀국일이 모두 있는 경우)
if (travelInfo.hotelName && travelInfo.departureDate && travelInfo.returnDate) {
const depDate = normalizeDateString(travelInfo.departureDate)
const retDate = normalizeDateString(travelInfo.returnDate)

    if (depDate && retDate) {
      const destinationLocation = travelInfo.destination ?
        (airportCodes[travelInfo.destination as keyof typeof airportCodes] || travelInfo.destination) :
        '목적지'

      events.push({
        summary: `🏨 ${travelInfo.hotelName}`,
        description: [
          `호텔: ${travelInfo.hotelName}`,
          `위치: ${destinationLocation}`,
          `예약번호: ${travelInfo.bookingReference || '미상'}`,
          ``,
          `📧 Gmail에서 자동 추출됨`,
          `신뢰도: ${Math.round(travelInfo.confidence * 100)}%`
        ].join('\\n'),
        start: {
          date: depDate,
          timeZone: 'Asia/Seoul'
        },
        end: {
          date: retDate,
          timeZone: 'Asia/Seoul'
        },
        location: `${travelInfo.hotelName}, ${destinationLocation}`,
        colorId: '9', // 파란색 (숙박)
        travelType: 'stay',
        bookingReference: travelInfo.bookingReference,
        confidence: travelInfo.confidence,
        originalEmailId: travelInfo.emailId
      })
    }

}

return events
}

/\*\*
캘린더에 이벤트 생성
/
export async function createCalendarEvent(
accessToken: string,
calendarId: string,
event: TravelCalendarEvent
): Promise<string | null> {
try {
const calendar = createCalendarClient(accessToken)

    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        location: event.location,
        reminders: event.reminders,
        colorId: event.colorId,
        source: event.source
      }
    })

    return response.data.id || null

} catch (error) {
// Error creating calendar event
throw new Error('캘린더 이벤트 생성 중 오류가 발생했습니다.')
}
}

/\*\*
여행 정보를 캘린더에 동기화
/
export async function syncTravelToCalendar(
accessToken: string,
calendarId: string,
travelInfos: TravelInfo[]
): Promise<{
success: boolean
created: number
errors: string[]
eventIds: string[]
}> {
const result = {
success: true,
created: 0,
errors: [] as string[],
eventIds: [] as string[]
}

try {
for (const travelInfo of travelInfos) {
// 신뢰도가 낮은 여행 정보는 건너뛰기
if (travelInfo.confidence < 0.4) {
result.errors.push(`낮은 신뢰도로 인해 건너뜀: ${travelInfo.subject} (${Math.round(travelInfo.confidence * 100)}%)`)
continue
}

      const events = createTravelEvents(travelInfo)

      for (const event of events) {
        try {
          const eventId = await createCalendarEvent(accessToken, calendarId, event)
          if (eventId) {
            result.eventIds.push(eventId)
            result.created++
          }
        } catch (error) {
          result.success = false
          result.errors.push(`이벤트 생성 실패: ${event.summary} - ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
        }
      }
    }

} catch (error) {
result.success = false
result.errors.push(`동기화 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
}

return result
}

/\*\*
기존 여행 이벤트 검색 (중복 방지)
/
export async function findExistingTravelEvents(
accessToken: string,
calendarId: string,
emailId: string
): Promise<CalendarEvent[]> {
try {
const calendar = createCalendarClient(accessToken)

    // 최근 6개월 범위에서 검색
    const timeMin = new Date()
    timeMin.setMonth(timeMin.getMonth() - 6)

    const timeMax = new Date()
    timeMax.setMonth(timeMax.getMonth() + 6)

    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      q: emailId, // 이벤트 설명에서 emailId 검색
      maxResults: 100
    })

    return response.data.items?.filter(event =>
      event.description?.includes(emailId)
    ).map(event => ({
      id: event.id || undefined,
      summary: event.summary || '',
      description: event.description || undefined,
      start: {
        dateTime: event.start?.dateTime || undefined,
        date: event.start?.date || undefined,
        timeZone: event.start?.timeZone || undefined
      },
      end: {
        dateTime: event.end?.dateTime || undefined,
        date: event.end?.date || undefined,
        timeZone: event.end?.timeZone || undefined
      },
      location: event.location || undefined
    })) || []

} catch (error) {
// Error finding existing events
return []
}
}

/\*\*
캘린더 이벤트 삭제

**특성:** `exported`, `async`

### 🔗 Interfaces

#### `CalendarEvent`

**특성:** `exported`

#### `TravelCalendarEvent`

**특성:** `exported`

## environment.ts

**파일 경로:** `lib/config/environment.ts`

**설명:** Environment configuration for DiNoCal
Handles development, staging, and production environments

**파일 정보:**

- 📏 크기: 5324 bytes
- 📄 라인 수: 195
- 🔧 함수: 5개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `env`
- `validateEnvironment`
- `getDatabaseConfig`
- `getCacheConfig`
- `getRateLimitConfig`
- `getSecurityConfig`
- `config`

### 🔧 Functions

#### `validateEnvironment`

Environment configuration for DiNoCal
Handles development, staging, and production environments
/

export const env = {
// Environment detection
NODE_ENV: process.env.NODE_ENV || 'development',
isDevelopment: process.env.NODE_ENV === 'development',
isProduction: process.env.NODE_ENV === 'production',
isTest: process.env.NODE_ENV === 'test',

// Database
DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

// NextAuth
NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',

// Google OAuth
GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

// Gmail API
GMAIL_CREDENTIALS_PATH: process.env.GMAIL_CREDENTIALS_PATH || '',
GMAIL_TOKEN_PATH: process.env.GMAIL_TOKEN_PATH || '',

// Public features
ENABLE_GMAIL_INTEGRATION: process.env.NEXT_PUBLIC_ENABLE_GMAIL_INTEGRATION === 'true',
ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',

// API Configuration
API_RATE_LIMIT_REQUESTS: parseInt(process.env.API_RATE_LIMIT_REQUESTS || '100'),
API_RATE_LIMIT_WINDOW: parseInt(process.env.API_RATE_LIMIT_WINDOW || '60000'),

// Cache Configuration
CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS || '300'),
ENABLE_REDIS_CACHE: process.env.ENABLE_REDIS_CACHE === 'true',
REDIS_URL: process.env.REDIS_URL || '',

// Security
ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '2592000'), // 30 days

// Monitoring
ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
SENTRY_DSN: process.env.SENTRY_DSN || '',

// Logging
LOG_LEVEL: process.env.LOG_LEVEL || 'info'
} as const

/\*\*
Validate required environment variables

**특성:** `exported`

#### `getDatabaseConfig`

Environment configuration for DiNoCal
Handles development, staging, and production environments
/

export const env = {
// Environment detection
NODE_ENV: process.env.NODE_ENV || 'development',
isDevelopment: process.env.NODE_ENV === 'development',
isProduction: process.env.NODE_ENV === 'production',
isTest: process.env.NODE_ENV === 'test',

// Database
DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

// NextAuth
NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',

// Google OAuth
GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

// Gmail API
GMAIL_CREDENTIALS_PATH: process.env.GMAIL_CREDENTIALS_PATH || '',
GMAIL_TOKEN_PATH: process.env.GMAIL_TOKEN_PATH || '',

// Public features
ENABLE_GMAIL_INTEGRATION: process.env.NEXT_PUBLIC_ENABLE_GMAIL_INTEGRATION === 'true',
ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',

// API Configuration
API_RATE_LIMIT_REQUESTS: parseInt(process.env.API_RATE_LIMIT_REQUESTS || '100'),
API_RATE_LIMIT_WINDOW: parseInt(process.env.API_RATE_LIMIT_WINDOW || '60000'),

// Cache Configuration
CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS || '300'),
ENABLE_REDIS_CACHE: process.env.ENABLE_REDIS_CACHE === 'true',
REDIS_URL: process.env.REDIS_URL || '',

// Security
ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '2592000'), // 30 days

// Monitoring
ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
SENTRY_DSN: process.env.SENTRY_DSN || '',

// Logging
LOG_LEVEL: process.env.LOG_LEVEL || 'info'
} as const

/\*\*
Validate required environment variables
/
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
const errors: string[] = []

// Required in production
if (env.isProduction) {
if (!env.NEXTAUTH_SECRET) {
errors.push('NEXTAUTH_SECRET is required in production')
}

    if (!env.GOOGLE_CLIENT_ID) {
      errors.push('GOOGLE_CLIENT_ID is required')
    }

    if (!env.GOOGLE_CLIENT_SECRET) {
      errors.push('GOOGLE_CLIENT_SECRET is required')
    }

    if (!env.DATABASE_URL) {
      errors.push('DATABASE_URL is required')
    }

    if (env.ENABLE_GMAIL_INTEGRATION && !env.GMAIL_CREDENTIALS_PATH) {
      errors.push('GMAIL_CREDENTIALS_PATH is required when Gmail integration is enabled')
    }

}

// Always required
if (!env.NEXTAUTH_URL) {
errors.push('NEXTAUTH_URL is required')
}

return {
isValid: errors.length === 0,
errors
}
}

/\*\*
Get database configuration based on environment

**특성:** `exported`

#### `getCacheConfig`

Environment configuration for DiNoCal
Handles development, staging, and production environments
/

export const env = {
// Environment detection
NODE_ENV: process.env.NODE_ENV || 'development',
isDevelopment: process.env.NODE_ENV === 'development',
isProduction: process.env.NODE_ENV === 'production',
isTest: process.env.NODE_ENV === 'test',

// Database
DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

// NextAuth
NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',

// Google OAuth
GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

// Gmail API
GMAIL_CREDENTIALS_PATH: process.env.GMAIL_CREDENTIALS_PATH || '',
GMAIL_TOKEN_PATH: process.env.GMAIL_TOKEN_PATH || '',

// Public features
ENABLE_GMAIL_INTEGRATION: process.env.NEXT_PUBLIC_ENABLE_GMAIL_INTEGRATION === 'true',
ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',

// API Configuration
API_RATE_LIMIT_REQUESTS: parseInt(process.env.API_RATE_LIMIT_REQUESTS || '100'),
API_RATE_LIMIT_WINDOW: parseInt(process.env.API_RATE_LIMIT_WINDOW || '60000'),

// Cache Configuration
CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS || '300'),
ENABLE_REDIS_CACHE: process.env.ENABLE_REDIS_CACHE === 'true',
REDIS_URL: process.env.REDIS_URL || '',

// Security
ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '2592000'), // 30 days

// Monitoring
ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
SENTRY_DSN: process.env.SENTRY_DSN || '',

// Logging
LOG_LEVEL: process.env.LOG_LEVEL || 'info'
} as const

/\*\*
Validate required environment variables
/
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
const errors: string[] = []

// Required in production
if (env.isProduction) {
if (!env.NEXTAUTH_SECRET) {
errors.push('NEXTAUTH_SECRET is required in production')
}

    if (!env.GOOGLE_CLIENT_ID) {
      errors.push('GOOGLE_CLIENT_ID is required')
    }

    if (!env.GOOGLE_CLIENT_SECRET) {
      errors.push('GOOGLE_CLIENT_SECRET is required')
    }

    if (!env.DATABASE_URL) {
      errors.push('DATABASE_URL is required')
    }

    if (env.ENABLE_GMAIL_INTEGRATION && !env.GMAIL_CREDENTIALS_PATH) {
      errors.push('GMAIL_CREDENTIALS_PATH is required when Gmail integration is enabled')
    }

}

// Always required
if (!env.NEXTAUTH_URL) {
errors.push('NEXTAUTH_URL is required')
}

return {
isValid: errors.length === 0,
errors
}
}

/\*\*
Get database configuration based on environment
/
export function getDatabaseConfig() {
if (env.isProduction) {
return {
url: env.DATABASE_URL,
// Production optimizations
connectionLimit: 20,
idleTimeout: 30000,
acquireTimeout: 60000,
ssl: env.DATABASE_URL.includes('postgresql') ? { rejectUnauthorized: false } : false
}
}

return {
url: env.DATABASE_URL,
connectionLimit: 5,
idleTimeout: 10000
}
}

/\*\*
Get cache configuration

**특성:** `exported`

#### `getRateLimitConfig`

Environment configuration for DiNoCal
Handles development, staging, and production environments
/

export const env = {
// Environment detection
NODE_ENV: process.env.NODE_ENV || 'development',
isDevelopment: process.env.NODE_ENV === 'development',
isProduction: process.env.NODE_ENV === 'production',
isTest: process.env.NODE_ENV === 'test',

// Database
DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

// NextAuth
NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',

// Google OAuth
GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

// Gmail API
GMAIL_CREDENTIALS_PATH: process.env.GMAIL_CREDENTIALS_PATH || '',
GMAIL_TOKEN_PATH: process.env.GMAIL_TOKEN_PATH || '',

// Public features
ENABLE_GMAIL_INTEGRATION: process.env.NEXT_PUBLIC_ENABLE_GMAIL_INTEGRATION === 'true',
ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',

// API Configuration
API_RATE_LIMIT_REQUESTS: parseInt(process.env.API_RATE_LIMIT_REQUESTS || '100'),
API_RATE_LIMIT_WINDOW: parseInt(process.env.API_RATE_LIMIT_WINDOW || '60000'),

// Cache Configuration
CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS || '300'),
ENABLE_REDIS_CACHE: process.env.ENABLE_REDIS_CACHE === 'true',
REDIS_URL: process.env.REDIS_URL || '',

// Security
ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '2592000'), // 30 days

// Monitoring
ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
SENTRY_DSN: process.env.SENTRY_DSN || '',

// Logging
LOG_LEVEL: process.env.LOG_LEVEL || 'info'
} as const

/\*\*
Validate required environment variables
/
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
const errors: string[] = []

// Required in production
if (env.isProduction) {
if (!env.NEXTAUTH_SECRET) {
errors.push('NEXTAUTH_SECRET is required in production')
}

    if (!env.GOOGLE_CLIENT_ID) {
      errors.push('GOOGLE_CLIENT_ID is required')
    }

    if (!env.GOOGLE_CLIENT_SECRET) {
      errors.push('GOOGLE_CLIENT_SECRET is required')
    }

    if (!env.DATABASE_URL) {
      errors.push('DATABASE_URL is required')
    }

    if (env.ENABLE_GMAIL_INTEGRATION && !env.GMAIL_CREDENTIALS_PATH) {
      errors.push('GMAIL_CREDENTIALS_PATH is required when Gmail integration is enabled')
    }

}

// Always required
if (!env.NEXTAUTH_URL) {
errors.push('NEXTAUTH_URL is required')
}

return {
isValid: errors.length === 0,
errors
}
}

/\*\*
Get database configuration based on environment
/
export function getDatabaseConfig() {
if (env.isProduction) {
return {
url: env.DATABASE_URL,
// Production optimizations
connectionLimit: 20,
idleTimeout: 30000,
acquireTimeout: 60000,
ssl: env.DATABASE_URL.includes('postgresql') ? { rejectUnauthorized: false } : false
}
}

return {
url: env.DATABASE_URL,
connectionLimit: 5,
idleTimeout: 10000
}
}

/\*_
Get cache configuration
/
export function getCacheConfig() {
return {
ttl: env.CACHE_TTL_SECONDS _ 1000, // Convert to milliseconds
useRedis: env.ENABLE_REDIS_CACHE && env.isProduction,
redisUrl: env.REDIS_URL,
memoryLimit: env.isProduction ? 100 : 50, // MB
cleanupInterval: 60000 // 1 minute
}
}

/\*\*
Get API rate limiting configuration

**특성:** `exported`

#### `getSecurityConfig`

Environment configuration for DiNoCal
Handles development, staging, and production environments
/

export const env = {
// Environment detection
NODE_ENV: process.env.NODE_ENV || 'development',
isDevelopment: process.env.NODE_ENV === 'development',
isProduction: process.env.NODE_ENV === 'production',
isTest: process.env.NODE_ENV === 'test',

// Database
DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',

// NextAuth
NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',

// Google OAuth
GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

// Gmail API
GMAIL_CREDENTIALS_PATH: process.env.GMAIL_CREDENTIALS_PATH || '',
GMAIL_TOKEN_PATH: process.env.GMAIL_TOKEN_PATH || '',

// Public features
ENABLE_GMAIL_INTEGRATION: process.env.NEXT_PUBLIC_ENABLE_GMAIL_INTEGRATION === 'true',
ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',

// API Configuration
API_RATE_LIMIT_REQUESTS: parseInt(process.env.API_RATE_LIMIT_REQUESTS || '100'),
API_RATE_LIMIT_WINDOW: parseInt(process.env.API_RATE_LIMIT_WINDOW || '60000'),

// Cache Configuration
CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS || '300'),
ENABLE_REDIS_CACHE: process.env.ENABLE_REDIS_CACHE === 'true',
REDIS_URL: process.env.REDIS_URL || '',

// Security
ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '2592000'), // 30 days

// Monitoring
ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
SENTRY_DSN: process.env.SENTRY_DSN || '',

// Logging
LOG_LEVEL: process.env.LOG_LEVEL || 'info'
} as const

/\*\*
Validate required environment variables
/
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
const errors: string[] = []

// Required in production
if (env.isProduction) {
if (!env.NEXTAUTH_SECRET) {
errors.push('NEXTAUTH_SECRET is required in production')
}

    if (!env.GOOGLE_CLIENT_ID) {
      errors.push('GOOGLE_CLIENT_ID is required')
    }

    if (!env.GOOGLE_CLIENT_SECRET) {
      errors.push('GOOGLE_CLIENT_SECRET is required')
    }

    if (!env.DATABASE_URL) {
      errors.push('DATABASE_URL is required')
    }

    if (env.ENABLE_GMAIL_INTEGRATION && !env.GMAIL_CREDENTIALS_PATH) {
      errors.push('GMAIL_CREDENTIALS_PATH is required when Gmail integration is enabled')
    }

}

// Always required
if (!env.NEXTAUTH_URL) {
errors.push('NEXTAUTH_URL is required')
}

return {
isValid: errors.length === 0,
errors
}
}

/\*\*
Get database configuration based on environment
/
export function getDatabaseConfig() {
if (env.isProduction) {
return {
url: env.DATABASE_URL,
// Production optimizations
connectionLimit: 20,
idleTimeout: 30000,
acquireTimeout: 60000,
ssl: env.DATABASE_URL.includes('postgresql') ? { rejectUnauthorized: false } : false
}
}

return {
url: env.DATABASE_URL,
connectionLimit: 5,
idleTimeout: 10000
}
}

/\*_
Get cache configuration
/
export function getCacheConfig() {
return {
ttl: env.CACHE_TTL_SECONDS _ 1000, // Convert to milliseconds
useRedis: env.ENABLE_REDIS_CACHE && env.isProduction,
redisUrl: env.REDIS_URL,
memoryLimit: env.isProduction ? 100 : 50, // MB
cleanupInterval: 60000 // 1 minute
}
}

/\*\*
Get API rate limiting configuration
/
export function getRateLimitConfig() {
return {
requests: env.API_RATE_LIMIT_REQUESTS,
window: env.API_RATE_LIMIT_WINDOW,
skipSuccessfulRequests: false,
skipFailedRequests: false,
keyPrefix: 'dinocal:ratelimit:',
// More lenient in development
multiplier: env.isDevelopment ? 10 : 1
}
}

/\*\*
Get security headers configuration

**특성:** `exported`

## connection-manager.ts

**파일 경로:** `lib/database/connection-manager.ts`

**설명:** Database Connection Manager
Handles connection pooling, retry logic, and health monitoring

**파일 정보:**

- 📏 크기: 9853 bytes
- 📄 라인 수: 382
- 🔧 함수: 3개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `ConnectionOptions`
- `ConnectionHealth`
- `DatabaseConnectionManager`
- `dbManager`
- `async`
- `getDbHealth`
- `isDbHealthy`

### 🔧 Functions

#### `getPrismaClient`

**특성:** `exported`, `async`

#### `getDbHealth`

**특성:** `exported`

#### `isDbHealthy`

**특성:** `exported`

### 📦 Classes

#### `DatabaseConnectionManager`

**특성:** `exported`

### 🔗 Interfaces

#### `ConnectionOptions`

**특성:** `exported`

#### `ConnectionHealth`

**특성:** `exported`

## connection-pool-v2.ts

**파일 경로:** `lib/database/connection-pool-v2.ts`

**설명:** Simplified connection pool for testing

**파일 정보:**

- 📏 크기: 6212 bytes
- 📄 라인 수: 238
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `PoolConfig`
- `PoolStats`
- `enum`
- `ConnectionPool`

### 📦 Classes

#### `ConnectionPool`

**특성:** `exported`

### 🔗 Interfaces

#### `PoolConfig`

**특성:** `exported`

#### `PoolStats`

**특성:** `exported`

## connection-pool.ts

**파일 경로:** `lib/database/connection-pool.ts`

**설명:** Database Connection Pool Management for Production
프로덕션 환경을 위한 데이터베이스 연결 풀 관리

**파일 정보:**

- 📏 크기: 4991 bytes
- 📄 라인 수: 199
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `dbPool`
- `prisma`

### 📦 Classes

#### `DatabaseConnectionPool`

### 🔗 Interfaces

#### `ConnectionPoolConfig`

## dev-prisma.ts

**파일 경로:** `lib/database/dev-prisma.ts`

**설명:** Development Prisma Client for SQLite
This file provides a simple Prisma client for local development with SQLite
Enhanced with connection recovery and error handling

**파일 정보:**

- 📏 크기: 1252 bytes
- 📄 라인 수: 35
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `devPrisma`
- `isDevelopment`
- `getPrismaClient`

### 🔧 Functions

#### `getPrismaClient`

**특성:** `exported`, `async`

## optimized-queries.ts

**파일 경로:** `lib/database/optimized-queries.ts`

**파일 정보:**

- 📏 크기: 8585 bytes
- 📄 라인 수: 397
- 🔧 함수: 8개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `TripQueryOptions`
- `SchengenQueryOptions`
- `async`
- `prisma`

### 🔧 Functions

#### `getUserTrips`

Optimized database queries for DiNoCal
Uses proper indexes and query optimization techniques
/

export interface TripQueryOptions {
userId: string
limit?: number
offset?: number
country?: string
visaType?: string
dateFrom?: Date
dateTo?: Date
orderBy?: 'entryDate' | 'createdAt'
orderDirection?: 'asc' | 'desc'
}

export interface SchengenQueryOptions {
userId: string
fromDate?: Date
toDate?: Date
passportCountry?: string
}

/\*\*
Get user trips with optimized filtering and pagination

**특성:** `exported`, `async`

#### `getSchengenTrips`

Optimized database queries for DiNoCal
Uses proper indexes and query optimization techniques
/

export interface TripQueryOptions {
userId: string
limit?: number
offset?: number
country?: string
visaType?: string
dateFrom?: Date
dateTo?: Date
orderBy?: 'entryDate' | 'createdAt'
orderDirection?: 'asc' | 'desc'
}

export interface SchengenQueryOptions {
userId: string
fromDate?: Date
toDate?: Date
passportCountry?: string
}

/\*\*
Get user trips with optimized filtering and pagination
/
export async function getUserTrips(options: TripQueryOptions): Promise<CountryVisit[]> {
const {
userId,
limit = 50,
offset = 0,
country,
visaType,
dateFrom,
dateTo,
orderBy = 'entryDate',
orderDirection = 'desc'
} = options

const where: any = { userId }

// Add filters
if (country) {
where.country = country
}

if (visaType) {
where.visaType = visaType
}

if (dateFrom || dateTo) {
where.entryDate = {}
if (dateFrom) {
where.entryDate.gte = dateFrom
}
if (dateTo) {
where.entryDate.lte = dateTo
}
}

// Use optimized query with proper indexes
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
[orderBy]: orderDirection
},
take: limit,
skip: offset,
select: {
id: true,
userId: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true,
notes: true,
createdAt: true,
updatedAt: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get trips for Schengen calculation (optimized for date ranges)

**특성:** `exported`, `async`

#### `getUserStats`

Optimized database queries for DiNoCal
Uses proper indexes and query optimization techniques
/

export interface TripQueryOptions {
userId: string
limit?: number
offset?: number
country?: string
visaType?: string
dateFrom?: Date
dateTo?: Date
orderBy?: 'entryDate' | 'createdAt'
orderDirection?: 'asc' | 'desc'
}

export interface SchengenQueryOptions {
userId: string
fromDate?: Date
toDate?: Date
passportCountry?: string
}

/\*\*
Get user trips with optimized filtering and pagination
/
export async function getUserTrips(options: TripQueryOptions): Promise<CountryVisit[]> {
const {
userId,
limit = 50,
offset = 0,
country,
visaType,
dateFrom,
dateTo,
orderBy = 'entryDate',
orderDirection = 'desc'
} = options

const where: any = { userId }

// Add filters
if (country) {
where.country = country
}

if (visaType) {
where.visaType = visaType
}

if (dateFrom || dateTo) {
where.entryDate = {}
if (dateFrom) {
where.entryDate.gte = dateFrom
}
if (dateTo) {
where.entryDate.lte = dateTo
}
}

// Use optimized query with proper indexes
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
[orderBy]: orderDirection
},
take: limit,
skip: offset,
select: {
id: true,
userId: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true,
notes: true,
createdAt: true,
updatedAt: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get trips for Schengen calculation (optimized for date ranges)
/
export async function getSchengenTrips(options: SchengenQueryOptions): Promise<CountryVisit[]> {
const { userId, fromDate, toDate, passportCountry } = options

const where: any = {
userId,
country: {
in: getSchengenCountries() // List of Schengen countries
}
}

if (passportCountry) {
where.passportCountry = passportCountry
}

if (fromDate || toDate) {
where.OR = [
// Entry date in range
{
entryDate: {
gte: fromDate,
lte: toDate
}
},
// Exit date in range
{
exitDate: {
gte: fromDate,
lte: toDate
}
},
// Trip spans the entire range
{
AND: [
{ entryDate: { lte: fromDate } },
{
OR: [
{ exitDate: { gte: toDate } },
{ exitDate: null } // Still in country
]
}
]
}
]
}

// Use compound index [userId, entryDate, exitDate]
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
entryDate: 'asc'
},
select: {
id: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get user statistics (optimized aggregation)

**특성:** `exported`, `async`

#### `createMultipleTrips`

Optimized database queries for DiNoCal
Uses proper indexes and query optimization techniques
/

export interface TripQueryOptions {
userId: string
limit?: number
offset?: number
country?: string
visaType?: string
dateFrom?: Date
dateTo?: Date
orderBy?: 'entryDate' | 'createdAt'
orderDirection?: 'asc' | 'desc'
}

export interface SchengenQueryOptions {
userId: string
fromDate?: Date
toDate?: Date
passportCountry?: string
}

/\*\*
Get user trips with optimized filtering and pagination
/
export async function getUserTrips(options: TripQueryOptions): Promise<CountryVisit[]> {
const {
userId,
limit = 50,
offset = 0,
country,
visaType,
dateFrom,
dateTo,
orderBy = 'entryDate',
orderDirection = 'desc'
} = options

const where: any = { userId }

// Add filters
if (country) {
where.country = country
}

if (visaType) {
where.visaType = visaType
}

if (dateFrom || dateTo) {
where.entryDate = {}
if (dateFrom) {
where.entryDate.gte = dateFrom
}
if (dateTo) {
where.entryDate.lte = dateTo
}
}

// Use optimized query with proper indexes
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
[orderBy]: orderDirection
},
take: limit,
skip: offset,
select: {
id: true,
userId: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true,
notes: true,
createdAt: true,
updatedAt: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get trips for Schengen calculation (optimized for date ranges)
/
export async function getSchengenTrips(options: SchengenQueryOptions): Promise<CountryVisit[]> {
const { userId, fromDate, toDate, passportCountry } = options

const where: any = {
userId,
country: {
in: getSchengenCountries() // List of Schengen countries
}
}

if (passportCountry) {
where.passportCountry = passportCountry
}

if (fromDate || toDate) {
where.OR = [
// Entry date in range
{
entryDate: {
gte: fromDate,
lte: toDate
}
},
// Exit date in range
{
exitDate: {
gte: fromDate,
lte: toDate
}
},
// Trip spans the entire range
{
AND: [
{ entryDate: { lte: fromDate } },
{
OR: [
{ exitDate: { gte: toDate } },
{ exitDate: null } // Still in country
]
}
]
}
]
}

// Use compound index [userId, entryDate, exitDate]
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
entryDate: 'asc'
},
select: {
id: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get user statistics (optimized aggregation)
/
export async function getUserStats(userId: string) {
// Use Promise.all for parallel execution
const [
totalTrips,
countriesVisited,
currentTrips,
schengenTrips,
recentTrips
] = await Promise.all([
// Total trips count
prisma.countryVisit.count({
where: { userId }
}),

    // Unique countries count
    prisma.countryVisit.groupBy({
      by: ['country'],
      where: { userId },
      _count: { country: true }
    }),

    // Current ongoing trips
    prisma.countryVisit.count({
      where: {
        userId,
        exitDate: null
      }
    }),

    // Schengen trips in last 180 days
    prisma.countryVisit.count({
      where: {
        userId,
        country: {
          in: getSchengenCountries()
        },
        entryDate: {
          gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        }
      }
    }),

    // Recent trips (last 30 days)
    prisma.countryVisit.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        country: true,
        entryDate: true,
        visaType: true
      }
    })

])

return {
totalTrips,
countriesVisited: countriesVisited.length,
currentTrips,
schengenTrips,
recentTrips
}
}

/\*\*
Bulk operations for better performance

**특성:** `exported`, `async`

#### `searchTrips`

Optimized database queries for DiNoCal
Uses proper indexes and query optimization techniques
/

export interface TripQueryOptions {
userId: string
limit?: number
offset?: number
country?: string
visaType?: string
dateFrom?: Date
dateTo?: Date
orderBy?: 'entryDate' | 'createdAt'
orderDirection?: 'asc' | 'desc'
}

export interface SchengenQueryOptions {
userId: string
fromDate?: Date
toDate?: Date
passportCountry?: string
}

/\*\*
Get user trips with optimized filtering and pagination
/
export async function getUserTrips(options: TripQueryOptions): Promise<CountryVisit[]> {
const {
userId,
limit = 50,
offset = 0,
country,
visaType,
dateFrom,
dateTo,
orderBy = 'entryDate',
orderDirection = 'desc'
} = options

const where: any = { userId }

// Add filters
if (country) {
where.country = country
}

if (visaType) {
where.visaType = visaType
}

if (dateFrom || dateTo) {
where.entryDate = {}
if (dateFrom) {
where.entryDate.gte = dateFrom
}
if (dateTo) {
where.entryDate.lte = dateTo
}
}

// Use optimized query with proper indexes
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
[orderBy]: orderDirection
},
take: limit,
skip: offset,
select: {
id: true,
userId: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true,
notes: true,
createdAt: true,
updatedAt: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get trips for Schengen calculation (optimized for date ranges)
/
export async function getSchengenTrips(options: SchengenQueryOptions): Promise<CountryVisit[]> {
const { userId, fromDate, toDate, passportCountry } = options

const where: any = {
userId,
country: {
in: getSchengenCountries() // List of Schengen countries
}
}

if (passportCountry) {
where.passportCountry = passportCountry
}

if (fromDate || toDate) {
where.OR = [
// Entry date in range
{
entryDate: {
gte: fromDate,
lte: toDate
}
},
// Exit date in range
{
exitDate: {
gte: fromDate,
lte: toDate
}
},
// Trip spans the entire range
{
AND: [
{ entryDate: { lte: fromDate } },
{
OR: [
{ exitDate: { gte: toDate } },
{ exitDate: null } // Still in country
]
}
]
}
]
}

// Use compound index [userId, entryDate, exitDate]
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
entryDate: 'asc'
},
select: {
id: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get user statistics (optimized aggregation)
/
export async function getUserStats(userId: string) {
// Use Promise.all for parallel execution
const [
totalTrips,
countriesVisited,
currentTrips,
schengenTrips,
recentTrips
] = await Promise.all([
// Total trips count
prisma.countryVisit.count({
where: { userId }
}),

    // Unique countries count
    prisma.countryVisit.groupBy({
      by: ['country'],
      where: { userId },
      _count: { country: true }
    }),

    // Current ongoing trips
    prisma.countryVisit.count({
      where: {
        userId,
        exitDate: null
      }
    }),

    // Schengen trips in last 180 days
    prisma.countryVisit.count({
      where: {
        userId,
        country: {
          in: getSchengenCountries()
        },
        entryDate: {
          gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        }
      }
    }),

    // Recent trips (last 30 days)
    prisma.countryVisit.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        country: true,
        entryDate: true,
        visaType: true
      }
    })

])

return {
totalTrips,
countriesVisited: countriesVisited.length,
currentTrips,
schengenTrips,
recentTrips
}
}

/\*\*
Bulk operations for better performance
/
export async function createMultipleTrips(userId: string, trips: Omit<CountryVisit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]) {
const data = trips.map(trip => ({
...trip,
userId,
passportCountry: trip.passportCountry || 'Unknown',
entryDate: new Date(trip.entryDate),
exitDate: trip.exitDate ? new Date(trip.exitDate) : null
}))

return await prisma.countryVisit.createMany({
data
})
}

/\*\*
Search trips with full-text search on notes

**특성:** `exported`, `async`

#### `getSchengenCountries`

Optimized database queries for DiNoCal
Uses proper indexes and query optimization techniques
/

export interface TripQueryOptions {
userId: string
limit?: number
offset?: number
country?: string
visaType?: string
dateFrom?: Date
dateTo?: Date
orderBy?: 'entryDate' | 'createdAt'
orderDirection?: 'asc' | 'desc'
}

export interface SchengenQueryOptions {
userId: string
fromDate?: Date
toDate?: Date
passportCountry?: string
}

/\*\*
Get user trips with optimized filtering and pagination
/
export async function getUserTrips(options: TripQueryOptions): Promise<CountryVisit[]> {
const {
userId,
limit = 50,
offset = 0,
country,
visaType,
dateFrom,
dateTo,
orderBy = 'entryDate',
orderDirection = 'desc'
} = options

const where: any = { userId }

// Add filters
if (country) {
where.country = country
}

if (visaType) {
where.visaType = visaType
}

if (dateFrom || dateTo) {
where.entryDate = {}
if (dateFrom) {
where.entryDate.gte = dateFrom
}
if (dateTo) {
where.entryDate.lte = dateTo
}
}

// Use optimized query with proper indexes
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
[orderBy]: orderDirection
},
take: limit,
skip: offset,
select: {
id: true,
userId: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true,
notes: true,
createdAt: true,
updatedAt: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get trips for Schengen calculation (optimized for date ranges)
/
export async function getSchengenTrips(options: SchengenQueryOptions): Promise<CountryVisit[]> {
const { userId, fromDate, toDate, passportCountry } = options

const where: any = {
userId,
country: {
in: getSchengenCountries() // List of Schengen countries
}
}

if (passportCountry) {
where.passportCountry = passportCountry
}

if (fromDate || toDate) {
where.OR = [
// Entry date in range
{
entryDate: {
gte: fromDate,
lte: toDate
}
},
// Exit date in range
{
exitDate: {
gte: fromDate,
lte: toDate
}
},
// Trip spans the entire range
{
AND: [
{ entryDate: { lte: fromDate } },
{
OR: [
{ exitDate: { gte: toDate } },
{ exitDate: null } // Still in country
]
}
]
}
]
}

// Use compound index [userId, entryDate, exitDate]
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
entryDate: 'asc'
},
select: {
id: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get user statistics (optimized aggregation)
/
export async function getUserStats(userId: string) {
// Use Promise.all for parallel execution
const [
totalTrips,
countriesVisited,
currentTrips,
schengenTrips,
recentTrips
] = await Promise.all([
// Total trips count
prisma.countryVisit.count({
where: { userId }
}),

    // Unique countries count
    prisma.countryVisit.groupBy({
      by: ['country'],
      where: { userId },
      _count: { country: true }
    }),

    // Current ongoing trips
    prisma.countryVisit.count({
      where: {
        userId,
        exitDate: null
      }
    }),

    // Schengen trips in last 180 days
    prisma.countryVisit.count({
      where: {
        userId,
        country: {
          in: getSchengenCountries()
        },
        entryDate: {
          gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        }
      }
    }),

    // Recent trips (last 30 days)
    prisma.countryVisit.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        country: true,
        entryDate: true,
        visaType: true
      }
    })

])

return {
totalTrips,
countriesVisited: countriesVisited.length,
currentTrips,
schengenTrips,
recentTrips
}
}

/\*\*
Bulk operations for better performance
/
export async function createMultipleTrips(userId: string, trips: Omit<CountryVisit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]) {
const data = trips.map(trip => ({
...trip,
userId,
passportCountry: trip.passportCountry || 'Unknown',
entryDate: new Date(trip.entryDate),
exitDate: trip.exitDate ? new Date(trip.exitDate) : null
}))

return await prisma.countryVisit.createMany({
data
})
}

/\*\*
Search trips with full-text search on notes
/
export async function searchTrips(userId: string, query: string, limit = 20): Promise<CountryVisit[]> {
// Use LIKE for SQLite compatibility
const trips = await prisma.countryVisit.findMany({
where: {
userId,
OR: [
{
country: {
contains: query
}
},
{
notes: {
contains: query
}
},
{
visaType: {
contains: query
}
}
]
},
orderBy: {
entryDate: 'desc'
},
take: limit,
select: {
id: true,
userId: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true,
notes: true,
createdAt: true,
updatedAt: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get Schengen countries list (cached)

#### `getDatabaseHealth`

Optimized database queries for DiNoCal
Uses proper indexes and query optimization techniques
/

export interface TripQueryOptions {
userId: string
limit?: number
offset?: number
country?: string
visaType?: string
dateFrom?: Date
dateTo?: Date
orderBy?: 'entryDate' | 'createdAt'
orderDirection?: 'asc' | 'desc'
}

export interface SchengenQueryOptions {
userId: string
fromDate?: Date
toDate?: Date
passportCountry?: string
}

/\*\*
Get user trips with optimized filtering and pagination
/
export async function getUserTrips(options: TripQueryOptions): Promise<CountryVisit[]> {
const {
userId,
limit = 50,
offset = 0,
country,
visaType,
dateFrom,
dateTo,
orderBy = 'entryDate',
orderDirection = 'desc'
} = options

const where: any = { userId }

// Add filters
if (country) {
where.country = country
}

if (visaType) {
where.visaType = visaType
}

if (dateFrom || dateTo) {
where.entryDate = {}
if (dateFrom) {
where.entryDate.gte = dateFrom
}
if (dateTo) {
where.entryDate.lte = dateTo
}
}

// Use optimized query with proper indexes
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
[orderBy]: orderDirection
},
take: limit,
skip: offset,
select: {
id: true,
userId: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true,
notes: true,
createdAt: true,
updatedAt: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get trips for Schengen calculation (optimized for date ranges)
/
export async function getSchengenTrips(options: SchengenQueryOptions): Promise<CountryVisit[]> {
const { userId, fromDate, toDate, passportCountry } = options

const where: any = {
userId,
country: {
in: getSchengenCountries() // List of Schengen countries
}
}

if (passportCountry) {
where.passportCountry = passportCountry
}

if (fromDate || toDate) {
where.OR = [
// Entry date in range
{
entryDate: {
gte: fromDate,
lte: toDate
}
},
// Exit date in range
{
exitDate: {
gte: fromDate,
lte: toDate
}
},
// Trip spans the entire range
{
AND: [
{ entryDate: { lte: fromDate } },
{
OR: [
{ exitDate: { gte: toDate } },
{ exitDate: null } // Still in country
]
}
]
}
]
}

// Use compound index [userId, entryDate, exitDate]
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
entryDate: 'asc'
},
select: {
id: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get user statistics (optimized aggregation)
/
export async function getUserStats(userId: string) {
// Use Promise.all for parallel execution
const [
totalTrips,
countriesVisited,
currentTrips,
schengenTrips,
recentTrips
] = await Promise.all([
// Total trips count
prisma.countryVisit.count({
where: { userId }
}),

    // Unique countries count
    prisma.countryVisit.groupBy({
      by: ['country'],
      where: { userId },
      _count: { country: true }
    }),

    // Current ongoing trips
    prisma.countryVisit.count({
      where: {
        userId,
        exitDate: null
      }
    }),

    // Schengen trips in last 180 days
    prisma.countryVisit.count({
      where: {
        userId,
        country: {
          in: getSchengenCountries()
        },
        entryDate: {
          gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        }
      }
    }),

    // Recent trips (last 30 days)
    prisma.countryVisit.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        country: true,
        entryDate: true,
        visaType: true
      }
    })

])

return {
totalTrips,
countriesVisited: countriesVisited.length,
currentTrips,
schengenTrips,
recentTrips
}
}

/\*\*
Bulk operations for better performance
/
export async function createMultipleTrips(userId: string, trips: Omit<CountryVisit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]) {
const data = trips.map(trip => ({
...trip,
userId,
passportCountry: trip.passportCountry || 'Unknown',
entryDate: new Date(trip.entryDate),
exitDate: trip.exitDate ? new Date(trip.exitDate) : null
}))

return await prisma.countryVisit.createMany({
data
})
}

/\*\*
Search trips with full-text search on notes
/
export async function searchTrips(userId: string, query: string, limit = 20): Promise<CountryVisit[]> {
// Use LIKE for SQLite compatibility
const trips = await prisma.countryVisit.findMany({
where: {
userId,
OR: [
{
country: {
contains: query
}
},
{
notes: {
contains: query
}
},
{
visaType: {
contains: query
}
}
]
},
orderBy: {
entryDate: 'desc'
},
take: limit,
select: {
id: true,
userId: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true,
notes: true,
createdAt: true,
updatedAt: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get Schengen countries list (cached)
/
function getSchengenCountries(): string[] {
return [
'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia',
'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland',
'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
'Liechtenstein'
]
}

/\*\*
Database health check and optimization suggestions

**특성:** `exported`, `async`

#### `cleanupOldData`

Optimized database queries for DiNoCal
Uses proper indexes and query optimization techniques
/

export interface TripQueryOptions {
userId: string
limit?: number
offset?: number
country?: string
visaType?: string
dateFrom?: Date
dateTo?: Date
orderBy?: 'entryDate' | 'createdAt'
orderDirection?: 'asc' | 'desc'
}

export interface SchengenQueryOptions {
userId: string
fromDate?: Date
toDate?: Date
passportCountry?: string
}

/\*\*
Get user trips with optimized filtering and pagination
/
export async function getUserTrips(options: TripQueryOptions): Promise<CountryVisit[]> {
const {
userId,
limit = 50,
offset = 0,
country,
visaType,
dateFrom,
dateTo,
orderBy = 'entryDate',
orderDirection = 'desc'
} = options

const where: any = { userId }

// Add filters
if (country) {
where.country = country
}

if (visaType) {
where.visaType = visaType
}

if (dateFrom || dateTo) {
where.entryDate = {}
if (dateFrom) {
where.entryDate.gte = dateFrom
}
if (dateTo) {
where.entryDate.lte = dateTo
}
}

// Use optimized query with proper indexes
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
[orderBy]: orderDirection
},
take: limit,
skip: offset,
select: {
id: true,
userId: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true,
notes: true,
createdAt: true,
updatedAt: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get trips for Schengen calculation (optimized for date ranges)
/
export async function getSchengenTrips(options: SchengenQueryOptions): Promise<CountryVisit[]> {
const { userId, fromDate, toDate, passportCountry } = options

const where: any = {
userId,
country: {
in: getSchengenCountries() // List of Schengen countries
}
}

if (passportCountry) {
where.passportCountry = passportCountry
}

if (fromDate || toDate) {
where.OR = [
// Entry date in range
{
entryDate: {
gte: fromDate,
lte: toDate
}
},
// Exit date in range
{
exitDate: {
gte: fromDate,
lte: toDate
}
},
// Trip spans the entire range
{
AND: [
{ entryDate: { lte: fromDate } },
{
OR: [
{ exitDate: { gte: toDate } },
{ exitDate: null } // Still in country
]
}
]
}
]
}

// Use compound index [userId, entryDate, exitDate]
const trips = await prisma.countryVisit.findMany({
where,
orderBy: {
entryDate: 'asc'
},
select: {
id: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get user statistics (optimized aggregation)
/
export async function getUserStats(userId: string) {
// Use Promise.all for parallel execution
const [
totalTrips,
countriesVisited,
currentTrips,
schengenTrips,
recentTrips
] = await Promise.all([
// Total trips count
prisma.countryVisit.count({
where: { userId }
}),

    // Unique countries count
    prisma.countryVisit.groupBy({
      by: ['country'],
      where: { userId },
      _count: { country: true }
    }),

    // Current ongoing trips
    prisma.countryVisit.count({
      where: {
        userId,
        exitDate: null
      }
    }),

    // Schengen trips in last 180 days
    prisma.countryVisit.count({
      where: {
        userId,
        country: {
          in: getSchengenCountries()
        },
        entryDate: {
          gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        }
      }
    }),

    // Recent trips (last 30 days)
    prisma.countryVisit.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        country: true,
        entryDate: true,
        visaType: true
      }
    })

])

return {
totalTrips,
countriesVisited: countriesVisited.length,
currentTrips,
schengenTrips,
recentTrips
}
}

/\*\*
Bulk operations for better performance
/
export async function createMultipleTrips(userId: string, trips: Omit<CountryVisit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]) {
const data = trips.map(trip => ({
...trip,
userId,
passportCountry: trip.passportCountry || 'Unknown',
entryDate: new Date(trip.entryDate),
exitDate: trip.exitDate ? new Date(trip.exitDate) : null
}))

return await prisma.countryVisit.createMany({
data
})
}

/\*\*
Search trips with full-text search on notes
/
export async function searchTrips(userId: string, query: string, limit = 20): Promise<CountryVisit[]> {
// Use LIKE for SQLite compatibility
const trips = await prisma.countryVisit.findMany({
where: {
userId,
OR: [
{
country: {
contains: query
}
},
{
notes: {
contains: query
}
},
{
visaType: {
contains: query
}
}
]
},
orderBy: {
entryDate: 'desc'
},
take: limit,
select: {
id: true,
userId: true,
country: true,
entryDate: true,
exitDate: true,
visaType: true,
maxDays: true,
passportCountry: true,
notes: true,
createdAt: true,
updatedAt: true
}
})

return trips.map(trip => ({
...trip,
entryDate: trip.entryDate.toISOString(),
exitDate: trip.exitDate?.toISOString() || null,
visaType: trip.visaType as any,
passportCountry: trip.passportCountry as any
})) as CountryVisit[]
}

/\*\*
Get Schengen countries list (cached)
/
function getSchengenCountries(): string[] {
return [
'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia',
'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland',
'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
'Liechtenstein'
]
}

/\*_
Database health check and optimization suggestions
/
export async function getDatabaseHealth() {
const [
totalUsers,
totalTrips,
recentActivity,
oldestTrip,
newestTrip
] = await Promise.all([
prisma.user.count(),
prisma.countryVisit.count(),
prisma.countryVisit.count({
where: {
createdAt: {
gte: new Date(Date.now() - 24 _ 60 _ 60 _ 1000) // Last 24 hours
}
}
}),
prisma.countryVisit.findFirst({
orderBy: { entryDate: 'asc' },
select: { entryDate: true }
}),
prisma.countryVisit.findFirst({
orderBy: { entryDate: 'desc' },
select: { entryDate: true }
})
])

return {
totalUsers,
totalTrips,
recentActivity,
dataRange: {
oldest: oldestTrip?.entryDate,
newest: newestTrip?.entryDate
},
avgTripsPerUser: totalUsers > 0 ? Math.round(totalTrips / totalUsers) : 0
}
}

/\*\*
Clean up old data (for maintenance)

**특성:** `exported`, `async`

### 🔗 Interfaces

#### `TripQueryOptions`

Optimized database queries for DiNoCal
Uses proper indexes and query optimization techniques

**특성:** `exported`

#### `SchengenQueryOptions`

**특성:** `exported`

## prisma-client.ts

**파일 경로:** `lib/database/prisma-client.ts`

**설명:** Enhanced Prisma Client with Connection Recovery
Provides resilient database access with automatic recovery

**파일 정보:**

- 📏 크기: 5678 bytes
- 📄 라인 수: 223
- 🔧 함수: 2개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `async`
- `db`

### 🔧 Functions

#### `getPrismaClient`

**특성:** `exported`, `async`

#### `checkDatabaseHealth`

**특성:** `exported`, `async`

## query-optimizer.ts

**파일 경로:** `lib/database/query-optimizer.ts`

**설명:** Database Query Optimizer for Production Performance
프로덕션 성능을 위한 데이터베이스 쿼리 최적화

**파일 정보:**

- 📏 크기: 9013 bytes
- 📄 라인 수: 362
- 🔧 함수: 3개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `queryOptimizer`
- `async`

### 🔧 Functions

#### `getUserTripsOptimized`

Database Query Optimizer for Production Performance
프로덕션 성능을 위한 데이터베이스 쿼리 최적화
/

import { PrismaClient, Prisma } from '@prisma/client'
import { getPrismaClient } from './dev-prisma'
const prisma = getPrismaClient()

interface QueryMetrics {
query: string
duration: number
timestamp: Date
recordCount?: number
error?: string
}

interface CacheOptions {
ttl: number // Time to live in seconds
key: string
}

class QueryOptimizer {
private static instance: QueryOptimizer
private queryMetrics: QueryMetrics[] = []
private cache = new Map<string, { data: any; expires: number }>()
private readonly MAX_METRICS = 1000 // 최대 메트릭 보관 수
private readonly DEFAULT_CACHE_TTL = 300 // 5분

private constructor() {}

public static getInstance(): QueryOptimizer {
if (!QueryOptimizer.instance) {
QueryOptimizer.instance = new QueryOptimizer()
}
return QueryOptimizer.instance
}

/\*\*
캐시된 쿼리 실행
/
public async executeWithCache<T>(
queryFn: () => Promise<T>,
cacheOptions: CacheOptions
): Promise<T> {
const now = Date.now()
const cached = this.cache.get(cacheOptions.key)

    // 캐시 히트
    if (cached && cached.expires > now) {
      return cached.data as T
    }

    // 캐시 미스 - 쿼리 실행
    const result = await queryFn()

    // 캐시 저장
    this.cache.set(cacheOptions.key, {
      data: result,
      expires: now + (cacheOptions.ttl * 1000)
    })

    return result

}

/\*\*
메트릭과 함께 쿼리 실행
/
public async executeWithMetrics<T>(
queryFn: () => Promise<T>,
queryName: string
): Promise<T> {
const startTime = Date.now()

    try {
      const result = await queryFn()
      const duration = Date.now() - startTime

      // 메트릭 기록
      this.recordMetrics({
        query: queryName,
        duration,
        timestamp: new Date(),
        recordCount: Array.isArray(result) ? result.length : 1
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      // 에러 메트릭 기록
      this.recordMetrics({
        query: queryName,
        duration,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      throw error
    }

}

private recordMetrics(metrics: QueryMetrics): void {
this.queryMetrics.push(metrics)

    // 메트릭 수 제한
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS)
    }

}

/\*\*
쿼리 성능 통계
/
public getQueryStats(): {
totalQueries: number
averageDuration: number
slowQueries: QueryMetrics[]
errorQueries: QueryMetrics[]
cacheHitRate: number
} {
const total = this.queryMetrics.length
const totalDuration = this.queryMetrics.reduce((sum, m) => sum + m.duration, 0)
const slowQueries = this.queryMetrics.filter(m => m.duration > 1000) // 1초 이상
const errorQueries = this.queryMetrics.filter(m => m.error)

    return {
      totalQueries: total,
      averageDuration: total > 0 ? totalDuration / total : 0,
      slowQueries,
      errorQueries,
      cacheHitRate: this.calculateCacheHitRate()
    }

}

private calculateCacheHitRate(): number {
// 간단한 캐시 히트율 계산 (실제 구현에서는 더 정교한 추적 필요)
return this.cache.size > 0 ? 0.8 : 0 // 임시값
}

/\*\*
캐시 정리
/
public clearExpiredCache(): void {
const now = Date.now()
for (const [key, value] of this.cache.entries()) {
if (value.expires <= now) {
this.cache.delete(key)
}
}
}

/\*\*
캐시 통계
/
public getCacheStats() {
return {
size: this.cache.size,
keys: Array.from(this.cache.keys())
}
}
}

// Optimized query helpers
export const queryOptimizer = QueryOptimizer.getInstance()

/\*\*
사용자의 여행 기록 조회 (최적화된 버전)

**특성:** `exported`, `async`

#### `getSchengenTripsOptimized`

Database Query Optimizer for Production Performance
프로덕션 성능을 위한 데이터베이스 쿼리 최적화
/

import { PrismaClient, Prisma } from '@prisma/client'
import { getPrismaClient } from './dev-prisma'
const prisma = getPrismaClient()

interface QueryMetrics {
query: string
duration: number
timestamp: Date
recordCount?: number
error?: string
}

interface CacheOptions {
ttl: number // Time to live in seconds
key: string
}

class QueryOptimizer {
private static instance: QueryOptimizer
private queryMetrics: QueryMetrics[] = []
private cache = new Map<string, { data: any; expires: number }>()
private readonly MAX_METRICS = 1000 // 최대 메트릭 보관 수
private readonly DEFAULT_CACHE_TTL = 300 // 5분

private constructor() {}

public static getInstance(): QueryOptimizer {
if (!QueryOptimizer.instance) {
QueryOptimizer.instance = new QueryOptimizer()
}
return QueryOptimizer.instance
}

/\*\*
캐시된 쿼리 실행
/
public async executeWithCache<T>(
queryFn: () => Promise<T>,
cacheOptions: CacheOptions
): Promise<T> {
const now = Date.now()
const cached = this.cache.get(cacheOptions.key)

    // 캐시 히트
    if (cached && cached.expires > now) {
      return cached.data as T
    }

    // 캐시 미스 - 쿼리 실행
    const result = await queryFn()

    // 캐시 저장
    this.cache.set(cacheOptions.key, {
      data: result,
      expires: now + (cacheOptions.ttl * 1000)
    })

    return result

}

/\*\*
메트릭과 함께 쿼리 실행
/
public async executeWithMetrics<T>(
queryFn: () => Promise<T>,
queryName: string
): Promise<T> {
const startTime = Date.now()

    try {
      const result = await queryFn()
      const duration = Date.now() - startTime

      // 메트릭 기록
      this.recordMetrics({
        query: queryName,
        duration,
        timestamp: new Date(),
        recordCount: Array.isArray(result) ? result.length : 1
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      // 에러 메트릭 기록
      this.recordMetrics({
        query: queryName,
        duration,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      throw error
    }

}

private recordMetrics(metrics: QueryMetrics): void {
this.queryMetrics.push(metrics)

    // 메트릭 수 제한
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS)
    }

}

/\*\*
쿼리 성능 통계
/
public getQueryStats(): {
totalQueries: number
averageDuration: number
slowQueries: QueryMetrics[]
errorQueries: QueryMetrics[]
cacheHitRate: number
} {
const total = this.queryMetrics.length
const totalDuration = this.queryMetrics.reduce((sum, m) => sum + m.duration, 0)
const slowQueries = this.queryMetrics.filter(m => m.duration > 1000) // 1초 이상
const errorQueries = this.queryMetrics.filter(m => m.error)

    return {
      totalQueries: total,
      averageDuration: total > 0 ? totalDuration / total : 0,
      slowQueries,
      errorQueries,
      cacheHitRate: this.calculateCacheHitRate()
    }

}

private calculateCacheHitRate(): number {
// 간단한 캐시 히트율 계산 (실제 구현에서는 더 정교한 추적 필요)
return this.cache.size > 0 ? 0.8 : 0 // 임시값
}

/\*\*
캐시 정리
/
public clearExpiredCache(): void {
const now = Date.now()
for (const [key, value] of this.cache.entries()) {
if (value.expires <= now) {
this.cache.delete(key)
}
}
}

/\*\*
캐시 통계
/
public getCacheStats() {
return {
size: this.cache.size,
keys: Array.from(this.cache.keys())
}
}
}

// Optimized query helpers
export const queryOptimizer = QueryOptimizer.getInstance()

/\*\*
사용자의 여행 기록 조회 (최적화된 버전)
/
export async function getUserTripsOptimized(
userId: string,
options: {
limit?: number
offset?: number
country?: string
fromDate?: Date
toDate?: Date
includeActive?: boolean
} = {}
) {
const cacheKey = `user_trips_${userId}_${JSON.stringify(options)}`

return queryOptimizer.executeWithCache(
async () => {
return queryOptimizer.executeWithMetrics(
async () => {
const where: Prisma.CountryVisitWhereInput = {
userId,
...(options.country && { country: options.country }),
...(options.fromDate && { entryDate: { gte: options.fromDate } }),
...(options.toDate && { entryDate: { lte: options.toDate } }),
...(options.includeActive !== undefined && {
exitDate: options.includeActive ? null : { not: null }
})
}

          return prisma.countryVisit.findMany({
            where,
            orderBy: { entryDate: 'desc' },
            take: options.limit,
            skip: options.offset,
            select: {
              id: true,
              country: true,
              entryDate: true,
              exitDate: true,
              visaType: true,
              maxDays: true,
              passportCountry: true,
              notes: true,
              createdAt: true
            }
          })
        },
        `getUserTrips_${userId}`
      )
    },
    { key: cacheKey, ttl: 300 } // 5분 캐시

)
}

/\*\*
셰겐 계산을 위한 최적화된 쿼리

**특성:** `exported`, `async`

#### `getDashboardStatsOptimized`

Database Query Optimizer for Production Performance
프로덕션 성능을 위한 데이터베이스 쿼리 최적화
/

import { PrismaClient, Prisma } from '@prisma/client'
import { getPrismaClient } from './dev-prisma'
const prisma = getPrismaClient()

interface QueryMetrics {
query: string
duration: number
timestamp: Date
recordCount?: number
error?: string
}

interface CacheOptions {
ttl: number // Time to live in seconds
key: string
}

class QueryOptimizer {
private static instance: QueryOptimizer
private queryMetrics: QueryMetrics[] = []
private cache = new Map<string, { data: any; expires: number }>()
private readonly MAX_METRICS = 1000 // 최대 메트릭 보관 수
private readonly DEFAULT_CACHE_TTL = 300 // 5분

private constructor() {}

public static getInstance(): QueryOptimizer {
if (!QueryOptimizer.instance) {
QueryOptimizer.instance = new QueryOptimizer()
}
return QueryOptimizer.instance
}

/\*\*
캐시된 쿼리 실행
/
public async executeWithCache<T>(
queryFn: () => Promise<T>,
cacheOptions: CacheOptions
): Promise<T> {
const now = Date.now()
const cached = this.cache.get(cacheOptions.key)

    // 캐시 히트
    if (cached && cached.expires > now) {
      return cached.data as T
    }

    // 캐시 미스 - 쿼리 실행
    const result = await queryFn()

    // 캐시 저장
    this.cache.set(cacheOptions.key, {
      data: result,
      expires: now + (cacheOptions.ttl * 1000)
    })

    return result

}

/\*\*
메트릭과 함께 쿼리 실행
/
public async executeWithMetrics<T>(
queryFn: () => Promise<T>,
queryName: string
): Promise<T> {
const startTime = Date.now()

    try {
      const result = await queryFn()
      const duration = Date.now() - startTime

      // 메트릭 기록
      this.recordMetrics({
        query: queryName,
        duration,
        timestamp: new Date(),
        recordCount: Array.isArray(result) ? result.length : 1
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      // 에러 메트릭 기록
      this.recordMetrics({
        query: queryName,
        duration,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      throw error
    }

}

private recordMetrics(metrics: QueryMetrics): void {
this.queryMetrics.push(metrics)

    // 메트릭 수 제한
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS)
    }

}

/\*\*
쿼리 성능 통계
/
public getQueryStats(): {
totalQueries: number
averageDuration: number
slowQueries: QueryMetrics[]
errorQueries: QueryMetrics[]
cacheHitRate: number
} {
const total = this.queryMetrics.length
const totalDuration = this.queryMetrics.reduce((sum, m) => sum + m.duration, 0)
const slowQueries = this.queryMetrics.filter(m => m.duration > 1000) // 1초 이상
const errorQueries = this.queryMetrics.filter(m => m.error)

    return {
      totalQueries: total,
      averageDuration: total > 0 ? totalDuration / total : 0,
      slowQueries,
      errorQueries,
      cacheHitRate: this.calculateCacheHitRate()
    }

}

private calculateCacheHitRate(): number {
// 간단한 캐시 히트율 계산 (실제 구현에서는 더 정교한 추적 필요)
return this.cache.size > 0 ? 0.8 : 0 // 임시값
}

/\*\*
캐시 정리
/
public clearExpiredCache(): void {
const now = Date.now()
for (const [key, value] of this.cache.entries()) {
if (value.expires <= now) {
this.cache.delete(key)
}
}
}

/\*\*
캐시 통계
/
public getCacheStats() {
return {
size: this.cache.size,
keys: Array.from(this.cache.keys())
}
}
}

// Optimized query helpers
export const queryOptimizer = QueryOptimizer.getInstance()

/\*\*
사용자의 여행 기록 조회 (최적화된 버전)
/
export async function getUserTripsOptimized(
userId: string,
options: {
limit?: number
offset?: number
country?: string
fromDate?: Date
toDate?: Date
includeActive?: boolean
} = {}
) {
const cacheKey = `user_trips_${userId}_${JSON.stringify(options)}`

return queryOptimizer.executeWithCache(
async () => {
return queryOptimizer.executeWithMetrics(
async () => {
const where: Prisma.CountryVisitWhereInput = {
userId,
...(options.country && { country: options.country }),
...(options.fromDate && { entryDate: { gte: options.fromDate } }),
...(options.toDate && { entryDate: { lte: options.toDate } }),
...(options.includeActive !== undefined && {
exitDate: options.includeActive ? null : { not: null }
})
}

          return prisma.countryVisit.findMany({
            where,
            orderBy: { entryDate: 'desc' },
            take: options.limit,
            skip: options.offset,
            select: {
              id: true,
              country: true,
              entryDate: true,
              exitDate: true,
              visaType: true,
              maxDays: true,
              passportCountry: true,
              notes: true,
              createdAt: true
            }
          })
        },
        `getUserTrips_${userId}`
      )
    },
    { key: cacheKey, ttl: 300 } // 5분 캐시

)
}

/\*\*
셰겐 계산을 위한 최적화된 쿼리
/
export async function getSchengenTripsOptimized(
userId: string,
fromDate: Date,
toDate: Date
) {
const cacheKey = `schengen_${userId}_${fromDate.getTime()}_${toDate.getTime()}`

return queryOptimizer.executeWithCache(
async () => {
return queryOptimizer.executeWithMetrics(
async () => {
// 셰겐 국가 목록
const schengenCountries = [
'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia',
'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland',
'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
]

          return prisma.countryVisit.findMany({
            where: {
              userId,
              country: { in: schengenCountries },
              OR: [
                {
                  // 기간 내 입국
                  entryDate: {
                    gte: fromDate,
                    lte: toDate
                  }
                },
                {
                  // 기간 내 출국
                  exitDate: {
                    gte: fromDate,
                    lte: toDate
                  }
                },
                {
                  // 기간을 가로지르는 체류
                  AND: [
                    { entryDate: { lte: fromDate } },
                    {
                      OR: [
                        { exitDate: { gte: toDate } },
                        { exitDate: null }
                      ]
                    }
                  ]
                }
              ]
            },
            orderBy: { entryDate: 'asc' },
            select: {
              id: true,
              country: true,
              entryDate: true,
              exitDate: true,
              visaType: true
            }
          })
        },
        `getSchengenTrips_${userId}`
      )
    },
    { key: cacheKey, ttl: 600 } // 10분 캐시 (계산이 복잡하므로 더 길게)

)
}

/\*\*
대시보드 통계를 위한 최적화된 쿼리

**특성:** `exported`, `async`

### 📦 Classes

#### `QueryOptimizer`

### 🔗 Interfaces

#### `QueryMetrics`

#### `CacheOptions`

## db-performance.ts

**파일 경로:** `lib/db-performance.ts`

**설명:** Database Performance Optimization and Monitoring
Advanced query optimization, connection pooling, and performance analysis

**파일 정보:**

- 📏 크기: 13745 bytes
- 📄 라인 수: 488
- 🔧 함수: 2개
- 📦 클래스: 4개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `createOptimizedPrismaClient`
- `DatabaseConnectionPool`
- `OptimizedQueries`
- `DatabaseMaintenance`
- `dbPerformanceMonitor`
- `dbConnectionPool`
- `createDatabasePerformanceMiddleware`
- `type`

### 🔧 Functions

#### `createOptimizedPrismaClient`

**특성:** `exported`

#### `createDatabasePerformanceMiddleware`

**특성:** `exported`

### 📦 Classes

#### `DatabasePerformanceMonitor`

#### `DatabaseConnectionPool`

**특성:** `exported`

#### `OptimizedQueries`

**특성:** `exported`

#### `DatabaseMaintenance`

**특성:** `exported`

### 🔗 Interfaces

#### `QueryMetric`

## db-utils.ts

**파일 경로:** `lib/db-utils.ts`

**파일 정보:**

- 📏 크기: 4555 bytes
- 📄 라인 수: 150
- 🔧 함수: 10개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `async`
- `invalidateUserCache`

### 🔧 Functions

#### `getUserByEmail`

**특성:** `exported`, `async`

#### `getUserById`

**특성:** `exported`, `async`

#### `createCountryVisit`

**특성:** `exported`, `async`

#### `updateCountryVisit`

**특성:** `exported`, `async`

#### `deleteCountryVisit`

**특성:** `exported`, `async`

#### `getUserCountryVisits`

**특성:** `exported`, `async`

#### `getSchengenCountryVisits`

**특성:** `exported`, `async`

#### `updateNotificationSettings`

**특성:** `exported`, `async`

#### `getUserTravelStats`

**특성:** `exported`, `async`

#### `invalidateUserCache`

**특성:** `exported`

## parser.ts

**파일 경로:** `lib/email/parser.ts`

**파일 정보:**

- 📏 크기: 10901 bytes
- 📄 라인 수: 415
- 🔧 함수: 2개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `EmailParser`
- `defaultEmailParser`
- `async`

### 🔧 Functions

#### `parseEmail`

**특성:** `exported`, `async`

#### `parseEmails`

**특성:** `exported`, `async`

### 📦 Classes

#### `EmailParser`

**특성:** `exported`

## patterns.ts

**파일 경로:** `lib/email/patterns.ts`

**파일 정보:**

- 📏 크기: 6510 bytes
- 📄 라인 수: 264
- 🔧 함수: 0개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `EMAIL_PROVIDERS`
- `COMMON_DATE_PATTERNS`
- `TIME_PATTERNS`
- `AIRPORT_CODE_PATTERN`
- `FLIGHT_NUMBER_PATTERNS`
- `CONFIRMATION_PATTERNS`

## service.ts

**파일 경로:** `lib/email/service.ts`

**설명:** Email service stub for testing

**파일 정보:**

- 📏 크기: 1046 bytes
- 📄 라인 수: 46
- 🔧 함수: 3개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `EmailOptions`
- `async`
- `emailTemplates`

### 🔧 Functions

#### `sendEmail`

**특성:** `exported`, `async`

#### `sendBulkEmails`

**특성:** `exported`, `async`

#### `sendTemplateEmail`

**특성:** `exported`, `async`

### 🔗 Interfaces

#### `EmailOptions`

**특성:** `exported`

## email-intelligence.ts

**파일 경로:** `lib/email-intelligence.ts`

**설명:** 이메일 지능형 분석 라이브러리
고급 패턴 매칭, 자연어 처리, 컨텍스트 분석을 통한 여행 정보 추출

**파일 정보:**

- 📏 크기: 9907 bytes
- 📄 라인 수: 332
- 🔧 함수: 10개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `normalizeDateString`
- `validateFlightNumber`
- `validateAirportCode`
- `validateBookingReference`
- `adjustConfidenceByContext`
- `validateDataConsistency`
- `prioritizeTravelInfo`
- `deduplicateAndMergeTravelInfo`

### 🔧 Functions

#### `normalizeDateString`

이메일 지능형 분석 라이브러리
고급 패턴 매칭, 자연어 처리, 컨텍스트 분석을 통한 여행 정보 추출
/

import { ExtractedTravelInfo } from '@/types/gmail'
import { airportCodes, airlineCodes } from '@/data/travel-patterns'

/\*\*
날짜 문자열을 표준 형식으로 정규화

**특성:** `exported`

#### `validateFlightNumber`

이메일 지능형 분석 라이브러리
고급 패턴 매칭, 자연어 처리, 컨텍스트 분석을 통한 여행 정보 추출
/

import { ExtractedTravelInfo } from '@/types/gmail'
import { airportCodes, airlineCodes } from '@/data/travel-patterns'

/\*\*
날짜 문자열을 표준 형식으로 정규화
/
export function normalizeDateString(dateStr: string): string | null {
if (!dateStr) return null

// 다양한 날짜 형식을 ISO 형식으로 변환
const dateFormats = [
// YYYY-MM-DD
/(\d{4})-(\d{1,2})-(\d{1,2})/,
// MM/DD/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// DD/MM/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// YYYY년 MM월 DD일
/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
// MMM DD, YYYY
/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
// DD MMM YYYY
/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/i
]

const monthMap: { [key: string]: string } = {
'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
}

for (const format of dateFormats) {
const match = dateStr.match(format)
if (match) {
if (format === dateFormats[0]) { // YYYY-MM-DD
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[1] || format === dateFormats[2]) { // MM/DD/YYYY
return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[3]) { // 한국어 형식
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[4]) { // MMM DD, YYYY
const month = monthMap[match[1].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[5]) { // DD MMM YYYY
const month = monthMap[match[2].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[1].padStart(2, '0')}`
}
}
}

return null
}

/\*\*
항공편 번호의 유효성 검증

**특성:** `exported`

#### `validateAirportCode`

이메일 지능형 분석 라이브러리
고급 패턴 매칭, 자연어 처리, 컨텍스트 분석을 통한 여행 정보 추출
/

import { ExtractedTravelInfo } from '@/types/gmail'
import { airportCodes, airlineCodes } from '@/data/travel-patterns'

/\*\*
날짜 문자열을 표준 형식으로 정규화
/
export function normalizeDateString(dateStr: string): string | null {
if (!dateStr) return null

// 다양한 날짜 형식을 ISO 형식으로 변환
const dateFormats = [
// YYYY-MM-DD
/(\d{4})-(\d{1,2})-(\d{1,2})/,
// MM/DD/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// DD/MM/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// YYYY년 MM월 DD일
/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
// MMM DD, YYYY
/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
// DD MMM YYYY
/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/i
]

const monthMap: { [key: string]: string } = {
'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
}

for (const format of dateFormats) {
const match = dateStr.match(format)
if (match) {
if (format === dateFormats[0]) { // YYYY-MM-DD
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[1] || format === dateFormats[2]) { // MM/DD/YYYY
return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[3]) { // 한국어 형식
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[4]) { // MMM DD, YYYY
const month = monthMap[match[1].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[5]) { // DD MMM YYYY
const month = monthMap[match[2].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[1].padStart(2, '0')}`
}
}
}

return null
}

/\*\*
항공편 번호의 유효성 검증
/
export function validateFlightNumber(flightNumber: string): boolean {
if (!flightNumber) return false

const normalizedFlight = flightNumber.toUpperCase().replace(/\s+/g, '')
const match = normalizedFlight.match(/^([A-Z]{2,3})(\d{1,4})$/)

if (!match) return false

const [, airlineCode, flightNum] = match

// 항공사 코드 검증
if (!(airlineCode in airlineCodes)) return false

// 항공편 번호 범위 검증 (일반적으로 1-9999)
const num = parseInt(flightNum)
return num >= 1 && num <= 9999
}

/\*\*
공항 코드의 유효성 검증

**특성:** `exported`

#### `validateBookingReference`

이메일 지능형 분석 라이브러리
고급 패턴 매칭, 자연어 처리, 컨텍스트 분석을 통한 여행 정보 추출
/

import { ExtractedTravelInfo } from '@/types/gmail'
import { airportCodes, airlineCodes } from '@/data/travel-patterns'

/\*\*
날짜 문자열을 표준 형식으로 정규화
/
export function normalizeDateString(dateStr: string): string | null {
if (!dateStr) return null

// 다양한 날짜 형식을 ISO 형식으로 변환
const dateFormats = [
// YYYY-MM-DD
/(\d{4})-(\d{1,2})-(\d{1,2})/,
// MM/DD/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// DD/MM/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// YYYY년 MM월 DD일
/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
// MMM DD, YYYY
/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
// DD MMM YYYY
/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/i
]

const monthMap: { [key: string]: string } = {
'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
}

for (const format of dateFormats) {
const match = dateStr.match(format)
if (match) {
if (format === dateFormats[0]) { // YYYY-MM-DD
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[1] || format === dateFormats[2]) { // MM/DD/YYYY
return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[3]) { // 한국어 형식
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[4]) { // MMM DD, YYYY
const month = monthMap[match[1].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[5]) { // DD MMM YYYY
const month = monthMap[match[2].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[1].padStart(2, '0')}`
}
}
}

return null
}

/\*\*
항공편 번호의 유효성 검증
/
export function validateFlightNumber(flightNumber: string): boolean {
if (!flightNumber) return false

const normalizedFlight = flightNumber.toUpperCase().replace(/\s+/g, '')
const match = normalizedFlight.match(/^([A-Z]{2,3})(\d{1,4})$/)

if (!match) return false

const [, airlineCode, flightNum] = match

// 항공사 코드 검증
if (!(airlineCode in airlineCodes)) return false

// 항공편 번호 범위 검증 (일반적으로 1-9999)
const num = parseInt(flightNum)
return num >= 1 && num <= 9999
}

/\*\*
공항 코드의 유효성 검증
/
export function validateAirportCode(airportCode: string): boolean {
if (!airportCode) return false

const normalizedCode = airportCode.toUpperCase()
return normalizedCode.length === 3 && /^[A-Z]{3}$/.test(normalizedCode) && normalizedCode in airportCodes
}

/\*\*
예약 번호의 유효성 검증

**특성:** `exported`

#### `adjustConfidenceByContext`

이메일 지능형 분석 라이브러리
고급 패턴 매칭, 자연어 처리, 컨텍스트 분석을 통한 여행 정보 추출
/

import { ExtractedTravelInfo } from '@/types/gmail'
import { airportCodes, airlineCodes } from '@/data/travel-patterns'

/\*\*
날짜 문자열을 표준 형식으로 정규화
/
export function normalizeDateString(dateStr: string): string | null {
if (!dateStr) return null

// 다양한 날짜 형식을 ISO 형식으로 변환
const dateFormats = [
// YYYY-MM-DD
/(\d{4})-(\d{1,2})-(\d{1,2})/,
// MM/DD/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// DD/MM/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// YYYY년 MM월 DD일
/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
// MMM DD, YYYY
/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
// DD MMM YYYY
/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/i
]

const monthMap: { [key: string]: string } = {
'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
}

for (const format of dateFormats) {
const match = dateStr.match(format)
if (match) {
if (format === dateFormats[0]) { // YYYY-MM-DD
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[1] || format === dateFormats[2]) { // MM/DD/YYYY
return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[3]) { // 한국어 형식
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[4]) { // MMM DD, YYYY
const month = monthMap[match[1].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[5]) { // DD MMM YYYY
const month = monthMap[match[2].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[1].padStart(2, '0')}`
}
}
}

return null
}

/\*\*
항공편 번호의 유효성 검증
/
export function validateFlightNumber(flightNumber: string): boolean {
if (!flightNumber) return false

const normalizedFlight = flightNumber.toUpperCase().replace(/\s+/g, '')
const match = normalizedFlight.match(/^([A-Z]{2,3})(\d{1,4})$/)

if (!match) return false

const [, airlineCode, flightNum] = match

// 항공사 코드 검증
if (!(airlineCode in airlineCodes)) return false

// 항공편 번호 범위 검증 (일반적으로 1-9999)
const num = parseInt(flightNum)
return num >= 1 && num <= 9999
}

/\*\*
공항 코드의 유효성 검증
/
export function validateAirportCode(airportCode: string): boolean {
if (!airportCode) return false

const normalizedCode = airportCode.toUpperCase()
return normalizedCode.length === 3 && /^[A-Z]{3}$/.test(normalizedCode) && normalizedCode in airportCodes
}

/\*\*
예약 번호의 유효성 검증
/
export function validateBookingReference(bookingRef: string): boolean {
if (!bookingRef) return false

// 일반적인 예약 번호 패턴 (6-8자리 영숫자)
return /^[A-Z0-9]{6,8}$/.test(bookingRef.toUpperCase())
}

/\*\*
컨텍스트 기반 신뢰도 조정

**특성:** `exported`

#### `validateDataConsistency`

이메일 지능형 분석 라이브러리
고급 패턴 매칭, 자연어 처리, 컨텍스트 분석을 통한 여행 정보 추출
/

import { ExtractedTravelInfo } from '@/types/gmail'
import { airportCodes, airlineCodes } from '@/data/travel-patterns'

/\*\*
날짜 문자열을 표준 형식으로 정규화
/
export function normalizeDateString(dateStr: string): string | null {
if (!dateStr) return null

// 다양한 날짜 형식을 ISO 형식으로 변환
const dateFormats = [
// YYYY-MM-DD
/(\d{4})-(\d{1,2})-(\d{1,2})/,
// MM/DD/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// DD/MM/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// YYYY년 MM월 DD일
/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
// MMM DD, YYYY
/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
// DD MMM YYYY
/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/i
]

const monthMap: { [key: string]: string } = {
'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
}

for (const format of dateFormats) {
const match = dateStr.match(format)
if (match) {
if (format === dateFormats[0]) { // YYYY-MM-DD
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[1] || format === dateFormats[2]) { // MM/DD/YYYY
return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[3]) { // 한국어 형식
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[4]) { // MMM DD, YYYY
const month = monthMap[match[1].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[5]) { // DD MMM YYYY
const month = monthMap[match[2].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[1].padStart(2, '0')}`
}
}
}

return null
}

/\*\*
항공편 번호의 유효성 검증
/
export function validateFlightNumber(flightNumber: string): boolean {
if (!flightNumber) return false

const normalizedFlight = flightNumber.toUpperCase().replace(/\s+/g, '')
const match = normalizedFlight.match(/^([A-Z]{2,3})(\d{1,4})$/)

if (!match) return false

const [, airlineCode, flightNum] = match

// 항공사 코드 검증
if (!(airlineCode in airlineCodes)) return false

// 항공편 번호 범위 검증 (일반적으로 1-9999)
const num = parseInt(flightNum)
return num >= 1 && num <= 9999
}

/\*\*
공항 코드의 유효성 검증
/
export function validateAirportCode(airportCode: string): boolean {
if (!airportCode) return false

const normalizedCode = airportCode.toUpperCase()
return normalizedCode.length === 3 && /^[A-Z]{3}$/.test(normalizedCode) && normalizedCode in airportCodes
}

/\*\*
예약 번호의 유효성 검증
/
export function validateBookingReference(bookingRef: string): boolean {
if (!bookingRef) return false

// 일반적인 예약 번호 패턴 (6-8자리 영숫자)
return /^[A-Z0-9]{6,8}$/.test(bookingRef.toUpperCase())
}

/\*\*
컨텍스트 기반 신뢰도 조정
/
export function adjustConfidenceByContext(
travelInfo: ExtractedTravelInfo,
emailContext: {
senderDomain: string
hasMultipleBookings: boolean
isForwardedEmail: boolean
hasAttachments: boolean
}
): number {
let adjustedConfidence = travelInfo.confidence

// 신뢰할 수 있는 발신자 도메인 보너스
const trustedDomains = [
'koreanair.com', 'flyasiana.com', 'jejuair.net',
'united.com', 'delta.com', 'jal.com',
'booking.com', 'expedia.com', 'agoda.com',
'hotels.com', 'airbnb.com'
]

if (trustedDomains.some(domain => emailContext.senderDomain.includes(domain))) {
adjustedConfidence += 0.15
}

// 첨부파일이 있는 경우 (e-ticket 등)
if (emailContext.hasAttachments) {
adjustedConfidence += 0.1
}

// 전달된 이메일의 경우 신뢰도 감소
if (emailContext.isForwardedEmail) {
adjustedConfidence -= 0.1
}

// 여러 예약이 포함된 경우 혼란 가능성으로 신뢰도 감소
if (emailContext.hasMultipleBookings) {
adjustedConfidence -= 0.05
}

return Math.max(0, Math.min(1, adjustedConfidence))
}

/\*\*
추출된 데이터의 일관성 검증

**특성:** `exported`

#### `prioritizeTravelInfo`

이메일 지능형 분석 라이브러리
고급 패턴 매칭, 자연어 처리, 컨텍스트 분석을 통한 여행 정보 추출
/

import { ExtractedTravelInfo } from '@/types/gmail'
import { airportCodes, airlineCodes } from '@/data/travel-patterns'

/\*\*
날짜 문자열을 표준 형식으로 정규화
/
export function normalizeDateString(dateStr: string): string | null {
if (!dateStr) return null

// 다양한 날짜 형식을 ISO 형식으로 변환
const dateFormats = [
// YYYY-MM-DD
/(\d{4})-(\d{1,2})-(\d{1,2})/,
// MM/DD/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// DD/MM/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// YYYY년 MM월 DD일
/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
// MMM DD, YYYY
/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
// DD MMM YYYY
/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/i
]

const monthMap: { [key: string]: string } = {
'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
}

for (const format of dateFormats) {
const match = dateStr.match(format)
if (match) {
if (format === dateFormats[0]) { // YYYY-MM-DD
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[1] || format === dateFormats[2]) { // MM/DD/YYYY
return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[3]) { // 한국어 형식
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[4]) { // MMM DD, YYYY
const month = monthMap[match[1].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[5]) { // DD MMM YYYY
const month = monthMap[match[2].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[1].padStart(2, '0')}`
}
}
}

return null
}

/\*\*
항공편 번호의 유효성 검증
/
export function validateFlightNumber(flightNumber: string): boolean {
if (!flightNumber) return false

const normalizedFlight = flightNumber.toUpperCase().replace(/\s+/g, '')
const match = normalizedFlight.match(/^([A-Z]{2,3})(\d{1,4})$/)

if (!match) return false

const [, airlineCode, flightNum] = match

// 항공사 코드 검증
if (!(airlineCode in airlineCodes)) return false

// 항공편 번호 범위 검증 (일반적으로 1-9999)
const num = parseInt(flightNum)
return num >= 1 && num <= 9999
}

/\*\*
공항 코드의 유효성 검증
/
export function validateAirportCode(airportCode: string): boolean {
if (!airportCode) return false

const normalizedCode = airportCode.toUpperCase()
return normalizedCode.length === 3 && /^[A-Z]{3}$/.test(normalizedCode) && normalizedCode in airportCodes
}

/\*\*
예약 번호의 유효성 검증
/
export function validateBookingReference(bookingRef: string): boolean {
if (!bookingRef) return false

// 일반적인 예약 번호 패턴 (6-8자리 영숫자)
return /^[A-Z0-9]{6,8}$/.test(bookingRef.toUpperCase())
}

/\*\*
컨텍스트 기반 신뢰도 조정
/
export function adjustConfidenceByContext(
travelInfo: ExtractedTravelInfo,
emailContext: {
senderDomain: string
hasMultipleBookings: boolean
isForwardedEmail: boolean
hasAttachments: boolean
}
): number {
let adjustedConfidence = travelInfo.confidence

// 신뢰할 수 있는 발신자 도메인 보너스
const trustedDomains = [
'koreanair.com', 'flyasiana.com', 'jejuair.net',
'united.com', 'delta.com', 'jal.com',
'booking.com', 'expedia.com', 'agoda.com',
'hotels.com', 'airbnb.com'
]

if (trustedDomains.some(domain => emailContext.senderDomain.includes(domain))) {
adjustedConfidence += 0.15
}

// 첨부파일이 있는 경우 (e-ticket 등)
if (emailContext.hasAttachments) {
adjustedConfidence += 0.1
}

// 전달된 이메일의 경우 신뢰도 감소
if (emailContext.isForwardedEmail) {
adjustedConfidence -= 0.1
}

// 여러 예약이 포함된 경우 혼란 가능성으로 신뢰도 감소
if (emailContext.hasMultipleBookings) {
adjustedConfidence -= 0.05
}

return Math.max(0, Math.min(1, adjustedConfidence))
}

/\*\*
추출된 데이터의 일관성 검증
/
export function validateDataConsistency(travelInfo: ExtractedTravelInfo): {
isConsistent: boolean
issues: string[]
} {
const issues: string[] = []

// 날짜 일관성 검증
if (travelInfo.departureDate && travelInfo.returnDate) {
const depDate = new Date(normalizeDateString(travelInfo.departureDate) || '')
const retDate = new Date(normalizeDateString(travelInfo.returnDate) || '')

    if (depDate >= retDate) {
      issues.push('Return date must be after departure date')
    }

    // 과거 날짜 확인 (30일 이전)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    if (depDate < thirtyDaysAgo) {
      issues.push('Departure date is more than 30 days in the past')
    }

    // 너무 먼 미래 날짜 확인 (2년 이후)
    const twoYearsLater = new Date()
    twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2)

    if (depDate > twoYearsLater) {
      issues.push('Departure date is more than 2 years in the future')
    }

}

// 항공편 번호 검증
if (travelInfo.flightNumber && !validateFlightNumber(travelInfo.flightNumber)) {
issues.push(`Invalid flight number: ${travelInfo.flightNumber}`)
}

// 공항 코드 검증
if (travelInfo.departure && !validateAirportCode(travelInfo.departure)) {
issues.push(`Invalid departure airport code: ${travelInfo.departure}`)
}

if (travelInfo.destination && !validateAirportCode(travelInfo.destination)) {
issues.push(`Invalid destination airport code: ${travelInfo.destination}`)
}

// 같은 출발지와 목적지 확인
if (travelInfo.departure && travelInfo.destination &&
travelInfo.departure === travelInfo.destination) {
issues.push('Departure and destination airports cannot be the same')
}

// 예약 번호 검증
if (travelInfo.bookingReference && !validateBookingReference(travelInfo.bookingReference)) {
issues.push(`Invalid booking reference format: ${travelInfo.bookingReference}`)
}

return {
isConsistent: issues.length === 0,
issues
}
}

/\*\*
여행 정보 우선순위 결정
여러 개의 여행 정보가 추출된 경우 가장 신뢰할 수 있는 것을 선택

**특성:** `exported`

#### `getDataCompleteness`

이메일 지능형 분석 라이브러리
고급 패턴 매칭, 자연어 처리, 컨텍스트 분석을 통한 여행 정보 추출
/

import { ExtractedTravelInfo } from '@/types/gmail'
import { airportCodes, airlineCodes } from '@/data/travel-patterns'

/\*\*
날짜 문자열을 표준 형식으로 정규화
/
export function normalizeDateString(dateStr: string): string | null {
if (!dateStr) return null

// 다양한 날짜 형식을 ISO 형식으로 변환
const dateFormats = [
// YYYY-MM-DD
/(\d{4})-(\d{1,2})-(\d{1,2})/,
// MM/DD/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// DD/MM/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// YYYY년 MM월 DD일
/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
// MMM DD, YYYY
/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
// DD MMM YYYY
/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/i
]

const monthMap: { [key: string]: string } = {
'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
}

for (const format of dateFormats) {
const match = dateStr.match(format)
if (match) {
if (format === dateFormats[0]) { // YYYY-MM-DD
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[1] || format === dateFormats[2]) { // MM/DD/YYYY
return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[3]) { // 한국어 형식
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[4]) { // MMM DD, YYYY
const month = monthMap[match[1].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[5]) { // DD MMM YYYY
const month = monthMap[match[2].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[1].padStart(2, '0')}`
}
}
}

return null
}

/\*\*
항공편 번호의 유효성 검증
/
export function validateFlightNumber(flightNumber: string): boolean {
if (!flightNumber) return false

const normalizedFlight = flightNumber.toUpperCase().replace(/\s+/g, '')
const match = normalizedFlight.match(/^([A-Z]{2,3})(\d{1,4})$/)

if (!match) return false

const [, airlineCode, flightNum] = match

// 항공사 코드 검증
if (!(airlineCode in airlineCodes)) return false

// 항공편 번호 범위 검증 (일반적으로 1-9999)
const num = parseInt(flightNum)
return num >= 1 && num <= 9999
}

/\*\*
공항 코드의 유효성 검증
/
export function validateAirportCode(airportCode: string): boolean {
if (!airportCode) return false

const normalizedCode = airportCode.toUpperCase()
return normalizedCode.length === 3 && /^[A-Z]{3}$/.test(normalizedCode) && normalizedCode in airportCodes
}

/\*\*
예약 번호의 유효성 검증
/
export function validateBookingReference(bookingRef: string): boolean {
if (!bookingRef) return false

// 일반적인 예약 번호 패턴 (6-8자리 영숫자)
return /^[A-Z0-9]{6,8}$/.test(bookingRef.toUpperCase())
}

/\*\*
컨텍스트 기반 신뢰도 조정
/
export function adjustConfidenceByContext(
travelInfo: ExtractedTravelInfo,
emailContext: {
senderDomain: string
hasMultipleBookings: boolean
isForwardedEmail: boolean
hasAttachments: boolean
}
): number {
let adjustedConfidence = travelInfo.confidence

// 신뢰할 수 있는 발신자 도메인 보너스
const trustedDomains = [
'koreanair.com', 'flyasiana.com', 'jejuair.net',
'united.com', 'delta.com', 'jal.com',
'booking.com', 'expedia.com', 'agoda.com',
'hotels.com', 'airbnb.com'
]

if (trustedDomains.some(domain => emailContext.senderDomain.includes(domain))) {
adjustedConfidence += 0.15
}

// 첨부파일이 있는 경우 (e-ticket 등)
if (emailContext.hasAttachments) {
adjustedConfidence += 0.1
}

// 전달된 이메일의 경우 신뢰도 감소
if (emailContext.isForwardedEmail) {
adjustedConfidence -= 0.1
}

// 여러 예약이 포함된 경우 혼란 가능성으로 신뢰도 감소
if (emailContext.hasMultipleBookings) {
adjustedConfidence -= 0.05
}

return Math.max(0, Math.min(1, adjustedConfidence))
}

/\*\*
추출된 데이터의 일관성 검증
/
export function validateDataConsistency(travelInfo: ExtractedTravelInfo): {
isConsistent: boolean
issues: string[]
} {
const issues: string[] = []

// 날짜 일관성 검증
if (travelInfo.departureDate && travelInfo.returnDate) {
const depDate = new Date(normalizeDateString(travelInfo.departureDate) || '')
const retDate = new Date(normalizeDateString(travelInfo.returnDate) || '')

    if (depDate >= retDate) {
      issues.push('Return date must be after departure date')
    }

    // 과거 날짜 확인 (30일 이전)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    if (depDate < thirtyDaysAgo) {
      issues.push('Departure date is more than 30 days in the past')
    }

    // 너무 먼 미래 날짜 확인 (2년 이후)
    const twoYearsLater = new Date()
    twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2)

    if (depDate > twoYearsLater) {
      issues.push('Departure date is more than 2 years in the future')
    }

}

// 항공편 번호 검증
if (travelInfo.flightNumber && !validateFlightNumber(travelInfo.flightNumber)) {
issues.push(`Invalid flight number: ${travelInfo.flightNumber}`)
}

// 공항 코드 검증
if (travelInfo.departure && !validateAirportCode(travelInfo.departure)) {
issues.push(`Invalid departure airport code: ${travelInfo.departure}`)
}

if (travelInfo.destination && !validateAirportCode(travelInfo.destination)) {
issues.push(`Invalid destination airport code: ${travelInfo.destination}`)
}

// 같은 출발지와 목적지 확인
if (travelInfo.departure && travelInfo.destination &&
travelInfo.departure === travelInfo.destination) {
issues.push('Departure and destination airports cannot be the same')
}

// 예약 번호 검증
if (travelInfo.bookingReference && !validateBookingReference(travelInfo.bookingReference)) {
issues.push(`Invalid booking reference format: ${travelInfo.bookingReference}`)
}

return {
isConsistent: issues.length === 0,
issues
}
}

/\*\*
여행 정보 우선순위 결정
여러 개의 여행 정보가 추출된 경우 가장 신뢰할 수 있는 것을 선택
/
export function prioritizeTravelInfo(travelInfos: ExtractedTravelInfo[]): ExtractedTravelInfo[] {
return travelInfos
.map(info => {
// 데이터 일관성 검증
const validation = validateDataConsistency(info)

      // 일관성이 없는 데이터의 신뢰도 감소
      if (!validation.isConsistent) {
        info.confidence = Math.max(0, info.confidence - (validation.issues.length * 0.1))
      }

      return info
    })
    .filter(info => info.confidence >= 0.2) // 최소 신뢰도 필터링
    .sort((a, b) => {
      // 1차: 신뢰도 순
      if (Math.abs(a.confidence - b.confidence) > 0.1) {
        return b.confidence - a.confidence
      }

      // 2차: 추출된 데이터 완성도 순
      const aCompleteness = getDataCompleteness(a)
      const bCompleteness = getDataCompleteness(b)

      return bCompleteness - aCompleteness
    })

}

/\*\*
데이터 완성도 계산

#### `deduplicateAndMergeTravelInfo`

이메일 지능형 분석 라이브러리
고급 패턴 매칭, 자연어 처리, 컨텍스트 분석을 통한 여행 정보 추출
/

import { ExtractedTravelInfo } from '@/types/gmail'
import { airportCodes, airlineCodes } from '@/data/travel-patterns'

/\*\*
날짜 문자열을 표준 형식으로 정규화
/
export function normalizeDateString(dateStr: string): string | null {
if (!dateStr) return null

// 다양한 날짜 형식을 ISO 형식으로 변환
const dateFormats = [
// YYYY-MM-DD
/(\d{4})-(\d{1,2})-(\d{1,2})/,
// MM/DD/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// DD/MM/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// YYYY년 MM월 DD일
/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
// MMM DD, YYYY
/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
// DD MMM YYYY
/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/i
]

const monthMap: { [key: string]: string } = {
'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
}

for (const format of dateFormats) {
const match = dateStr.match(format)
if (match) {
if (format === dateFormats[0]) { // YYYY-MM-DD
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[1] || format === dateFormats[2]) { // MM/DD/YYYY
return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[3]) { // 한국어 형식
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[4]) { // MMM DD, YYYY
const month = monthMap[match[1].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[5]) { // DD MMM YYYY
const month = monthMap[match[2].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[1].padStart(2, '0')}`
}
}
}

return null
}

/\*\*
항공편 번호의 유효성 검증
/
export function validateFlightNumber(flightNumber: string): boolean {
if (!flightNumber) return false

const normalizedFlight = flightNumber.toUpperCase().replace(/\s+/g, '')
const match = normalizedFlight.match(/^([A-Z]{2,3})(\d{1,4})$/)

if (!match) return false

const [, airlineCode, flightNum] = match

// 항공사 코드 검증
if (!(airlineCode in airlineCodes)) return false

// 항공편 번호 범위 검증 (일반적으로 1-9999)
const num = parseInt(flightNum)
return num >= 1 && num <= 9999
}

/\*\*
공항 코드의 유효성 검증
/
export function validateAirportCode(airportCode: string): boolean {
if (!airportCode) return false

const normalizedCode = airportCode.toUpperCase()
return normalizedCode.length === 3 && /^[A-Z]{3}$/.test(normalizedCode) && normalizedCode in airportCodes
}

/\*\*
예약 번호의 유효성 검증
/
export function validateBookingReference(bookingRef: string): boolean {
if (!bookingRef) return false

// 일반적인 예약 번호 패턴 (6-8자리 영숫자)
return /^[A-Z0-9]{6,8}$/.test(bookingRef.toUpperCase())
}

/\*\*
컨텍스트 기반 신뢰도 조정
/
export function adjustConfidenceByContext(
travelInfo: ExtractedTravelInfo,
emailContext: {
senderDomain: string
hasMultipleBookings: boolean
isForwardedEmail: boolean
hasAttachments: boolean
}
): number {
let adjustedConfidence = travelInfo.confidence

// 신뢰할 수 있는 발신자 도메인 보너스
const trustedDomains = [
'koreanair.com', 'flyasiana.com', 'jejuair.net',
'united.com', 'delta.com', 'jal.com',
'booking.com', 'expedia.com', 'agoda.com',
'hotels.com', 'airbnb.com'
]

if (trustedDomains.some(domain => emailContext.senderDomain.includes(domain))) {
adjustedConfidence += 0.15
}

// 첨부파일이 있는 경우 (e-ticket 등)
if (emailContext.hasAttachments) {
adjustedConfidence += 0.1
}

// 전달된 이메일의 경우 신뢰도 감소
if (emailContext.isForwardedEmail) {
adjustedConfidence -= 0.1
}

// 여러 예약이 포함된 경우 혼란 가능성으로 신뢰도 감소
if (emailContext.hasMultipleBookings) {
adjustedConfidence -= 0.05
}

return Math.max(0, Math.min(1, adjustedConfidence))
}

/\*\*
추출된 데이터의 일관성 검증
/
export function validateDataConsistency(travelInfo: ExtractedTravelInfo): {
isConsistent: boolean
issues: string[]
} {
const issues: string[] = []

// 날짜 일관성 검증
if (travelInfo.departureDate && travelInfo.returnDate) {
const depDate = new Date(normalizeDateString(travelInfo.departureDate) || '')
const retDate = new Date(normalizeDateString(travelInfo.returnDate) || '')

    if (depDate >= retDate) {
      issues.push('Return date must be after departure date')
    }

    // 과거 날짜 확인 (30일 이전)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    if (depDate < thirtyDaysAgo) {
      issues.push('Departure date is more than 30 days in the past')
    }

    // 너무 먼 미래 날짜 확인 (2년 이후)
    const twoYearsLater = new Date()
    twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2)

    if (depDate > twoYearsLater) {
      issues.push('Departure date is more than 2 years in the future')
    }

}

// 항공편 번호 검증
if (travelInfo.flightNumber && !validateFlightNumber(travelInfo.flightNumber)) {
issues.push(`Invalid flight number: ${travelInfo.flightNumber}`)
}

// 공항 코드 검증
if (travelInfo.departure && !validateAirportCode(travelInfo.departure)) {
issues.push(`Invalid departure airport code: ${travelInfo.departure}`)
}

if (travelInfo.destination && !validateAirportCode(travelInfo.destination)) {
issues.push(`Invalid destination airport code: ${travelInfo.destination}`)
}

// 같은 출발지와 목적지 확인
if (travelInfo.departure && travelInfo.destination &&
travelInfo.departure === travelInfo.destination) {
issues.push('Departure and destination airports cannot be the same')
}

// 예약 번호 검증
if (travelInfo.bookingReference && !validateBookingReference(travelInfo.bookingReference)) {
issues.push(`Invalid booking reference format: ${travelInfo.bookingReference}`)
}

return {
isConsistent: issues.length === 0,
issues
}
}

/\*\*
여행 정보 우선순위 결정
여러 개의 여행 정보가 추출된 경우 가장 신뢰할 수 있는 것을 선택
/
export function prioritizeTravelInfo(travelInfos: ExtractedTravelInfo[]): ExtractedTravelInfo[] {
return travelInfos
.map(info => {
// 데이터 일관성 검증
const validation = validateDataConsistency(info)

      // 일관성이 없는 데이터의 신뢰도 감소
      if (!validation.isConsistent) {
        info.confidence = Math.max(0, info.confidence - (validation.issues.length * 0.1))
      }

      return info
    })
    .filter(info => info.confidence >= 0.2) // 최소 신뢰도 필터링
    .sort((a, b) => {
      // 1차: 신뢰도 순
      if (Math.abs(a.confidence - b.confidence) > 0.1) {
        return b.confidence - a.confidence
      }

      // 2차: 추출된 데이터 완성도 순
      const aCompleteness = getDataCompleteness(a)
      const bCompleteness = getDataCompleteness(b)

      return bCompleteness - aCompleteness
    })

}

/\*\*
데이터 완성도 계산
/
function getDataCompleteness(travelInfo: ExtractedTravelInfo): number {
let score = 0
const fields = [
'departureDate', 'returnDate', 'destination', 'departure',
'flightNumber', 'bookingReference', 'hotelName', 'passengerName'
]

for (const field of fields) {
if (travelInfo[field as keyof ExtractedTravelInfo]) {
score += 1
}
}

return score / fields.length
}

/\*\*
스마트 중복 제거
같은 여행에 대한 여러 이메일에서 추출된 정보를 병합

**특성:** `exported`

#### `mergeTravelInfos`

이메일 지능형 분석 라이브러리
고급 패턴 매칭, 자연어 처리, 컨텍스트 분석을 통한 여행 정보 추출
/

import { ExtractedTravelInfo } from '@/types/gmail'
import { airportCodes, airlineCodes } from '@/data/travel-patterns'

/\*\*
날짜 문자열을 표준 형식으로 정규화
/
export function normalizeDateString(dateStr: string): string | null {
if (!dateStr) return null

// 다양한 날짜 형식을 ISO 형식으로 변환
const dateFormats = [
// YYYY-MM-DD
/(\d{4})-(\d{1,2})-(\d{1,2})/,
// MM/DD/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// DD/MM/YYYY
/(\d{1,2})\/(\d{1,2})\/(\d{4})/,
// YYYY년 MM월 DD일
/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
// MMM DD, YYYY
/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{4})/i,
// DD MMM YYYY
/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/i
]

const monthMap: { [key: string]: string } = {
'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
}

for (const format of dateFormats) {
const match = dateStr.match(format)
if (match) {
if (format === dateFormats[0]) { // YYYY-MM-DD
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[1] || format === dateFormats[2]) { // MM/DD/YYYY
return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[3]) { // 한국어 형식
return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
} else if (format === dateFormats[4]) { // MMM DD, YYYY
const month = monthMap[match[1].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[2].padStart(2, '0')}`
} else if (format === dateFormats[5]) { // DD MMM YYYY
const month = monthMap[match[2].toLowerCase().substring(0, 3)]
return `${match[3]}-${month}-${match[1].padStart(2, '0')}`
}
}
}

return null
}

/\*\*
항공편 번호의 유효성 검증
/
export function validateFlightNumber(flightNumber: string): boolean {
if (!flightNumber) return false

const normalizedFlight = flightNumber.toUpperCase().replace(/\s+/g, '')
const match = normalizedFlight.match(/^([A-Z]{2,3})(\d{1,4})$/)

if (!match) return false

const [, airlineCode, flightNum] = match

// 항공사 코드 검증
if (!(airlineCode in airlineCodes)) return false

// 항공편 번호 범위 검증 (일반적으로 1-9999)
const num = parseInt(flightNum)
return num >= 1 && num <= 9999
}

/\*\*
공항 코드의 유효성 검증
/
export function validateAirportCode(airportCode: string): boolean {
if (!airportCode) return false

const normalizedCode = airportCode.toUpperCase()
return normalizedCode.length === 3 && /^[A-Z]{3}$/.test(normalizedCode) && normalizedCode in airportCodes
}

/\*\*
예약 번호의 유효성 검증
/
export function validateBookingReference(bookingRef: string): boolean {
if (!bookingRef) return false

// 일반적인 예약 번호 패턴 (6-8자리 영숫자)
return /^[A-Z0-9]{6,8}$/.test(bookingRef.toUpperCase())
}

/\*\*
컨텍스트 기반 신뢰도 조정
/
export function adjustConfidenceByContext(
travelInfo: ExtractedTravelInfo,
emailContext: {
senderDomain: string
hasMultipleBookings: boolean
isForwardedEmail: boolean
hasAttachments: boolean
}
): number {
let adjustedConfidence = travelInfo.confidence

// 신뢰할 수 있는 발신자 도메인 보너스
const trustedDomains = [
'koreanair.com', 'flyasiana.com', 'jejuair.net',
'united.com', 'delta.com', 'jal.com',
'booking.com', 'expedia.com', 'agoda.com',
'hotels.com', 'airbnb.com'
]

if (trustedDomains.some(domain => emailContext.senderDomain.includes(domain))) {
adjustedConfidence += 0.15
}

// 첨부파일이 있는 경우 (e-ticket 등)
if (emailContext.hasAttachments) {
adjustedConfidence += 0.1
}

// 전달된 이메일의 경우 신뢰도 감소
if (emailContext.isForwardedEmail) {
adjustedConfidence -= 0.1
}

// 여러 예약이 포함된 경우 혼란 가능성으로 신뢰도 감소
if (emailContext.hasMultipleBookings) {
adjustedConfidence -= 0.05
}

return Math.max(0, Math.min(1, adjustedConfidence))
}

/\*\*
추출된 데이터의 일관성 검증
/
export function validateDataConsistency(travelInfo: ExtractedTravelInfo): {
isConsistent: boolean
issues: string[]
} {
const issues: string[] = []

// 날짜 일관성 검증
if (travelInfo.departureDate && travelInfo.returnDate) {
const depDate = new Date(normalizeDateString(travelInfo.departureDate) || '')
const retDate = new Date(normalizeDateString(travelInfo.returnDate) || '')

    if (depDate >= retDate) {
      issues.push('Return date must be after departure date')
    }

    // 과거 날짜 확인 (30일 이전)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    if (depDate < thirtyDaysAgo) {
      issues.push('Departure date is more than 30 days in the past')
    }

    // 너무 먼 미래 날짜 확인 (2년 이후)
    const twoYearsLater = new Date()
    twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2)

    if (depDate > twoYearsLater) {
      issues.push('Departure date is more than 2 years in the future')
    }

}

// 항공편 번호 검증
if (travelInfo.flightNumber && !validateFlightNumber(travelInfo.flightNumber)) {
issues.push(`Invalid flight number: ${travelInfo.flightNumber}`)
}

// 공항 코드 검증
if (travelInfo.departure && !validateAirportCode(travelInfo.departure)) {
issues.push(`Invalid departure airport code: ${travelInfo.departure}`)
}

if (travelInfo.destination && !validateAirportCode(travelInfo.destination)) {
issues.push(`Invalid destination airport code: ${travelInfo.destination}`)
}

// 같은 출발지와 목적지 확인
if (travelInfo.departure && travelInfo.destination &&
travelInfo.departure === travelInfo.destination) {
issues.push('Departure and destination airports cannot be the same')
}

// 예약 번호 검증
if (travelInfo.bookingReference && !validateBookingReference(travelInfo.bookingReference)) {
issues.push(`Invalid booking reference format: ${travelInfo.bookingReference}`)
}

return {
isConsistent: issues.length === 0,
issues
}
}

/\*\*
여행 정보 우선순위 결정
여러 개의 여행 정보가 추출된 경우 가장 신뢰할 수 있는 것을 선택
/
export function prioritizeTravelInfo(travelInfos: ExtractedTravelInfo[]): ExtractedTravelInfo[] {
return travelInfos
.map(info => {
// 데이터 일관성 검증
const validation = validateDataConsistency(info)

      // 일관성이 없는 데이터의 신뢰도 감소
      if (!validation.isConsistent) {
        info.confidence = Math.max(0, info.confidence - (validation.issues.length * 0.1))
      }

      return info
    })
    .filter(info => info.confidence >= 0.2) // 최소 신뢰도 필터링
    .sort((a, b) => {
      // 1차: 신뢰도 순
      if (Math.abs(a.confidence - b.confidence) > 0.1) {
        return b.confidence - a.confidence
      }

      // 2차: 추출된 데이터 완성도 순
      const aCompleteness = getDataCompleteness(a)
      const bCompleteness = getDataCompleteness(b)

      return bCompleteness - aCompleteness
    })

}

/\*\*
데이터 완성도 계산
/
function getDataCompleteness(travelInfo: ExtractedTravelInfo): number {
let score = 0
const fields = [
'departureDate', 'returnDate', 'destination', 'departure',
'flightNumber', 'bookingReference', 'hotelName', 'passengerName'
]

for (const field of fields) {
if (travelInfo[field as keyof ExtractedTravelInfo]) {
score += 1
}
}

return score / fields.length
}

/\*\*
스마트 중복 제거
같은 여행에 대한 여러 이메일에서 추출된 정보를 병합
/
export function deduplicateAndMergeTravelInfo(travelInfos: ExtractedTravelInfo[]): ExtractedTravelInfo[] {
const merged: ExtractedTravelInfo[] = []

for (const current of travelInfos) {
let foundDuplicate = false

    for (let i = 0; i < merged.length; i++) {
      const existing = merged[i]

      // 중복 판정 기준: 같은 항공편 번호 또는 같은 예약 번호 또는 같은 날짜+공항 조합
      const isSameTrip =
        (current.flightNumber && existing.flightNumber && current.flightNumber === existing.flightNumber) ||
        (current.bookingReference && existing.bookingReference && current.bookingReference === existing.bookingReference) ||
        (current.departureDate && existing.departureDate && current.departure && existing.departure &&
         normalizeDateString(current.departureDate) === normalizeDateString(existing.departureDate) &&
         current.departure === existing.departure)

      if (isSameTrip) {
        // 더 신뢰도가 높은 정보로 병합
        merged[i] = mergeTravelInfos(existing, current)
        foundDuplicate = true
        break
      }
    }

    if (!foundDuplicate) {
      merged.push(current)
    }

}

return merged
}

/\*\*
두 여행 정보를 병합

## error-handler.ts

**파일 경로:** `lib/error/error-handler.ts`

**설명:** Centralized Error Handling System
Provides consistent error handling across the application

**파일 정보:**

- 📏 크기: 6798 bytes
- 📄 라인 수: 256
- 🔧 함수: 4개
- 📦 클래스: 2개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `enum`
- `AppError`
- `createErrorResponse`
- `errors`
- `handleError`
- `asyncHandler`
- `handleClientError`

### 🔧 Functions

#### `createErrorResponse`

**특성:** `exported`

#### `logError`

#### `handleError`

**특성:** `exported`

#### `handleClientError`

**특성:** `exported`

### 📦 Classes

#### `export`

**특성:** `exported`

#### `AppError`

### 🔗 Interfaces

#### `interface`

## error-logger.ts

**파일 경로:** `lib/error/error-logger.ts`

**설명:** Error Logging and Monitoring System
Centralizes error logging with different severity levels and monitoring integration

**파일 정보:**

- 📏 크기: 6063 bytes
- 📄 라인 수: 229
- 🔧 함수: 6개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `ErrorLogEntry`
- `ErrorLogger`
- `getErrorLogger`
- `logError`
- `logWarn`
- `logInfo`
- `trackErrorRate`
- `getErrorTrends`

### 🔧 Functions

#### `getErrorLogger`

**특성:** `exported`

#### `logError`

**특성:** `exported`

#### `logWarn`

**특성:** `exported`

#### `logInfo`

**특성:** `exported`

#### `trackErrorRate`

**특성:** `exported`

#### `getErrorTrends`

**특성:** `exported`

### 📦 Classes

#### `ConsoleErrorLogger`

### 🔗 Interfaces

#### `ErrorLogEntry`

**특성:** `exported`

#### `ErrorLogger`

**특성:** `exported`

## gmail-analytics.ts

**파일 경로:** `lib/gmail-analytics.ts`

**파일 정보:**

- 📏 크기: 12270 bytes
- 📄 라인 수: 437
- 🔧 함수: 4개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `TravelStats`
- `TravelInsight`
- `generateTravelStats`
- `generateTravelInsights`
- `generateTravelCalendar`
- `estimateTravelCosts`

### 🔧 Functions

#### `generateTravelStats`

여행 통계 생성

**특성:** `exported`

#### `generateTravelInsights`

여행 통계 생성
/
export function generateTravelStats(travelInfos: TravelInfo[]): TravelStats {
const now = new Date()
const oneMonthFromNow = new Date(now)
oneMonthFromNow.setMonth(now.getMonth() + 1)

const sixMonthsAgo = new Date(now)
sixMonthsAgo.setMonth(now.getMonth() - 6)

const totalTrips = travelInfos.length
const destinations = new Map<string, number>()
const airlines = new Map<string, number>()
const upcomingTrips: TravelInfo[] = []
const recentTrips: TravelInfo[] = []
const monthlyTrips = new Map<string, number>()

for (const trip of travelInfos) {
// 목적지 카운트
if (trip.destination) {
destinations.set(trip.destination, (destinations.get(trip.destination) || 0) + 1)
}

    // 항공사 카운트
    if (trip.flightNumber) {
      const airlineCode = trip.flightNumber.substring(0, 2)
      airlines.set(airlineCode, (airlines.get(airlineCode) || 0) + 1)
    }

    if (trip.departureDate) {
      try {
        const departureDate = new Date(trip.departureDate)

        // 예정된 여행
        if (departureDate > now && departureDate <= oneMonthFromNow) {
          upcomingTrips.push(trip)
        }

        // 최근 여행
        if (departureDate >= sixMonthsAgo && departureDate <= now) {
          recentTrips.push(trip)
        }

        // 월별 통계
        const monthKey = `${departureDate.getFullYear()}-${(departureDate.getMonth() + 1).toString().padStart(2, '0')}`
        monthlyTrips.set(monthKey, (monthlyTrips.get(monthKey) || 0) + 1)

      } catch (error) {
        // Invalid date format
      }
    }

}

// 상위 목적지
const mostVisitedDestinations = Array.from(destinations.entries())
.map(([code, count]) => ({
code,
name: airportCodes[code as keyof typeof airportCodes] || code,
count
}))
.sort((a, b) => b.count - a.count)
.slice(0, 5)

// 선호 항공사
const preferredAirlines = Array.from(airlines.entries())
.map(([code, count]) => ({
code,
name: airlineCodes[code as keyof typeof airlineCodes] || code,
count
}))
.sort((a, b) => b.count - a.count)
.slice(0, 5)

// 여행 빈도
const domesticAirports = ['ICN', 'GMP', 'CJU', 'PUS', 'TAE'] // 한국 주요 공항
const domesticTrips = travelInfos.filter(trip =>
trip.destination && domesticAirports.includes(trip.destination)
).length
const internationalTrips = totalTrips - domesticTrips

const averageTripsPerMonth = monthlyTrips.size > 0 ?
Array.from(monthlyTrips.values()).reduce((sum, count) => sum + count, 0) / monthlyTrips.size : 0

// 여행 패턴 분석
const monthCounts = new Map<number, number>()
for (const trip of travelInfos) {
if (trip.departureDate) {
try {
const date = new Date(trip.departureDate)
const month = date.getMonth()
monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
} catch (error) {
// 잘못된 날짜 형식 무시
}
}
}

const monthNames = [
'1월', '2월', '3월', '4월', '5월', '6월',
'7월', '8월', '9월', '10월', '11월', '12월'
]

const sortedMonths = Array.from(monthCounts.entries())
.sort((a, b) => b[1] - a[1])

const busyMonths = sortedMonths.slice(0, 3).map(([month]) => monthNames[month])
const quietMonths = sortedMonths.slice(-3).map(([month]) => monthNames[month])

// 평균 여행 기간 계산 (왕복 여행 기준)
let totalDuration = 0
let tripWithDuration = 0

for (const trip of travelInfos) {
if (trip.departureDate && trip.returnDate) {
try {
const depDate = new Date(trip.departureDate)
const retDate = new Date(trip.returnDate)
const duration = (retDate.getTime() - depDate.getTime()) / (1000 _ 60 _ 60 \* 24)

        if (duration > 0 && duration < 365) { // 유효한 기간만
          totalDuration += duration
          tripWithDuration++
        }
      } catch (error) {
        // 잘못된 날짜 형식 무시
      }
    }

}

const averageTripDuration = tripWithDuration > 0 ? Math.round(totalDuration / tripWithDuration) : 0

return {
totalTrips,
totalAirlines: airlines.size,
totalDestinations: destinations.size,
mostVisitedDestinations,
preferredAirlines,
travelFrequency: {
domestic: domesticTrips,
international: internationalTrips,
averageTripsPerMonth: Math.round(averageTripsPerMonth \* 10) / 10
},
upcomingTrips: upcomingTrips.sort((a, b) =>
new Date(a.departureDate || '').getTime() - new Date(b.departureDate || '').getTime()
),
recentTrips: recentTrips.sort((a, b) =>
new Date(b.departureDate || '').getTime() - new Date(a.departureDate || '').getTime()
).slice(0, 5),
travelPattern: {
busyMonths,
quietMonths,
averageTripDuration
}
}
}

/\*\*
개인화된 여행 인사이트 생성

**특성:** `exported`

#### `generateTravelCalendar`

여행 통계 생성
/
export function generateTravelStats(travelInfos: TravelInfo[]): TravelStats {
const now = new Date()
const oneMonthFromNow = new Date(now)
oneMonthFromNow.setMonth(now.getMonth() + 1)

const sixMonthsAgo = new Date(now)
sixMonthsAgo.setMonth(now.getMonth() - 6)

const totalTrips = travelInfos.length
const destinations = new Map<string, number>()
const airlines = new Map<string, number>()
const upcomingTrips: TravelInfo[] = []
const recentTrips: TravelInfo[] = []
const monthlyTrips = new Map<string, number>()

for (const trip of travelInfos) {
// 목적지 카운트
if (trip.destination) {
destinations.set(trip.destination, (destinations.get(trip.destination) || 0) + 1)
}

    // 항공사 카운트
    if (trip.flightNumber) {
      const airlineCode = trip.flightNumber.substring(0, 2)
      airlines.set(airlineCode, (airlines.get(airlineCode) || 0) + 1)
    }

    if (trip.departureDate) {
      try {
        const departureDate = new Date(trip.departureDate)

        // 예정된 여행
        if (departureDate > now && departureDate <= oneMonthFromNow) {
          upcomingTrips.push(trip)
        }

        // 최근 여행
        if (departureDate >= sixMonthsAgo && departureDate <= now) {
          recentTrips.push(trip)
        }

        // 월별 통계
        const monthKey = `${departureDate.getFullYear()}-${(departureDate.getMonth() + 1).toString().padStart(2, '0')}`
        monthlyTrips.set(monthKey, (monthlyTrips.get(monthKey) || 0) + 1)

      } catch (error) {
        // Invalid date format
      }
    }

}

// 상위 목적지
const mostVisitedDestinations = Array.from(destinations.entries())
.map(([code, count]) => ({
code,
name: airportCodes[code as keyof typeof airportCodes] || code,
count
}))
.sort((a, b) => b.count - a.count)
.slice(0, 5)

// 선호 항공사
const preferredAirlines = Array.from(airlines.entries())
.map(([code, count]) => ({
code,
name: airlineCodes[code as keyof typeof airlineCodes] || code,
count
}))
.sort((a, b) => b.count - a.count)
.slice(0, 5)

// 여행 빈도
const domesticAirports = ['ICN', 'GMP', 'CJU', 'PUS', 'TAE'] // 한국 주요 공항
const domesticTrips = travelInfos.filter(trip =>
trip.destination && domesticAirports.includes(trip.destination)
).length
const internationalTrips = totalTrips - domesticTrips

const averageTripsPerMonth = monthlyTrips.size > 0 ?
Array.from(monthlyTrips.values()).reduce((sum, count) => sum + count, 0) / monthlyTrips.size : 0

// 여행 패턴 분석
const monthCounts = new Map<number, number>()
for (const trip of travelInfos) {
if (trip.departureDate) {
try {
const date = new Date(trip.departureDate)
const month = date.getMonth()
monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
} catch (error) {
// 잘못된 날짜 형식 무시
}
}
}

const monthNames = [
'1월', '2월', '3월', '4월', '5월', '6월',
'7월', '8월', '9월', '10월', '11월', '12월'
]

const sortedMonths = Array.from(monthCounts.entries())
.sort((a, b) => b[1] - a[1])

const busyMonths = sortedMonths.slice(0, 3).map(([month]) => monthNames[month])
const quietMonths = sortedMonths.slice(-3).map(([month]) => monthNames[month])

// 평균 여행 기간 계산 (왕복 여행 기준)
let totalDuration = 0
let tripWithDuration = 0

for (const trip of travelInfos) {
if (trip.departureDate && trip.returnDate) {
try {
const depDate = new Date(trip.departureDate)
const retDate = new Date(trip.returnDate)
const duration = (retDate.getTime() - depDate.getTime()) / (1000 _ 60 _ 60 \* 24)

        if (duration > 0 && duration < 365) { // 유효한 기간만
          totalDuration += duration
          tripWithDuration++
        }
      } catch (error) {
        // 잘못된 날짜 형식 무시
      }
    }

}

const averageTripDuration = tripWithDuration > 0 ? Math.round(totalDuration / tripWithDuration) : 0

return {
totalTrips,
totalAirlines: airlines.size,
totalDestinations: destinations.size,
mostVisitedDestinations,
preferredAirlines,
travelFrequency: {
domestic: domesticTrips,
international: internationalTrips,
averageTripsPerMonth: Math.round(averageTripsPerMonth \* 10) / 10
},
upcomingTrips: upcomingTrips.sort((a, b) =>
new Date(a.departureDate || '').getTime() - new Date(b.departureDate || '').getTime()
),
recentTrips: recentTrips.sort((a, b) =>
new Date(b.departureDate || '').getTime() - new Date(a.departureDate || '').getTime()
).slice(0, 5),
travelPattern: {
busyMonths,
quietMonths,
averageTripDuration
}
}
}

/\*\*
개인화된 여행 인사이트 생성
/
export function generateTravelInsights(stats: TravelStats, travelInfos: TravelInfo[]): TravelInsight[] {
const insights: TravelInsight[] = []
const now = new Date()

// 예정된 여행 알림
if (stats.upcomingTrips.length > 0) {
const nextTrip = stats.upcomingTrips[0]
const daysUntilTrip = Math.ceil(
(new Date(nextTrip.departureDate || '').getTime() - now.getTime()) / (1000 _ 60 _ 60 \* 24)
)

    insights.push({
      type: 'info',
      title: '다가오는 여행',
      description: `${daysUntilTrip}일 후 ${nextTrip.destination ? airportCodes[nextTrip.destination as keyof typeof airportCodes] || nextTrip.destination : '목적지'}로 출발 예정입니다.`,
      actionable: true,
      action: '체크인 준비하기'
    })

}

// 여행 빈도 분석
if (stats.travelFrequency.averageTripsPerMonth > 2) {
insights.push({
type: 'achievement',
title: '여행 애호가',
description: `월평균 ${stats.travelFrequency.averageTripsPerMonth}회 여행을 다니시는 활발한 여행자입니다!`
})
}

// 선호 항공사 분석
if (stats.preferredAirlines.length > 0) {
const topAirline = stats.preferredAirlines[0]
if (topAirline.count >= 3) {
insights.push({
type: 'tip',
title: '마일리지 최적화',
description: `${topAirline.name}을(를) 자주 이용하시네요. 마일리지 프로그램을 확인해보세요.`,
actionable: true,
action: '마일리지 조회하기'
})
}
}

// 목적지 다양성 분석
if (stats.totalDestinations >= 10) {
insights.push({
type: 'achievement',
title: '세계 여행가',
description: `${stats.totalDestinations}개 도시를 방문하셨습니다. 정말 다양한 경험을 쌓고 계시네요!`
})
}

// 계절별 여행 패턴
if (stats.travelPattern.busyMonths.length > 0) {
insights.push({
type: 'info',
title: '여행 패턴 분석',
description: `${stats.travelPattern.busyMonths.join(', ')}에 주로 여행을 다니시는 경향이 있습니다.`
})
}

// 평균 여행 기간 분석
if (stats.travelPattern.averageTripDuration > 0) {
let tripTypeDescription = ''
if (stats.travelPattern.averageTripDuration <= 3) {
tripTypeDescription = '주로 단기 여행을 선호하시네요.'
} else if (stats.travelPattern.averageTripDuration <= 7) {
tripTypeDescription = '일주일 내외의 적당한 길이 여행을 즐기시네요.'
} else {
tripTypeDescription = '장기 여행을 즐기는 여유로운 여행자시네요.'
}

    insights.push({
      type: 'info',
      title: '여행 스타일',
      description: `평균 ${stats.travelPattern.averageTripDuration}일간 여행하시며, ${tripTypeDescription}`
    })

}

// 국내/해외 여행 비율
const totalTrips = stats.travelFrequency.domestic + stats.travelFrequency.international
if (totalTrips > 0) {
const internationalRatio = Math.round((stats.travelFrequency.international / totalTrips) \* 100)

    if (internationalRatio >= 70) {
      insights.push({
        type: 'tip',
        title: '해외여행 전문가',
        description: `해외여행 비율이 ${internationalRatio}%입니다. 여행자 보험과 비자 관리에 신경쓰세요.`,
        actionable: true,
        action: '비자 현황 확인하기'
      })
    } else if (internationalRatio <= 30) {
      insights.push({
        type: 'tip',
        title: '국내여행 마니아',
        description: `국내여행을 많이 다니시네요. 숨겨진 국내 명소를 더 탐험해보세요!`
      })
    }

}

// 데이터 품질 경고
const lowConfidenceTrips = travelInfos.filter(trip => trip.confidence < 0.5).length
if (lowConfidenceTrips > 0) {
insights.push({
type: 'warning',
title: '데이터 정확성',
description: `${lowConfidenceTrips}개의 여행 정보가 불완전합니다. 수동으로 확인해보세요.`,
actionable: true,
action: '데이터 검토하기'
})
}

return insights
}

/\*\*
여행 달력 데이터 생성 (월별 뷰)

**특성:** `exported`

#### `estimateTravelCosts`

여행 통계 생성
/
export function generateTravelStats(travelInfos: TravelInfo[]): TravelStats {
const now = new Date()
const oneMonthFromNow = new Date(now)
oneMonthFromNow.setMonth(now.getMonth() + 1)

const sixMonthsAgo = new Date(now)
sixMonthsAgo.setMonth(now.getMonth() - 6)

const totalTrips = travelInfos.length
const destinations = new Map<string, number>()
const airlines = new Map<string, number>()
const upcomingTrips: TravelInfo[] = []
const recentTrips: TravelInfo[] = []
const monthlyTrips = new Map<string, number>()

for (const trip of travelInfos) {
// 목적지 카운트
if (trip.destination) {
destinations.set(trip.destination, (destinations.get(trip.destination) || 0) + 1)
}

    // 항공사 카운트
    if (trip.flightNumber) {
      const airlineCode = trip.flightNumber.substring(0, 2)
      airlines.set(airlineCode, (airlines.get(airlineCode) || 0) + 1)
    }

    if (trip.departureDate) {
      try {
        const departureDate = new Date(trip.departureDate)

        // 예정된 여행
        if (departureDate > now && departureDate <= oneMonthFromNow) {
          upcomingTrips.push(trip)
        }

        // 최근 여행
        if (departureDate >= sixMonthsAgo && departureDate <= now) {
          recentTrips.push(trip)
        }

        // 월별 통계
        const monthKey = `${departureDate.getFullYear()}-${(departureDate.getMonth() + 1).toString().padStart(2, '0')}`
        monthlyTrips.set(monthKey, (monthlyTrips.get(monthKey) || 0) + 1)

      } catch (error) {
        // Invalid date format
      }
    }

}

// 상위 목적지
const mostVisitedDestinations = Array.from(destinations.entries())
.map(([code, count]) => ({
code,
name: airportCodes[code as keyof typeof airportCodes] || code,
count
}))
.sort((a, b) => b.count - a.count)
.slice(0, 5)

// 선호 항공사
const preferredAirlines = Array.from(airlines.entries())
.map(([code, count]) => ({
code,
name: airlineCodes[code as keyof typeof airlineCodes] || code,
count
}))
.sort((a, b) => b.count - a.count)
.slice(0, 5)

// 여행 빈도
const domesticAirports = ['ICN', 'GMP', 'CJU', 'PUS', 'TAE'] // 한국 주요 공항
const domesticTrips = travelInfos.filter(trip =>
trip.destination && domesticAirports.includes(trip.destination)
).length
const internationalTrips = totalTrips - domesticTrips

const averageTripsPerMonth = monthlyTrips.size > 0 ?
Array.from(monthlyTrips.values()).reduce((sum, count) => sum + count, 0) / monthlyTrips.size : 0

// 여행 패턴 분석
const monthCounts = new Map<number, number>()
for (const trip of travelInfos) {
if (trip.departureDate) {
try {
const date = new Date(trip.departureDate)
const month = date.getMonth()
monthCounts.set(month, (monthCounts.get(month) || 0) + 1)
} catch (error) {
// 잘못된 날짜 형식 무시
}
}
}

const monthNames = [
'1월', '2월', '3월', '4월', '5월', '6월',
'7월', '8월', '9월', '10월', '11월', '12월'
]

const sortedMonths = Array.from(monthCounts.entries())
.sort((a, b) => b[1] - a[1])

const busyMonths = sortedMonths.slice(0, 3).map(([month]) => monthNames[month])
const quietMonths = sortedMonths.slice(-3).map(([month]) => monthNames[month])

// 평균 여행 기간 계산 (왕복 여행 기준)
let totalDuration = 0
let tripWithDuration = 0

for (const trip of travelInfos) {
if (trip.departureDate && trip.returnDate) {
try {
const depDate = new Date(trip.departureDate)
const retDate = new Date(trip.returnDate)
const duration = (retDate.getTime() - depDate.getTime()) / (1000 _ 60 _ 60 \* 24)

        if (duration > 0 && duration < 365) { // 유효한 기간만
          totalDuration += duration
          tripWithDuration++
        }
      } catch (error) {
        // 잘못된 날짜 형식 무시
      }
    }

}

const averageTripDuration = tripWithDuration > 0 ? Math.round(totalDuration / tripWithDuration) : 0

return {
totalTrips,
totalAirlines: airlines.size,
totalDestinations: destinations.size,
mostVisitedDestinations,
preferredAirlines,
travelFrequency: {
domestic: domesticTrips,
international: internationalTrips,
averageTripsPerMonth: Math.round(averageTripsPerMonth \* 10) / 10
},
upcomingTrips: upcomingTrips.sort((a, b) =>
new Date(a.departureDate || '').getTime() - new Date(b.departureDate || '').getTime()
),
recentTrips: recentTrips.sort((a, b) =>
new Date(b.departureDate || '').getTime() - new Date(a.departureDate || '').getTime()
).slice(0, 5),
travelPattern: {
busyMonths,
quietMonths,
averageTripDuration
}
}
}

/\*\*
개인화된 여행 인사이트 생성
/
export function generateTravelInsights(stats: TravelStats, travelInfos: TravelInfo[]): TravelInsight[] {
const insights: TravelInsight[] = []
const now = new Date()

// 예정된 여행 알림
if (stats.upcomingTrips.length > 0) {
const nextTrip = stats.upcomingTrips[0]
const daysUntilTrip = Math.ceil(
(new Date(nextTrip.departureDate || '').getTime() - now.getTime()) / (1000 _ 60 _ 60 \* 24)
)

    insights.push({
      type: 'info',
      title: '다가오는 여행',
      description: `${daysUntilTrip}일 후 ${nextTrip.destination ? airportCodes[nextTrip.destination as keyof typeof airportCodes] || nextTrip.destination : '목적지'}로 출발 예정입니다.`,
      actionable: true,
      action: '체크인 준비하기'
    })

}

// 여행 빈도 분석
if (stats.travelFrequency.averageTripsPerMonth > 2) {
insights.push({
type: 'achievement',
title: '여행 애호가',
description: `월평균 ${stats.travelFrequency.averageTripsPerMonth}회 여행을 다니시는 활발한 여행자입니다!`
})
}

// 선호 항공사 분석
if (stats.preferredAirlines.length > 0) {
const topAirline = stats.preferredAirlines[0]
if (topAirline.count >= 3) {
insights.push({
type: 'tip',
title: '마일리지 최적화',
description: `${topAirline.name}을(를) 자주 이용하시네요. 마일리지 프로그램을 확인해보세요.`,
actionable: true,
action: '마일리지 조회하기'
})
}
}

// 목적지 다양성 분석
if (stats.totalDestinations >= 10) {
insights.push({
type: 'achievement',
title: '세계 여행가',
description: `${stats.totalDestinations}개 도시를 방문하셨습니다. 정말 다양한 경험을 쌓고 계시네요!`
})
}

// 계절별 여행 패턴
if (stats.travelPattern.busyMonths.length > 0) {
insights.push({
type: 'info',
title: '여행 패턴 분석',
description: `${stats.travelPattern.busyMonths.join(', ')}에 주로 여행을 다니시는 경향이 있습니다.`
})
}

// 평균 여행 기간 분석
if (stats.travelPattern.averageTripDuration > 0) {
let tripTypeDescription = ''
if (stats.travelPattern.averageTripDuration <= 3) {
tripTypeDescription = '주로 단기 여행을 선호하시네요.'
} else if (stats.travelPattern.averageTripDuration <= 7) {
tripTypeDescription = '일주일 내외의 적당한 길이 여행을 즐기시네요.'
} else {
tripTypeDescription = '장기 여행을 즐기는 여유로운 여행자시네요.'
}

    insights.push({
      type: 'info',
      title: '여행 스타일',
      description: `평균 ${stats.travelPattern.averageTripDuration}일간 여행하시며, ${tripTypeDescription}`
    })

}

// 국내/해외 여행 비율
const totalTrips = stats.travelFrequency.domestic + stats.travelFrequency.international
if (totalTrips > 0) {
const internationalRatio = Math.round((stats.travelFrequency.international / totalTrips) \* 100)

    if (internationalRatio >= 70) {
      insights.push({
        type: 'tip',
        title: '해외여행 전문가',
        description: `해외여행 비율이 ${internationalRatio}%입니다. 여행자 보험과 비자 관리에 신경쓰세요.`,
        actionable: true,
        action: '비자 현황 확인하기'
      })
    } else if (internationalRatio <= 30) {
      insights.push({
        type: 'tip',
        title: '국내여행 마니아',
        description: `국내여행을 많이 다니시네요. 숨겨진 국내 명소를 더 탐험해보세요!`
      })
    }

}

// 데이터 품질 경고
const lowConfidenceTrips = travelInfos.filter(trip => trip.confidence < 0.5).length
if (lowConfidenceTrips > 0) {
insights.push({
type: 'warning',
title: '데이터 정확성',
description: `${lowConfidenceTrips}개의 여행 정보가 불완전합니다. 수동으로 확인해보세요.`,
actionable: true,
action: '데이터 검토하기'
})
}

return insights
}

/\*\*
여행 달력 데이터 생성 (월별 뷰)
/
export function generateTravelCalendar(travelInfos: TravelInfo[], year?: number, month?: number) {
const targetDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()))
const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)

const calendarEvents = []

for (const trip of travelInfos) {
if (trip.departureDate) {
try {
const depDate = new Date(trip.departureDate)

        // 해당 월에 포함되는 여행만 필터링
        if (depDate >= startOfMonth && depDate <= endOfMonth) {
          calendarEvents.push({
            date: depDate.toISOString().split('T')[0],
            type: 'departure',
            title: `출발: ${trip.destination ? airportCodes[trip.destination as keyof typeof airportCodes] || trip.destination : '목적지 미상'}`,
            flightNumber: trip.flightNumber,
            confidence: trip.confidence,
            trip
          })
        }

        // 귀국 날짜도 추가
        if (trip.returnDate) {
          const retDate = new Date(trip.returnDate)
          if (retDate >= startOfMonth && retDate <= endOfMonth) {
            calendarEvents.push({
              date: retDate.toISOString().split('T')[0],
              type: 'return',
              title: `귀국: ${trip.departure ? airportCodes[trip.departure as keyof typeof airportCodes] || trip.departure : '출발지 미상'}`,
              flightNumber: trip.flightNumber,
              confidence: trip.confidence,
              trip
            })
          }
        }
      } catch (error) {
        // Invalid date in trip
      }
    }

}

return calendarEvents.sort((a, b) => a.date.localeCompare(b.date))
}

/\*\*
여행 비용 예측 (기본적인 추정)

**특성:** `exported`

### 🔗 Interfaces

#### `TravelStats`

**특성:** `exported`

#### `TravelInsight`

**특성:** `exported`

## gmail-middleware.ts

**파일 경로:** `lib/gmail-middleware.ts`

**파일 정보:**

- 📏 크기: 5129 bytes
- 📄 라인 수: 221
- 🔧 함수: 5개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `checkRateLimit`
- `async`
- `getRateLimitStatus`
- `sanitizeGmailResponse`

### 🔧 Functions

#### `checkRateLimit`

사용자별 속도 제한을 확인합니다.
@param userId 사용자 ID
@param config 속도 제한 설정

**특성:** `exported`

#### `withGmailAuth`

사용자별 속도 제한을 확인합니다.
@param userId 사용자 ID
@param config 속도 제한 설정
/
export function checkRateLimit(userId: string, config: RateLimitConfig): boolean {
const now = Date.now()
const key = `gmail_${userId}`

const existing = rateLimitStore.get(key)

if (!existing || now > existing.resetTime) {
// 새로운 윈도우 시작
rateLimitStore.set(key, {
count: 1,
resetTime: now + config.windowMs
})
return true
}

if (existing.count >= config.maxRequests) {
// 속도 제한 초과
return false
}

// 요청 카운트 증가
existing.count++
rateLimitStore.set(key, existing)
return true
}

/\*\*
Gmail API 요청을 위한 공통 미들웨어

- 인증 확인
- 속도 제한
- 에러 처리

**특성:** `exported`, `async`

#### `getRateLimitStatus`

사용자별 속도 제한을 확인합니다.
@param userId 사용자 ID
@param config 속도 제한 설정
/
export function checkRateLimit(userId: string, config: RateLimitConfig): boolean {
const now = Date.now()
const key = `gmail_${userId}`

const existing = rateLimitStore.get(key)

if (!existing || now > existing.resetTime) {
// 새로운 윈도우 시작
rateLimitStore.set(key, {
count: 1,
resetTime: now + config.windowMs
})
return true
}

if (existing.count >= config.maxRequests) {
// 속도 제한 초과
return false
}

// 요청 카운트 증가
existing.count++
rateLimitStore.set(key, existing)
return true
}

/\*\*
Gmail API 요청을 위한 공통 미들웨어

- 인증 확인
- 속도 제한
- 에러 처리
  /
  export async function withGmailAuth(
  request: NextRequest,
  handler: (session: any, request: NextRequest) => Promise<NextResponse>
  ) {
  try {
  // 1. 세션 확인
  const session = await getServerSession(authOptions)
  if (!session) {
  return NextResponse.json(
  {
  error: 'Unauthorized',
  message: '로그인이 필요합니다. Google 계정으로 다시 로그인해주세요.'
  },
  { status: 401 }
  )
  }

      // 2. 속도 제한 확인
      const rateLimitConfig: RateLimitConfig = {
        windowMs: 60 * 1000, // 1분
        maxRequests: 30 // 분당 30회
      }

      if (!checkRateLimit(session.user?.id || '', rateLimitConfig)) {
        return NextResponse.json(
          {
            error: 'Rate Limit Exceeded',
            message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
          },
          { status: 429 }
        )
      }

      // 3. 핸들러 실행
      return await handler(session, request)

  } catch (error) {
  // Gmail middleware error
  // Gmail API 에러 처리
  if (error && typeof error === 'object' && 'code' in error) {
  const gmailError = error as any

        switch (gmailError.code) {
          case 401:
            return NextResponse.json(
              {
                error: 'Gmail Authorization Failed',
                message: 'Gmail 권한이 만료되었습니다. 다시 로그인해주세요.'
              },
              { status: 401 }
            )

          case 403:
            return NextResponse.json(
              {
                error: 'Gmail Permission Denied',
                message: 'Gmail 접근 권한이 없습니다. 권한을 확인해주세요.'
              },
              { status: 403 }
            )

          case 429:
            return NextResponse.json(
              {
                error: 'Gmail Rate Limit',
                message: 'Gmail API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
              },
              { status: 429 }
            )

          case 500:
            return NextResponse.json(
              {
                error: 'Gmail Service Error',
                message: 'Gmail 서비스에 일시적인 문제가 발생했습니다.'
              },
              { status: 500 }
            )

          default:
            return NextResponse.json(
              {
                error: 'Gmail API Error',
                message: 'Gmail API 호출 중 오류가 발생했습니다.'
              },
              { status: 500 }
            )
        }
      }

      // 일반 에러
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: '서버 내부 오류가 발생했습니다.'
        },
        { status: 500 }
      )

  }
  }

/\*\*
속도 제한 상태를 확인합니다.
@param userId 사용자 ID

**특성:** `exported`

#### `sanitizeGmailResponse`

사용자별 속도 제한을 확인합니다.
@param userId 사용자 ID
@param config 속도 제한 설정
/
export function checkRateLimit(userId: string, config: RateLimitConfig): boolean {
const now = Date.now()
const key = `gmail_${userId}`

const existing = rateLimitStore.get(key)

if (!existing || now > existing.resetTime) {
// 새로운 윈도우 시작
rateLimitStore.set(key, {
count: 1,
resetTime: now + config.windowMs
})
return true
}

if (existing.count >= config.maxRequests) {
// 속도 제한 초과
return false
}

// 요청 카운트 증가
existing.count++
rateLimitStore.set(key, existing)
return true
}

/\*\*
Gmail API 요청을 위한 공통 미들웨어

- 인증 확인
- 속도 제한
- 에러 처리
  /
  export async function withGmailAuth(
  request: NextRequest,
  handler: (session: any, request: NextRequest) => Promise<NextResponse>
  ) {
  try {
  // 1. 세션 확인
  const session = await getServerSession(authOptions)
  if (!session) {
  return NextResponse.json(
  {
  error: 'Unauthorized',
  message: '로그인이 필요합니다. Google 계정으로 다시 로그인해주세요.'
  },
  { status: 401 }
  )
  }

      // 2. 속도 제한 확인
      const rateLimitConfig: RateLimitConfig = {
        windowMs: 60 * 1000, // 1분
        maxRequests: 30 // 분당 30회
      }

      if (!checkRateLimit(session.user?.id || '', rateLimitConfig)) {
        return NextResponse.json(
          {
            error: 'Rate Limit Exceeded',
            message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
          },
          { status: 429 }
        )
      }

      // 3. 핸들러 실행
      return await handler(session, request)

  } catch (error) {
  // Gmail middleware error
  // Gmail API 에러 처리
  if (error && typeof error === 'object' && 'code' in error) {
  const gmailError = error as any

        switch (gmailError.code) {
          case 401:
            return NextResponse.json(
              {
                error: 'Gmail Authorization Failed',
                message: 'Gmail 권한이 만료되었습니다. 다시 로그인해주세요.'
              },
              { status: 401 }
            )

          case 403:
            return NextResponse.json(
              {
                error: 'Gmail Permission Denied',
                message: 'Gmail 접근 권한이 없습니다. 권한을 확인해주세요.'
              },
              { status: 403 }
            )

          case 429:
            return NextResponse.json(
              {
                error: 'Gmail Rate Limit',
                message: 'Gmail API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
              },
              { status: 429 }
            )

          case 500:
            return NextResponse.json(
              {
                error: 'Gmail Service Error',
                message: 'Gmail 서비스에 일시적인 문제가 발생했습니다.'
              },
              { status: 500 }
            )

          default:
            return NextResponse.json(
              {
                error: 'Gmail API Error',
                message: 'Gmail API 호출 중 오류가 발생했습니다.'
              },
              { status: 500 }
            )
        }
      }

      // 일반 에러
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: '서버 내부 오류가 발생했습니다.'
        },
        { status: 500 }
      )

  }
  }

/\*\*
속도 제한 상태를 확인합니다.
@param userId 사용자 ID
/
export function getRateLimitStatus(userId: string) {
const key = `gmail_${userId}`
const existing = rateLimitStore.get(key)
const now = Date.now()

if (!existing || now > existing.resetTime) {
return {
remaining: 30,
resetTime: now + 60 \* 1000,
total: 30
}
}

return {
remaining: Math.max(0, 30 - existing.count),
resetTime: existing.resetTime,
total: 30
}
}

/\*\*
Gmail API 응답을 정리합니다 (개인정보 보호)
@param data 원본 데이터

**특성:** `exported`

#### `maskEmail`

### 🔗 Interfaces

#### `RateLimitConfig`

## gmail.ts

**파일 경로:** `lib/gmail.ts`

**파일 정보:**

- 📏 크기: 14078 bytes
- 📄 라인 수: 516
- 🔧 함수: 8개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `EmailMessage`
- `TravelInfo`
- `createGmailClient`
- `async`
- `extractTravelInfo`

### 🔧 Functions

#### `createGmailClient`

Gmail API 클라이언트를 생성합니다.
@param accessToken 사용자의 Google 액세스 토큰

**특성:** `exported`

#### `searchTravelEmails`

Gmail API 클라이언트를 생성합니다.
@param accessToken 사용자의 Google 액세스 토큰
/
export function createGmailClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.gmail({ version: 'v1', auth: oauth2Client })
}

/\*\*
여행 관련 이메일을 검색합니다.
@param accessToken 사용자의 Google 액세스 토큰
@param maxResults 최대 결과 수 (기본값: 50)

**특성:** `exported`, `async`

#### `extractTravelInfo`

Gmail API 클라이언트를 생성합니다.
@param accessToken 사용자의 Google 액세스 토큰
/
export function createGmailClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.gmail({ version: 'v1', auth: oauth2Client })
}

/\*\*
여행 관련 이메일을 검색합니다.
@param accessToken 사용자의 Google 액세스 토큰
@param maxResults 최대 결과 수 (기본값: 50)
/
export async function searchTravelEmails(
accessToken: string,
maxResults: number = 50
): Promise<EmailMessage[]> {
try {
const gmail = createGmailClient(accessToken)

      // 고급 여행 관련 키워드로 검색 (한국어/영어 지원)
    const searchQuery = [
      // 항공편 관련
      'subject:(flight OR 항공편 OR 항공권 OR eticket OR "boarding pass" OR "탑승권")',
      'subject:(booking OR reservation OR confirmation OR 예약 OR 확인)',
      'subject:(itinerary OR schedule OR 일정)',

      // 호텔 관련
      'subject:(hotel OR accommodation OR 호텔 OR 숙박)',
      'subject:("check-in" OR "check-out" OR 체크인 OR 체크아웃)',

      // 주요 항공사
      'from:(koreanair.com OR flyasiana.com OR jejuair.net)',
      'from:(united.com OR delta.com OR jal.com OR ana.co.jp)',

      // 주요 예약 플랫폼
      'from:(booking.com OR expedia.com OR agoda.com OR hotels.com)',
      'from:(kayak.com OR priceline.com OR orbitz.com)',
      'from:(airbnb.com OR vrbo.com)',

      // 렌터카
      'from:(hertz.com OR avis.com OR enterprise.com OR budget.com)',

      // 여행사
      'from:(expedia.com OR travelocity.com OR orbitz.com)',

      // 일반적인 여행 관련 키워드
      'subject:(trip OR travel OR vacation OR 여행 OR 출장)',
      'subject:(departure OR arrival OR 출발 OR 도착)'
    ].join(' OR ')

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults
    })

    if (!response.data.messages) {
      return []
    }

    // 각 메시지의 상세 정보를 가져오기
    const messages: EmailMessage[] = []

    for (const message of response.data.messages.slice(0, maxResults)) {
      try {
        const messageDetail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        })

        const headers = messageDetail.data.payload?.headers || []
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject'
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender'
        const to = headers.find(h => h.name === 'To')?.value || 'Unknown Recipient'
        const date = headers.find(h => h.name === 'Date')?.value || 'Unknown Date'

        // 이메일 본문 추출
        let body = ''
        const payload = messageDetail.data.payload

        if (payload?.parts) {
          // 멀티파트 메시지
          for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body += Buffer.from(part.body.data, 'base64').toString('utf-8')
            }
          }
        } else if (payload?.body?.data) {
          // 단일 파트 메시지
          body = Buffer.from(payload.body.data, 'base64').toString('utf-8')
        }

        messages.push({
          id: message.id!,
          subject,
          from,
          to,
          date,
          body,
          snippet: messageDetail.data.snippet || ''
        })
      } catch (error) {
        // Error fetching message
        // 개별 메시지 오류는 건너뛰고 계속 진행
      }
    }

    return messages

} catch (error) {
// Error searching travel emails
throw new Error('Gmail API 요청 중 오류가 발생했습니다.')
}
}

/\*\*
고급 여행 정보 추출 함수
@param email 이메일 메시지

**특성:** `exported`

#### `extractSpecializedInfo`

Gmail API 클라이언트를 생성합니다.
@param accessToken 사용자의 Google 액세스 토큰
/
export function createGmailClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.gmail({ version: 'v1', auth: oauth2Client })
}

/\*\*
여행 관련 이메일을 검색합니다.
@param accessToken 사용자의 Google 액세스 토큰
@param maxResults 최대 결과 수 (기본값: 50)
/
export async function searchTravelEmails(
accessToken: string,
maxResults: number = 50
): Promise<EmailMessage[]> {
try {
const gmail = createGmailClient(accessToken)

      // 고급 여행 관련 키워드로 검색 (한국어/영어 지원)
    const searchQuery = [
      // 항공편 관련
      'subject:(flight OR 항공편 OR 항공권 OR eticket OR "boarding pass" OR "탑승권")',
      'subject:(booking OR reservation OR confirmation OR 예약 OR 확인)',
      'subject:(itinerary OR schedule OR 일정)',

      // 호텔 관련
      'subject:(hotel OR accommodation OR 호텔 OR 숙박)',
      'subject:("check-in" OR "check-out" OR 체크인 OR 체크아웃)',

      // 주요 항공사
      'from:(koreanair.com OR flyasiana.com OR jejuair.net)',
      'from:(united.com OR delta.com OR jal.com OR ana.co.jp)',

      // 주요 예약 플랫폼
      'from:(booking.com OR expedia.com OR agoda.com OR hotels.com)',
      'from:(kayak.com OR priceline.com OR orbitz.com)',
      'from:(airbnb.com OR vrbo.com)',

      // 렌터카
      'from:(hertz.com OR avis.com OR enterprise.com OR budget.com)',

      // 여행사
      'from:(expedia.com OR travelocity.com OR orbitz.com)',

      // 일반적인 여행 관련 키워드
      'subject:(trip OR travel OR vacation OR 여행 OR 출장)',
      'subject:(departure OR arrival OR 출발 OR 도착)'
    ].join(' OR ')

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults
    })

    if (!response.data.messages) {
      return []
    }

    // 각 메시지의 상세 정보를 가져오기
    const messages: EmailMessage[] = []

    for (const message of response.data.messages.slice(0, maxResults)) {
      try {
        const messageDetail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        })

        const headers = messageDetail.data.payload?.headers || []
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject'
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender'
        const to = headers.find(h => h.name === 'To')?.value || 'Unknown Recipient'
        const date = headers.find(h => h.name === 'Date')?.value || 'Unknown Date'

        // 이메일 본문 추출
        let body = ''
        const payload = messageDetail.data.payload

        if (payload?.parts) {
          // 멀티파트 메시지
          for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body += Buffer.from(part.body.data, 'base64').toString('utf-8')
            }
          }
        } else if (payload?.body?.data) {
          // 단일 파트 메시지
          body = Buffer.from(payload.body.data, 'base64').toString('utf-8')
        }

        messages.push({
          id: message.id!,
          subject,
          from,
          to,
          date,
          body,
          snippet: messageDetail.data.snippet || ''
        })
      } catch (error) {
        // Error fetching message
        // 개별 메시지 오류는 건너뛰고 계속 진행
      }
    }

    return messages

} catch (error) {
// Error searching travel emails
throw new Error('Gmail API 요청 중 오류가 발생했습니다.')
}
}

/\*\*
고급 여행 정보 추출 함수
@param email 이메일 메시지
/
export function extractTravelInfo(email: EmailMessage): TravelInfo | null {
const fullText = `${email.subject} ${email.body} ${email.snippet}`
const normalizedText = fullText.toLowerCase()

// 기본 여행 정보 객체
const travelInfo: TravelInfo = {
emailId: email.id,
subject: email.subject,
from: email.from,
confidence: 0,
extractedData: {
dates: [],
airports: [],
flights: [],
bookingCodes: [],
matchedPatterns: []
}
}

// 패턴 매칭으로 이메일 카테고리 및 가중치 결정
let matchedPattern: TravelEmailPattern | null = null
let maxWeight = 0

for (const pattern of allTravelPatterns) {
let patternScore = 0

    // 발신자 패턴 확인
    for (const senderPattern of pattern.senderPatterns) {
      if (senderPattern.test(email.from)) {
        patternScore += 0.4
        travelInfo.extractedData.matchedPatterns.push(`sender:${pattern.name}`)
        break
      }
    }

    // 제목 패턴 확인
    for (const subjectPattern of pattern.subjectPatterns) {
      if (subjectPattern.test(email.subject)) {
        patternScore += 0.3
        travelInfo.extractedData.matchedPatterns.push(`subject:${pattern.name}`)
        break
      }
    }

    // 본문 패턴 확인
    for (const bodyPattern of pattern.bodyPatterns) {
      if (bodyPattern.test(normalizedText)) {
        patternScore += 0.3
        travelInfo.extractedData.matchedPatterns.push(`body:${pattern.name}`)
        break
      }
    }

    const weightedScore = patternScore * pattern.weight
    if (weightedScore > maxWeight) {
      maxWeight = weightedScore
      matchedPattern = pattern
      travelInfo.category = pattern.category
    }

}

// 기본 신뢰도 설정
travelInfo.confidence = maxWeight

// 특화된 정보 추출
if (matchedPattern?.extractors) {
extractSpecializedInfo(fullText, normalizedText, matchedPattern, travelInfo)
}

// 일반적인 정보 추출 (모든 이메일에 적용)
extractGeneralTravelInfo(fullText, normalizedText, travelInfo)

// 추출된 데이터 기반 신뢰도 조정
adjustConfidenceBasedOnExtractedData(travelInfo)

// 신뢰도가 너무 낮으면 null 반환
if (travelInfo.confidence < 0.2) {
return null
}

return travelInfo
}

/\*\*
특화된 패턴 기반 정보 추출

#### `extractGeneralTravelInfo`

Gmail API 클라이언트를 생성합니다.
@param accessToken 사용자의 Google 액세스 토큰
/
export function createGmailClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.gmail({ version: 'v1', auth: oauth2Client })
}

/\*\*
여행 관련 이메일을 검색합니다.
@param accessToken 사용자의 Google 액세스 토큰
@param maxResults 최대 결과 수 (기본값: 50)
/
export async function searchTravelEmails(
accessToken: string,
maxResults: number = 50
): Promise<EmailMessage[]> {
try {
const gmail = createGmailClient(accessToken)

      // 고급 여행 관련 키워드로 검색 (한국어/영어 지원)
    const searchQuery = [
      // 항공편 관련
      'subject:(flight OR 항공편 OR 항공권 OR eticket OR "boarding pass" OR "탑승권")',
      'subject:(booking OR reservation OR confirmation OR 예약 OR 확인)',
      'subject:(itinerary OR schedule OR 일정)',

      // 호텔 관련
      'subject:(hotel OR accommodation OR 호텔 OR 숙박)',
      'subject:("check-in" OR "check-out" OR 체크인 OR 체크아웃)',

      // 주요 항공사
      'from:(koreanair.com OR flyasiana.com OR jejuair.net)',
      'from:(united.com OR delta.com OR jal.com OR ana.co.jp)',

      // 주요 예약 플랫폼
      'from:(booking.com OR expedia.com OR agoda.com OR hotels.com)',
      'from:(kayak.com OR priceline.com OR orbitz.com)',
      'from:(airbnb.com OR vrbo.com)',

      // 렌터카
      'from:(hertz.com OR avis.com OR enterprise.com OR budget.com)',

      // 여행사
      'from:(expedia.com OR travelocity.com OR orbitz.com)',

      // 일반적인 여행 관련 키워드
      'subject:(trip OR travel OR vacation OR 여행 OR 출장)',
      'subject:(departure OR arrival OR 출발 OR 도착)'
    ].join(' OR ')

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults
    })

    if (!response.data.messages) {
      return []
    }

    // 각 메시지의 상세 정보를 가져오기
    const messages: EmailMessage[] = []

    for (const message of response.data.messages.slice(0, maxResults)) {
      try {
        const messageDetail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        })

        const headers = messageDetail.data.payload?.headers || []
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject'
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender'
        const to = headers.find(h => h.name === 'To')?.value || 'Unknown Recipient'
        const date = headers.find(h => h.name === 'Date')?.value || 'Unknown Date'

        // 이메일 본문 추출
        let body = ''
        const payload = messageDetail.data.payload

        if (payload?.parts) {
          // 멀티파트 메시지
          for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body += Buffer.from(part.body.data, 'base64').toString('utf-8')
            }
          }
        } else if (payload?.body?.data) {
          // 단일 파트 메시지
          body = Buffer.from(payload.body.data, 'base64').toString('utf-8')
        }

        messages.push({
          id: message.id!,
          subject,
          from,
          to,
          date,
          body,
          snippet: messageDetail.data.snippet || ''
        })
      } catch (error) {
        // Error fetching message
        // 개별 메시지 오류는 건너뛰고 계속 진행
      }
    }

    return messages

} catch (error) {
// Error searching travel emails
throw new Error('Gmail API 요청 중 오류가 발생했습니다.')
}
}

/\*\*
고급 여행 정보 추출 함수
@param email 이메일 메시지
/
export function extractTravelInfo(email: EmailMessage): TravelInfo | null {
const fullText = `${email.subject} ${email.body} ${email.snippet}`
const normalizedText = fullText.toLowerCase()

// 기본 여행 정보 객체
const travelInfo: TravelInfo = {
emailId: email.id,
subject: email.subject,
from: email.from,
confidence: 0,
extractedData: {
dates: [],
airports: [],
flights: [],
bookingCodes: [],
matchedPatterns: []
}
}

// 패턴 매칭으로 이메일 카테고리 및 가중치 결정
let matchedPattern: TravelEmailPattern | null = null
let maxWeight = 0

for (const pattern of allTravelPatterns) {
let patternScore = 0

    // 발신자 패턴 확인
    for (const senderPattern of pattern.senderPatterns) {
      if (senderPattern.test(email.from)) {
        patternScore += 0.4
        travelInfo.extractedData.matchedPatterns.push(`sender:${pattern.name}`)
        break
      }
    }

    // 제목 패턴 확인
    for (const subjectPattern of pattern.subjectPatterns) {
      if (subjectPattern.test(email.subject)) {
        patternScore += 0.3
        travelInfo.extractedData.matchedPatterns.push(`subject:${pattern.name}`)
        break
      }
    }

    // 본문 패턴 확인
    for (const bodyPattern of pattern.bodyPatterns) {
      if (bodyPattern.test(normalizedText)) {
        patternScore += 0.3
        travelInfo.extractedData.matchedPatterns.push(`body:${pattern.name}`)
        break
      }
    }

    const weightedScore = patternScore * pattern.weight
    if (weightedScore > maxWeight) {
      maxWeight = weightedScore
      matchedPattern = pattern
      travelInfo.category = pattern.category
    }

}

// 기본 신뢰도 설정
travelInfo.confidence = maxWeight

// 특화된 정보 추출
if (matchedPattern?.extractors) {
extractSpecializedInfo(fullText, normalizedText, matchedPattern, travelInfo)
}

// 일반적인 정보 추출 (모든 이메일에 적용)
extractGeneralTravelInfo(fullText, normalizedText, travelInfo)

// 추출된 데이터 기반 신뢰도 조정
adjustConfidenceBasedOnExtractedData(travelInfo)

// 신뢰도가 너무 낮으면 null 반환
if (travelInfo.confidence < 0.2) {
return null
}

return travelInfo
}

/\*\*
특화된 패턴 기반 정보 추출
/
function extractSpecializedInfo(
fullText: string,
normalizedText: string,
pattern: TravelEmailPattern,
travelInfo: TravelInfo
) {
const extractors = pattern.extractors

// 항공편 번호 추출
if (extractors.flights) {
for (const flightPattern of extractors.flights) {
const matches = fullText.match(flightPattern)
if (matches) {
travelInfo.extractedData.flights.push(...matches.map(m => m.toUpperCase()))
if (!travelInfo.flightNumber) {
travelInfo.flightNumber = matches[0].toUpperCase()
}
}
}
}

// 예약 번호 추출
if (extractors.bookingReference) {
for (const bookingPattern of extractors.bookingReference) {
const matches = fullText.match(bookingPattern)
if (matches && matches.length >= 2) {
travelInfo.extractedData.bookingCodes.push(matches[1])
if (!travelInfo.bookingReference) {
travelInfo.bookingReference = matches[1]
}
}
}
}

// 공항 코드 추출
if (extractors.airports) {
for (const airportPattern of extractors.airports) {
const matches = fullText.match(airportPattern)
if (matches) {
const airports = matches.filter(code => code in airportCodes)
travelInfo.extractedData.airports.push(...airports)
if (airports.length >= 2 && !travelInfo.departure) {
travelInfo.departure = airports[0]
travelInfo.destination = airports[1]
}
}
}
}

// 날짜 추출
if (extractors.dates) {
for (const datePattern of extractors.dates) {
const matches = fullText.match(datePattern)
if (matches) {
travelInfo.extractedData.dates.push(...matches)
}
}
}
}

/\*\*
일반적인 여행 정보 추출 (모든 이메일에 적용)

#### `adjustConfidenceBasedOnExtractedData`

Gmail API 클라이언트를 생성합니다.
@param accessToken 사용자의 Google 액세스 토큰
/
export function createGmailClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.gmail({ version: 'v1', auth: oauth2Client })
}

/\*\*
여행 관련 이메일을 검색합니다.
@param accessToken 사용자의 Google 액세스 토큰
@param maxResults 최대 결과 수 (기본값: 50)
/
export async function searchTravelEmails(
accessToken: string,
maxResults: number = 50
): Promise<EmailMessage[]> {
try {
const gmail = createGmailClient(accessToken)

      // 고급 여행 관련 키워드로 검색 (한국어/영어 지원)
    const searchQuery = [
      // 항공편 관련
      'subject:(flight OR 항공편 OR 항공권 OR eticket OR "boarding pass" OR "탑승권")',
      'subject:(booking OR reservation OR confirmation OR 예약 OR 확인)',
      'subject:(itinerary OR schedule OR 일정)',

      // 호텔 관련
      'subject:(hotel OR accommodation OR 호텔 OR 숙박)',
      'subject:("check-in" OR "check-out" OR 체크인 OR 체크아웃)',

      // 주요 항공사
      'from:(koreanair.com OR flyasiana.com OR jejuair.net)',
      'from:(united.com OR delta.com OR jal.com OR ana.co.jp)',

      // 주요 예약 플랫폼
      'from:(booking.com OR expedia.com OR agoda.com OR hotels.com)',
      'from:(kayak.com OR priceline.com OR orbitz.com)',
      'from:(airbnb.com OR vrbo.com)',

      // 렌터카
      'from:(hertz.com OR avis.com OR enterprise.com OR budget.com)',

      // 여행사
      'from:(expedia.com OR travelocity.com OR orbitz.com)',

      // 일반적인 여행 관련 키워드
      'subject:(trip OR travel OR vacation OR 여행 OR 출장)',
      'subject:(departure OR arrival OR 출발 OR 도착)'
    ].join(' OR ')

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults
    })

    if (!response.data.messages) {
      return []
    }

    // 각 메시지의 상세 정보를 가져오기
    const messages: EmailMessage[] = []

    for (const message of response.data.messages.slice(0, maxResults)) {
      try {
        const messageDetail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        })

        const headers = messageDetail.data.payload?.headers || []
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject'
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender'
        const to = headers.find(h => h.name === 'To')?.value || 'Unknown Recipient'
        const date = headers.find(h => h.name === 'Date')?.value || 'Unknown Date'

        // 이메일 본문 추출
        let body = ''
        const payload = messageDetail.data.payload

        if (payload?.parts) {
          // 멀티파트 메시지
          for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body += Buffer.from(part.body.data, 'base64').toString('utf-8')
            }
          }
        } else if (payload?.body?.data) {
          // 단일 파트 메시지
          body = Buffer.from(payload.body.data, 'base64').toString('utf-8')
        }

        messages.push({
          id: message.id!,
          subject,
          from,
          to,
          date,
          body,
          snippet: messageDetail.data.snippet || ''
        })
      } catch (error) {
        // Error fetching message
        // 개별 메시지 오류는 건너뛰고 계속 진행
      }
    }

    return messages

} catch (error) {
// Error searching travel emails
throw new Error('Gmail API 요청 중 오류가 발생했습니다.')
}
}

/\*\*
고급 여행 정보 추출 함수
@param email 이메일 메시지
/
export function extractTravelInfo(email: EmailMessage): TravelInfo | null {
const fullText = `${email.subject} ${email.body} ${email.snippet}`
const normalizedText = fullText.toLowerCase()

// 기본 여행 정보 객체
const travelInfo: TravelInfo = {
emailId: email.id,
subject: email.subject,
from: email.from,
confidence: 0,
extractedData: {
dates: [],
airports: [],
flights: [],
bookingCodes: [],
matchedPatterns: []
}
}

// 패턴 매칭으로 이메일 카테고리 및 가중치 결정
let matchedPattern: TravelEmailPattern | null = null
let maxWeight = 0

for (const pattern of allTravelPatterns) {
let patternScore = 0

    // 발신자 패턴 확인
    for (const senderPattern of pattern.senderPatterns) {
      if (senderPattern.test(email.from)) {
        patternScore += 0.4
        travelInfo.extractedData.matchedPatterns.push(`sender:${pattern.name}`)
        break
      }
    }

    // 제목 패턴 확인
    for (const subjectPattern of pattern.subjectPatterns) {
      if (subjectPattern.test(email.subject)) {
        patternScore += 0.3
        travelInfo.extractedData.matchedPatterns.push(`subject:${pattern.name}`)
        break
      }
    }

    // 본문 패턴 확인
    for (const bodyPattern of pattern.bodyPatterns) {
      if (bodyPattern.test(normalizedText)) {
        patternScore += 0.3
        travelInfo.extractedData.matchedPatterns.push(`body:${pattern.name}`)
        break
      }
    }

    const weightedScore = patternScore * pattern.weight
    if (weightedScore > maxWeight) {
      maxWeight = weightedScore
      matchedPattern = pattern
      travelInfo.category = pattern.category
    }

}

// 기본 신뢰도 설정
travelInfo.confidence = maxWeight

// 특화된 정보 추출
if (matchedPattern?.extractors) {
extractSpecializedInfo(fullText, normalizedText, matchedPattern, travelInfo)
}

// 일반적인 정보 추출 (모든 이메일에 적용)
extractGeneralTravelInfo(fullText, normalizedText, travelInfo)

// 추출된 데이터 기반 신뢰도 조정
adjustConfidenceBasedOnExtractedData(travelInfo)

// 신뢰도가 너무 낮으면 null 반환
if (travelInfo.confidence < 0.2) {
return null
}

return travelInfo
}

/\*\*
특화된 패턴 기반 정보 추출
/
function extractSpecializedInfo(
fullText: string,
normalizedText: string,
pattern: TravelEmailPattern,
travelInfo: TravelInfo
) {
const extractors = pattern.extractors

// 항공편 번호 추출
if (extractors.flights) {
for (const flightPattern of extractors.flights) {
const matches = fullText.match(flightPattern)
if (matches) {
travelInfo.extractedData.flights.push(...matches.map(m => m.toUpperCase()))
if (!travelInfo.flightNumber) {
travelInfo.flightNumber = matches[0].toUpperCase()
}
}
}
}

// 예약 번호 추출
if (extractors.bookingReference) {
for (const bookingPattern of extractors.bookingReference) {
const matches = fullText.match(bookingPattern)
if (matches && matches.length >= 2) {
travelInfo.extractedData.bookingCodes.push(matches[1])
if (!travelInfo.bookingReference) {
travelInfo.bookingReference = matches[1]
}
}
}
}

// 공항 코드 추출
if (extractors.airports) {
for (const airportPattern of extractors.airports) {
const matches = fullText.match(airportPattern)
if (matches) {
const airports = matches.filter(code => code in airportCodes)
travelInfo.extractedData.airports.push(...airports)
if (airports.length >= 2 && !travelInfo.departure) {
travelInfo.departure = airports[0]
travelInfo.destination = airports[1]
}
}
}
}

// 날짜 추출
if (extractors.dates) {
for (const datePattern of extractors.dates) {
const matches = fullText.match(datePattern)
if (matches) {
travelInfo.extractedData.dates.push(...matches)
}
}
}
}

/\*\*
일반적인 여행 정보 추출 (모든 이메일에 적용)
/
function extractGeneralTravelInfo(
fullText: string,
normalizedText: string,
travelInfo: TravelInfo
) {
// 날짜 패턴 검색
for (const datePattern of datePatterns) {
const matches = fullText.match(datePattern)
if (matches) {
travelInfo.extractedData.dates.push(...matches)
}
}

// 항공편 번호 일반 패턴
const generalFlightPattern = /\b([A-Z]{2,3})\s\*(\d{3,4})\b/g
const flightMatches = fullText.match(generalFlightPattern)
if (flightMatches) {
const validFlights = flightMatches.filter(flight => {
const airlineCode = flight.match(/^([A-Z]{2,3})/)?.[1]
return airlineCode && airlineCode in airlineCodes
})
travelInfo.extractedData.flights.push(...validFlights.map(f => f.toUpperCase()))
}

// 공항 코드 일반 패턴
const generalAirportPattern = /\b([A-Z]{3})\b/g
const airportMatches = fullText.match(generalAirportPattern)
if (airportMatches) {
const validAirports = airportMatches.filter(code => code in airportCodes)
travelInfo.extractedData.airports.push(...validAirports)
}

// 예약 번호 일반 패턴
const generalBookingPatterns = [
/(confirmation|booking|reference|reservation)\s*(?:number|code|id)?[:\s]*([A-Z0-9]{6,})/gi,
/(예약|확인)\s*(?:번호|코드)?[:\s]*([A-Z0-9]{6,})/gi,
/PNR[:\s]\*([A-Z0-9]{6,})/gi
]

for (const pattern of generalBookingPatterns) {
const matches = fullText.match(pattern)
if (matches) {
matches.forEach(match => {
const code = match.match(/([A-Z0-9]{6,})$/)?.[1]
if (code) {
travelInfo.extractedData.bookingCodes.push(code)
}
})
}
}

// 승객 이름 추출 (일반적인 패턴)
const passengerPatterns = [
/passenger[:\s]_([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
/승객[:\s]_([가-힣]+\s*[가-힣]+)/gi,
/traveler[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+)/gi
]

for (const pattern of passengerPatterns) {
const match = fullText.match(pattern)
if (match && match.length >= 2 && !travelInfo.passengerName) {
travelInfo.passengerName = match[1].trim()
break
}
}

// 호텔 이름 추출
const hotelPatterns = [
/hotel[:\s]_([A-Za-z\s&]+?)(?:\n|\r|,|\.)/gi,
/(?:staying at|accommodation)[:\s]_([A-Za-z\s&]+?)(?:\n|\r|,|\.)/gi
]

for (const pattern of hotelPatterns) {
const match = fullText.match(pattern)
if (match && match.length >= 2 && !travelInfo.hotelName) {
travelInfo.hotelName = match[1].trim()
break
}
}
}

/\*\*
추출된 데이터를 기반으로 신뢰도 조정

#### `analyzeTravelEmails`

Gmail API 클라이언트를 생성합니다.
@param accessToken 사용자의 Google 액세스 토큰
/
export function createGmailClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.gmail({ version: 'v1', auth: oauth2Client })
}

/\*\*
여행 관련 이메일을 검색합니다.
@param accessToken 사용자의 Google 액세스 토큰
@param maxResults 최대 결과 수 (기본값: 50)
/
export async function searchTravelEmails(
accessToken: string,
maxResults: number = 50
): Promise<EmailMessage[]> {
try {
const gmail = createGmailClient(accessToken)

      // 고급 여행 관련 키워드로 검색 (한국어/영어 지원)
    const searchQuery = [
      // 항공편 관련
      'subject:(flight OR 항공편 OR 항공권 OR eticket OR "boarding pass" OR "탑승권")',
      'subject:(booking OR reservation OR confirmation OR 예약 OR 확인)',
      'subject:(itinerary OR schedule OR 일정)',

      // 호텔 관련
      'subject:(hotel OR accommodation OR 호텔 OR 숙박)',
      'subject:("check-in" OR "check-out" OR 체크인 OR 체크아웃)',

      // 주요 항공사
      'from:(koreanair.com OR flyasiana.com OR jejuair.net)',
      'from:(united.com OR delta.com OR jal.com OR ana.co.jp)',

      // 주요 예약 플랫폼
      'from:(booking.com OR expedia.com OR agoda.com OR hotels.com)',
      'from:(kayak.com OR priceline.com OR orbitz.com)',
      'from:(airbnb.com OR vrbo.com)',

      // 렌터카
      'from:(hertz.com OR avis.com OR enterprise.com OR budget.com)',

      // 여행사
      'from:(expedia.com OR travelocity.com OR orbitz.com)',

      // 일반적인 여행 관련 키워드
      'subject:(trip OR travel OR vacation OR 여행 OR 출장)',
      'subject:(departure OR arrival OR 출발 OR 도착)'
    ].join(' OR ')

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults
    })

    if (!response.data.messages) {
      return []
    }

    // 각 메시지의 상세 정보를 가져오기
    const messages: EmailMessage[] = []

    for (const message of response.data.messages.slice(0, maxResults)) {
      try {
        const messageDetail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        })

        const headers = messageDetail.data.payload?.headers || []
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject'
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender'
        const to = headers.find(h => h.name === 'To')?.value || 'Unknown Recipient'
        const date = headers.find(h => h.name === 'Date')?.value || 'Unknown Date'

        // 이메일 본문 추출
        let body = ''
        const payload = messageDetail.data.payload

        if (payload?.parts) {
          // 멀티파트 메시지
          for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body += Buffer.from(part.body.data, 'base64').toString('utf-8')
            }
          }
        } else if (payload?.body?.data) {
          // 단일 파트 메시지
          body = Buffer.from(payload.body.data, 'base64').toString('utf-8')
        }

        messages.push({
          id: message.id!,
          subject,
          from,
          to,
          date,
          body,
          snippet: messageDetail.data.snippet || ''
        })
      } catch (error) {
        // Error fetching message
        // 개별 메시지 오류는 건너뛰고 계속 진행
      }
    }

    return messages

} catch (error) {
// Error searching travel emails
throw new Error('Gmail API 요청 중 오류가 발생했습니다.')
}
}

/\*\*
고급 여행 정보 추출 함수
@param email 이메일 메시지
/
export function extractTravelInfo(email: EmailMessage): TravelInfo | null {
const fullText = `${email.subject} ${email.body} ${email.snippet}`
const normalizedText = fullText.toLowerCase()

// 기본 여행 정보 객체
const travelInfo: TravelInfo = {
emailId: email.id,
subject: email.subject,
from: email.from,
confidence: 0,
extractedData: {
dates: [],
airports: [],
flights: [],
bookingCodes: [],
matchedPatterns: []
}
}

// 패턴 매칭으로 이메일 카테고리 및 가중치 결정
let matchedPattern: TravelEmailPattern | null = null
let maxWeight = 0

for (const pattern of allTravelPatterns) {
let patternScore = 0

    // 발신자 패턴 확인
    for (const senderPattern of pattern.senderPatterns) {
      if (senderPattern.test(email.from)) {
        patternScore += 0.4
        travelInfo.extractedData.matchedPatterns.push(`sender:${pattern.name}`)
        break
      }
    }

    // 제목 패턴 확인
    for (const subjectPattern of pattern.subjectPatterns) {
      if (subjectPattern.test(email.subject)) {
        patternScore += 0.3
        travelInfo.extractedData.matchedPatterns.push(`subject:${pattern.name}`)
        break
      }
    }

    // 본문 패턴 확인
    for (const bodyPattern of pattern.bodyPatterns) {
      if (bodyPattern.test(normalizedText)) {
        patternScore += 0.3
        travelInfo.extractedData.matchedPatterns.push(`body:${pattern.name}`)
        break
      }
    }

    const weightedScore = patternScore * pattern.weight
    if (weightedScore > maxWeight) {
      maxWeight = weightedScore
      matchedPattern = pattern
      travelInfo.category = pattern.category
    }

}

// 기본 신뢰도 설정
travelInfo.confidence = maxWeight

// 특화된 정보 추출
if (matchedPattern?.extractors) {
extractSpecializedInfo(fullText, normalizedText, matchedPattern, travelInfo)
}

// 일반적인 정보 추출 (모든 이메일에 적용)
extractGeneralTravelInfo(fullText, normalizedText, travelInfo)

// 추출된 데이터 기반 신뢰도 조정
adjustConfidenceBasedOnExtractedData(travelInfo)

// 신뢰도가 너무 낮으면 null 반환
if (travelInfo.confidence < 0.2) {
return null
}

return travelInfo
}

/\*\*
특화된 패턴 기반 정보 추출
/
function extractSpecializedInfo(
fullText: string,
normalizedText: string,
pattern: TravelEmailPattern,
travelInfo: TravelInfo
) {
const extractors = pattern.extractors

// 항공편 번호 추출
if (extractors.flights) {
for (const flightPattern of extractors.flights) {
const matches = fullText.match(flightPattern)
if (matches) {
travelInfo.extractedData.flights.push(...matches.map(m => m.toUpperCase()))
if (!travelInfo.flightNumber) {
travelInfo.flightNumber = matches[0].toUpperCase()
}
}
}
}

// 예약 번호 추출
if (extractors.bookingReference) {
for (const bookingPattern of extractors.bookingReference) {
const matches = fullText.match(bookingPattern)
if (matches && matches.length >= 2) {
travelInfo.extractedData.bookingCodes.push(matches[1])
if (!travelInfo.bookingReference) {
travelInfo.bookingReference = matches[1]
}
}
}
}

// 공항 코드 추출
if (extractors.airports) {
for (const airportPattern of extractors.airports) {
const matches = fullText.match(airportPattern)
if (matches) {
const airports = matches.filter(code => code in airportCodes)
travelInfo.extractedData.airports.push(...airports)
if (airports.length >= 2 && !travelInfo.departure) {
travelInfo.departure = airports[0]
travelInfo.destination = airports[1]
}
}
}
}

// 날짜 추출
if (extractors.dates) {
for (const datePattern of extractors.dates) {
const matches = fullText.match(datePattern)
if (matches) {
travelInfo.extractedData.dates.push(...matches)
}
}
}
}

/\*\*
일반적인 여행 정보 추출 (모든 이메일에 적용)
/
function extractGeneralTravelInfo(
fullText: string,
normalizedText: string,
travelInfo: TravelInfo
) {
// 날짜 패턴 검색
for (const datePattern of datePatterns) {
const matches = fullText.match(datePattern)
if (matches) {
travelInfo.extractedData.dates.push(...matches)
}
}

// 항공편 번호 일반 패턴
const generalFlightPattern = /\b([A-Z]{2,3})\s\*(\d{3,4})\b/g
const flightMatches = fullText.match(generalFlightPattern)
if (flightMatches) {
const validFlights = flightMatches.filter(flight => {
const airlineCode = flight.match(/^([A-Z]{2,3})/)?.[1]
return airlineCode && airlineCode in airlineCodes
})
travelInfo.extractedData.flights.push(...validFlights.map(f => f.toUpperCase()))
}

// 공항 코드 일반 패턴
const generalAirportPattern = /\b([A-Z]{3})\b/g
const airportMatches = fullText.match(generalAirportPattern)
if (airportMatches) {
const validAirports = airportMatches.filter(code => code in airportCodes)
travelInfo.extractedData.airports.push(...validAirports)
}

// 예약 번호 일반 패턴
const generalBookingPatterns = [
/(confirmation|booking|reference|reservation)\s*(?:number|code|id)?[:\s]*([A-Z0-9]{6,})/gi,
/(예약|확인)\s*(?:번호|코드)?[:\s]*([A-Z0-9]{6,})/gi,
/PNR[:\s]\*([A-Z0-9]{6,})/gi
]

for (const pattern of generalBookingPatterns) {
const matches = fullText.match(pattern)
if (matches) {
matches.forEach(match => {
const code = match.match(/([A-Z0-9]{6,})$/)?.[1]
if (code) {
travelInfo.extractedData.bookingCodes.push(code)
}
})
}
}

// 승객 이름 추출 (일반적인 패턴)
const passengerPatterns = [
/passenger[:\s]_([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
/승객[:\s]_([가-힣]+\s*[가-힣]+)/gi,
/traveler[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+)/gi
]

for (const pattern of passengerPatterns) {
const match = fullText.match(pattern)
if (match && match.length >= 2 && !travelInfo.passengerName) {
travelInfo.passengerName = match[1].trim()
break
}
}

// 호텔 이름 추출
const hotelPatterns = [
/hotel[:\s]_([A-Za-z\s&]+?)(?:\n|\r|,|\.)/gi,
/(?:staying at|accommodation)[:\s]_([A-Za-z\s&]+?)(?:\n|\r|,|\.)/gi
]

for (const pattern of hotelPatterns) {
const match = fullText.match(pattern)
if (match && match.length >= 2 && !travelInfo.hotelName) {
travelInfo.hotelName = match[1].trim()
break
}
}
}

/\*\*
추출된 데이터를 기반으로 신뢰도 조정
/
function adjustConfidenceBasedOnExtractedData(travelInfo: TravelInfo) {
const extracted = travelInfo.extractedData

// 추출된 데이터에 따른 보너스 점수
if (extracted.flights.length > 0) {
travelInfo.confidence += 0.2
if (!travelInfo.flightNumber && extracted.flights.length > 0) {
travelInfo.flightNumber = extracted.flights[0]
}
}

if (extracted.airports.length >= 2) {
travelInfo.confidence += 0.15
if (!travelInfo.departure && !travelInfo.destination) {
travelInfo.departure = extracted.airports[0]
travelInfo.destination = extracted.airports[1]
}
}

if (extracted.dates.length >= 1) {
travelInfo.confidence += 0.1
if (!travelInfo.departureDate) {
travelInfo.departureDate = extracted.dates[0]
}
if (extracted.dates.length >= 2 && !travelInfo.returnDate) {
travelInfo.returnDate = extracted.dates[1]
}
}

if (extracted.bookingCodes.length > 0) {
travelInfo.confidence += 0.1
if (!travelInfo.bookingReference) {
travelInfo.bookingReference = extracted.bookingCodes[0]
}
}

// 매치된 패턴 수에 따른 보너스
if (extracted.matchedPatterns.length > 1) {
travelInfo.confidence += 0.05 \* (extracted.matchedPatterns.length - 1)
}

// 최대 신뢰도 제한
travelInfo.confidence = Math.min(travelInfo.confidence, 1.0)
}

/\*\*
고급 여행 이메일 분석 - 지능형 패턴 매칭 및 중복 제거
@param accessToken 사용자의 Google 액세스 토큰
@param maxResults 최대 검색 결과 수

**특성:** `exported`, `async`

#### `checkGmailConnection`

Gmail API 클라이언트를 생성합니다.
@param accessToken 사용자의 Google 액세스 토큰
/
export function createGmailClient(accessToken: string) {
const oauth2Client = new google.auth.OAuth2(
process.env.GOOGLE_CLIENT_ID,
process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
access_token: accessToken
})

return google.gmail({ version: 'v1', auth: oauth2Client })
}

/\*\*
여행 관련 이메일을 검색합니다.
@param accessToken 사용자의 Google 액세스 토큰
@param maxResults 최대 결과 수 (기본값: 50)
/
export async function searchTravelEmails(
accessToken: string,
maxResults: number = 50
): Promise<EmailMessage[]> {
try {
const gmail = createGmailClient(accessToken)

      // 고급 여행 관련 키워드로 검색 (한국어/영어 지원)
    const searchQuery = [
      // 항공편 관련
      'subject:(flight OR 항공편 OR 항공권 OR eticket OR "boarding pass" OR "탑승권")',
      'subject:(booking OR reservation OR confirmation OR 예약 OR 확인)',
      'subject:(itinerary OR schedule OR 일정)',

      // 호텔 관련
      'subject:(hotel OR accommodation OR 호텔 OR 숙박)',
      'subject:("check-in" OR "check-out" OR 체크인 OR 체크아웃)',

      // 주요 항공사
      'from:(koreanair.com OR flyasiana.com OR jejuair.net)',
      'from:(united.com OR delta.com OR jal.com OR ana.co.jp)',

      // 주요 예약 플랫폼
      'from:(booking.com OR expedia.com OR agoda.com OR hotels.com)',
      'from:(kayak.com OR priceline.com OR orbitz.com)',
      'from:(airbnb.com OR vrbo.com)',

      // 렌터카
      'from:(hertz.com OR avis.com OR enterprise.com OR budget.com)',

      // 여행사
      'from:(expedia.com OR travelocity.com OR orbitz.com)',

      // 일반적인 여행 관련 키워드
      'subject:(trip OR travel OR vacation OR 여행 OR 출장)',
      'subject:(departure OR arrival OR 출발 OR 도착)'
    ].join(' OR ')

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults
    })

    if (!response.data.messages) {
      return []
    }

    // 각 메시지의 상세 정보를 가져오기
    const messages: EmailMessage[] = []

    for (const message of response.data.messages.slice(0, maxResults)) {
      try {
        const messageDetail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full'
        })

        const headers = messageDetail.data.payload?.headers || []
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject'
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender'
        const to = headers.find(h => h.name === 'To')?.value || 'Unknown Recipient'
        const date = headers.find(h => h.name === 'Date')?.value || 'Unknown Date'

        // 이메일 본문 추출
        let body = ''
        const payload = messageDetail.data.payload

        if (payload?.parts) {
          // 멀티파트 메시지
          for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body += Buffer.from(part.body.data, 'base64').toString('utf-8')
            }
          }
        } else if (payload?.body?.data) {
          // 단일 파트 메시지
          body = Buffer.from(payload.body.data, 'base64').toString('utf-8')
        }

        messages.push({
          id: message.id!,
          subject,
          from,
          to,
          date,
          body,
          snippet: messageDetail.data.snippet || ''
        })
      } catch (error) {
        // Error fetching message
        // 개별 메시지 오류는 건너뛰고 계속 진행
      }
    }

    return messages

} catch (error) {
// Error searching travel emails
throw new Error('Gmail API 요청 중 오류가 발생했습니다.')
}
}

/\*\*
고급 여행 정보 추출 함수
@param email 이메일 메시지
/
export function extractTravelInfo(email: EmailMessage): TravelInfo | null {
const fullText = `${email.subject} ${email.body} ${email.snippet}`
const normalizedText = fullText.toLowerCase()

// 기본 여행 정보 객체
const travelInfo: TravelInfo = {
emailId: email.id,
subject: email.subject,
from: email.from,
confidence: 0,
extractedData: {
dates: [],
airports: [],
flights: [],
bookingCodes: [],
matchedPatterns: []
}
}

// 패턴 매칭으로 이메일 카테고리 및 가중치 결정
let matchedPattern: TravelEmailPattern | null = null
let maxWeight = 0

for (const pattern of allTravelPatterns) {
let patternScore = 0

    // 발신자 패턴 확인
    for (const senderPattern of pattern.senderPatterns) {
      if (senderPattern.test(email.from)) {
        patternScore += 0.4
        travelInfo.extractedData.matchedPatterns.push(`sender:${pattern.name}`)
        break
      }
    }

    // 제목 패턴 확인
    for (const subjectPattern of pattern.subjectPatterns) {
      if (subjectPattern.test(email.subject)) {
        patternScore += 0.3
        travelInfo.extractedData.matchedPatterns.push(`subject:${pattern.name}`)
        break
      }
    }

    // 본문 패턴 확인
    for (const bodyPattern of pattern.bodyPatterns) {
      if (bodyPattern.test(normalizedText)) {
        patternScore += 0.3
        travelInfo.extractedData.matchedPatterns.push(`body:${pattern.name}`)
        break
      }
    }

    const weightedScore = patternScore * pattern.weight
    if (weightedScore > maxWeight) {
      maxWeight = weightedScore
      matchedPattern = pattern
      travelInfo.category = pattern.category
    }

}

// 기본 신뢰도 설정
travelInfo.confidence = maxWeight

// 특화된 정보 추출
if (matchedPattern?.extractors) {
extractSpecializedInfo(fullText, normalizedText, matchedPattern, travelInfo)
}

// 일반적인 정보 추출 (모든 이메일에 적용)
extractGeneralTravelInfo(fullText, normalizedText, travelInfo)

// 추출된 데이터 기반 신뢰도 조정
adjustConfidenceBasedOnExtractedData(travelInfo)

// 신뢰도가 너무 낮으면 null 반환
if (travelInfo.confidence < 0.2) {
return null
}

return travelInfo
}

/\*\*
특화된 패턴 기반 정보 추출
/
function extractSpecializedInfo(
fullText: string,
normalizedText: string,
pattern: TravelEmailPattern,
travelInfo: TravelInfo
) {
const extractors = pattern.extractors

// 항공편 번호 추출
if (extractors.flights) {
for (const flightPattern of extractors.flights) {
const matches = fullText.match(flightPattern)
if (matches) {
travelInfo.extractedData.flights.push(...matches.map(m => m.toUpperCase()))
if (!travelInfo.flightNumber) {
travelInfo.flightNumber = matches[0].toUpperCase()
}
}
}
}

// 예약 번호 추출
if (extractors.bookingReference) {
for (const bookingPattern of extractors.bookingReference) {
const matches = fullText.match(bookingPattern)
if (matches && matches.length >= 2) {
travelInfo.extractedData.bookingCodes.push(matches[1])
if (!travelInfo.bookingReference) {
travelInfo.bookingReference = matches[1]
}
}
}
}

// 공항 코드 추출
if (extractors.airports) {
for (const airportPattern of extractors.airports) {
const matches = fullText.match(airportPattern)
if (matches) {
const airports = matches.filter(code => code in airportCodes)
travelInfo.extractedData.airports.push(...airports)
if (airports.length >= 2 && !travelInfo.departure) {
travelInfo.departure = airports[0]
travelInfo.destination = airports[1]
}
}
}
}

// 날짜 추출
if (extractors.dates) {
for (const datePattern of extractors.dates) {
const matches = fullText.match(datePattern)
if (matches) {
travelInfo.extractedData.dates.push(...matches)
}
}
}
}

/\*\*
일반적인 여행 정보 추출 (모든 이메일에 적용)
/
function extractGeneralTravelInfo(
fullText: string,
normalizedText: string,
travelInfo: TravelInfo
) {
// 날짜 패턴 검색
for (const datePattern of datePatterns) {
const matches = fullText.match(datePattern)
if (matches) {
travelInfo.extractedData.dates.push(...matches)
}
}

// 항공편 번호 일반 패턴
const generalFlightPattern = /\b([A-Z]{2,3})\s\*(\d{3,4})\b/g
const flightMatches = fullText.match(generalFlightPattern)
if (flightMatches) {
const validFlights = flightMatches.filter(flight => {
const airlineCode = flight.match(/^([A-Z]{2,3})/)?.[1]
return airlineCode && airlineCode in airlineCodes
})
travelInfo.extractedData.flights.push(...validFlights.map(f => f.toUpperCase()))
}

// 공항 코드 일반 패턴
const generalAirportPattern = /\b([A-Z]{3})\b/g
const airportMatches = fullText.match(generalAirportPattern)
if (airportMatches) {
const validAirports = airportMatches.filter(code => code in airportCodes)
travelInfo.extractedData.airports.push(...validAirports)
}

// 예약 번호 일반 패턴
const generalBookingPatterns = [
/(confirmation|booking|reference|reservation)\s*(?:number|code|id)?[:\s]*([A-Z0-9]{6,})/gi,
/(예약|확인)\s*(?:번호|코드)?[:\s]*([A-Z0-9]{6,})/gi,
/PNR[:\s]\*([A-Z0-9]{6,})/gi
]

for (const pattern of generalBookingPatterns) {
const matches = fullText.match(pattern)
if (matches) {
matches.forEach(match => {
const code = match.match(/([A-Z0-9]{6,})$/)?.[1]
if (code) {
travelInfo.extractedData.bookingCodes.push(code)
}
})
}
}

// 승객 이름 추출 (일반적인 패턴)
const passengerPatterns = [
/passenger[:\s]_([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
/승객[:\s]_([가-힣]+\s*[가-힣]+)/gi,
/traveler[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+)/gi
]

for (const pattern of passengerPatterns) {
const match = fullText.match(pattern)
if (match && match.length >= 2 && !travelInfo.passengerName) {
travelInfo.passengerName = match[1].trim()
break
}
}

// 호텔 이름 추출
const hotelPatterns = [
/hotel[:\s]_([A-Za-z\s&]+?)(?:\n|\r|,|\.)/gi,
/(?:staying at|accommodation)[:\s]_([A-Za-z\s&]+?)(?:\n|\r|,|\.)/gi
]

for (const pattern of hotelPatterns) {
const match = fullText.match(pattern)
if (match && match.length >= 2 && !travelInfo.hotelName) {
travelInfo.hotelName = match[1].trim()
break
}
}
}

/\*\*
추출된 데이터를 기반으로 신뢰도 조정
/
function adjustConfidenceBasedOnExtractedData(travelInfo: TravelInfo) {
const extracted = travelInfo.extractedData

// 추출된 데이터에 따른 보너스 점수
if (extracted.flights.length > 0) {
travelInfo.confidence += 0.2
if (!travelInfo.flightNumber && extracted.flights.length > 0) {
travelInfo.flightNumber = extracted.flights[0]
}
}

if (extracted.airports.length >= 2) {
travelInfo.confidence += 0.15
if (!travelInfo.departure && !travelInfo.destination) {
travelInfo.departure = extracted.airports[0]
travelInfo.destination = extracted.airports[1]
}
}

if (extracted.dates.length >= 1) {
travelInfo.confidence += 0.1
if (!travelInfo.departureDate) {
travelInfo.departureDate = extracted.dates[0]
}
if (extracted.dates.length >= 2 && !travelInfo.returnDate) {
travelInfo.returnDate = extracted.dates[1]
}
}

if (extracted.bookingCodes.length > 0) {
travelInfo.confidence += 0.1
if (!travelInfo.bookingReference) {
travelInfo.bookingReference = extracted.bookingCodes[0]
}
}

// 매치된 패턴 수에 따른 보너스
if (extracted.matchedPatterns.length > 1) {
travelInfo.confidence += 0.05 \* (extracted.matchedPatterns.length - 1)
}

// 최대 신뢰도 제한
travelInfo.confidence = Math.min(travelInfo.confidence, 1.0)
}

/\*\*
고급 여행 이메일 분석 - 지능형 패턴 매칭 및 중복 제거
@param accessToken 사용자의 Google 액세스 토큰
@param maxResults 최대 검색 결과 수
/
export async function analyzeTravelEmails(
accessToken: string,
maxResults: number = 20
): Promise<TravelInfo[]> {
try {
const emails = await searchTravelEmails(accessToken, maxResults)
const travelInfos: TravelInfo[] = []

    for (const email of emails) {
      const travelInfo = extractTravelInfo(email)
      if (travelInfo) {
        // 이메일 컨텍스트 정보 추가
        const emailContext = {
          senderDomain: email.from.split('@')[1] || '',
          hasMultipleBookings: email.body.toLowerCase().split('booking').length > 2,
          isForwardedEmail: email.subject.toLowerCase().includes('fwd:') || email.subject.toLowerCase().includes('fw:'),
          hasAttachments: false // Gmail API에서 첨부파일 정보 확인 필요
        }

        // 컨텍스트 기반 신뢰도 조정 (email-intelligence 라이브러리 사용)
        // travelInfo.confidence = adjustConfidenceByContext(travelInfo, emailContext)

        travelInfos.push(travelInfo)
      }
    }

    // 지능형 중복 제거 및 병합 (향후 구현)
    // const mergedInfos = deduplicateAndMergeTravelInfo(travelInfos)

    // 우선순위 정렬 (향후 구현)
    // return prioritizeTravelInfo(mergedInfos)

    // 현재는 기본 신뢰도 순으로 정렬
    return travelInfos.sort((a, b) => b.confidence - a.confidence)

} catch (error) {
// Error analyzing travel emails
throw new Error('이메일 분석 중 오류가 발생했습니다.')
}
}

/\*\*
Gmail API 연결 상태를 확인합니다.
@param accessToken 사용자의 Google 액세스 토큰

**특성:** `exported`, `async`

### 🔗 Interfaces

#### `EmailMessage`

**특성:** `exported`

#### `TravelInfo`

**특성:** `exported`

## i18n.ts

**파일 경로:** `lib/i18n.ts`

**설명:** Simple i18n system for DINO

**파일 정보:**

- 📏 크기: 6818 bytes
- 📄 라인 수: 350
- 🔧 함수: 4개
- 📦 클래스: 0개
- 🏷️ 타입: 1개
- 🔗 인터페이스: 1개

**Exports:**

- `getCurrentLocale`
- `setLocale`
- `getSupportedLocales`
- `t`
- `type`

### 🔧 Functions

#### `getCurrentLocale`

**특성:** `exported`

#### `setLocale`

**특성:** `exported`

#### `getSupportedLocales`

**특성:** `exported`

#### `t`

**특성:** `exported`

### 🔗 Interfaces

#### `Translations`

### 🏷️ Types

- `Locale`

## performance.ts

**파일 경로:** `lib/middleware/performance.ts`

**설명:** Performance middleware for API routes
Provides caching, compression, rate limiting, and monitoring

**파일 정보:**

- 📏 크기: 10621 bytes
- 📄 라인 수: 373
- 🔧 함수: 6개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `performanceMiddleware`
- `compressJSON`
- `withPerformance`
- `optimizeQuery`
- `async`

### 🔧 Functions

#### `performanceMiddleware`

**특성:** `exported`

#### `processJSONResponse`

**특성:** `async`

#### `generateCacheKey`

#### `getClientIP`

#### `recordMetrics`

#### `compressJSON`

**특성:** `exported`

### 🔗 Interfaces

#### `PerformanceMiddlewareOptions`

## alerts-v2.ts

**파일 경로:** `lib/monitoring/alerts-v2.ts`

**설명:** Simplified alerts module for testing

**파일 정보:**

- 📏 크기: 5726 bytes
- 📄 라인 수: 214
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 4개

**Exports:**

- `enum`
- `Alert`
- `AlertChannel`
- `AlertRule`
- `AlertConfig`
- `AlertManager`

### 📦 Classes

#### `AlertManager`

**특성:** `exported`

### 🔗 Interfaces

#### `Alert`

**특성:** `exported`

#### `AlertChannel`

**특성:** `exported`

#### `AlertRule`

**특성:** `exported`

#### `AlertConfig`

**특성:** `exported`

## alerts.ts

**파일 경로:** `lib/monitoring/alerts.ts`

**파일 정보:**

- 📏 크기: 6081 bytes
- 📄 라인 수: 235
- 🔧 함수: 6개
- 📦 클래스: 0개
- 🏷️ 타입: 2개
- 🔗 인터페이스: 1개

**Exports:**

- `AlertType`
- `AlertCategory`
- `alertThresholds`
- `async`
- `checkPerformanceAlerts`
- `checkSecurityAlerts`
- `checkUsageAlerts`
- `startAlertMonitoring`

### 🔧 Functions

#### `sendAlert`

**특성:** `exported`, `async`

#### `checkPerformanceAlerts`

**특성:** `exported`

#### `checkSecurityAlerts`

**특성:** `exported`

#### `checkUsageAlerts`

**특성:** `exported`

#### `logAlert`

**특성:** `async`

#### `startAlertMonitoring`

**특성:** `exported`

### 🔗 Interfaces

#### `Alert`

### 🏷️ Types

- `AlertType` (exported)
- `AlertCategory` (exported)

## logger.ts

**파일 경로:** `lib/monitoring/logger.ts`

**설명:** Structured Logging System
Provides consistent logging with different levels and structured data

**파일 정보:**

- 📏 크기: 6299 bytes
- 📄 라인 수: 249
- 🔧 함수: 1개
- 📦 클래스: 1개
- 🏷️ 타입: 1개
- 🔗 인터페이스: 2개

**Exports:**

- `LogLevel`
- `LogContext`
- `LogEntry`
- `Logger`
- `loggers`
- `createRequestLogger`

### 🔧 Functions

#### `createRequestLogger`

**특성:** `exported`

### 📦 Classes

#### `Logger`

**특성:** `exported`

### 🔗 Interfaces

#### `LogContext`

**특성:** `exported`

#### `LogEntry`

**특성:** `exported`

### 🏷️ Types

- `LogLevel` (exported)

## metrics-collector-v2.ts

**파일 경로:** `lib/monitoring/metrics-collector-v2.ts`

**설명:** New metrics collector for testing

**파일 정보:**

- 📏 크기: 4423 bytes
- 📄 라인 수: 190
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 4개

**Exports:**

- `enum`
- `Metric`
- `MetricsStorage`
- `MetricsConfig`
- `MetricsCollector`

### 📦 Classes

#### `MetricsCollector`

**특성:** `exported`

### 🔗 Interfaces

#### `Metric`

**특성:** `exported`

#### `MetricsStorage`

**특성:** `exported`

#### `MetricsConfig`

**특성:** `exported`

#### `Timer`

## metrics-collector.ts

**파일 경로:** `lib/monitoring/metrics-collector.ts`

**설명:** Metrics Collection System
Collects and aggregates application metrics for monitoring

**파일 정보:**

- 📏 크기: 7317 bytes
- 📄 라인 수: 283
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `Metric`
- `MetricAggregation`
- `MetricsCollector`
- `metrics`
- `httpMetrics`
- `dbMetrics`
- `businessMetrics`

### 📦 Classes

#### `MetricsCollector`

**특성:** `exported`

### 🔗 Interfaces

#### `Metric`

Metrics Collection System
Collects and aggregates application metrics for monitoring

**특성:** `exported`

#### `MetricAggregation`

**특성:** `exported`

## monitoring-init.ts

**파일 경로:** `lib/monitoring/monitoring-init.ts`

**설명:** Monitoring System Initialization
모니터링 시스템 초기화

**파일 정보:**

- 📏 크기: 8442 bytes
- 📄 라인 수: 315
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `monitoringSystem`

### 📦 Classes

#### `MonitoringSystem`

## sentry.ts

**파일 경로:** `lib/monitoring/sentry.ts`

**파일 정보:**

- 📏 크기: 2456 bytes
- 📄 라인 수: 105
- 🔧 함수: 7개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `initSentry`
- `setSentryUser`
- `clearSentryUser`
- `captureError`
- `captureMessage`
- `startTransaction`
- `addBreadcrumb`

### 🔧 Functions

#### `initSentry`

**특성:** `exported`

#### `setSentryUser`

**특성:** `exported`

#### `clearSentryUser`

**특성:** `exported`

#### `captureError`

**특성:** `exported`

#### `captureMessage`

**특성:** `exported`

#### `startTransaction`

**특성:** `exported`

#### `addBreadcrumb`

**특성:** `exported`

## monitoring.ts

**파일 경로:** `lib/monitoring.ts`

**설명:** Production Performance Monitoring System
Tracks Core Web Vitals, API performance, and user interactions

**파일 정보:**

- 📏 크기: 9481 bytes
- 📄 라인 수: 352
- 🔧 함수: 6개
- 📦 클래스: 2개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 3개

**Exports:**

- `performanceMonitor`
- `usePerformanceTracking`
- `createAPIPerformanceMiddleware`
- `ErrorBoundary`
- `initializeMonitoring`
- `type`

### 🔧 Functions

#### `usePerformanceTracking`

**특성:** `exported`

#### `trackAction`

#### `trackAPICall`

#### `trackError`

#### `createAPIPerformanceMiddleware`

**특성:** `exported`

#### `initializeMonitoring`

**특성:** `exported`

### 📦 Classes

#### `PerformanceMonitor`

#### `ErrorBoundary`

**특성:** `exported`

### 🔗 Interfaces

#### `PerformanceMetric`

Production Performance Monitoring System
Tracks Core Web Vitals, API performance, and user interactions

#### `APIMetric`

#### `ErrorMetric`

## alert-manager.ts

**파일 경로:** `lib/notifications/alert-manager.ts`

**설명:** Integrated Alert and Notification System
통합 알림 및 경고 시스템

**파일 정보:**

- 📏 크기: 13356 bytes
- 📄 라인 수: 488
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 3개

**Exports:**

- `alertManager`
- `systemAlert`
- `type`

### 📦 Classes

#### `AlertManager`

### 🔗 Interfaces

#### `AlertChannel`

Integrated Alert and Notification System
통합 알림 및 경고 시스템

#### `Alert`

#### `NotificationTemplate`

## visa-alerts.ts

**파일 경로:** `lib/notifications/visa-alerts.ts`

**설명:** Visa Alerts System

**파일 정보:**

- 📏 크기: 9996 bytes
- 📄 라인 수: 361
- 🔧 함수: 2개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 3개

**Exports:**

- `VisaAlert`
- `visaAlerts`
- `async`
- `type`

### 🔧 Functions

#### `checkVisaAlerts`

**특성:** `exported`, `async`

#### `sendVisaAlert`

**특성:** `exported`, `async`

### 📦 Classes

#### `VisaAlertsService`

### 🔗 Interfaces

#### `VisaAlert`

**특성:** `exported`

#### `Visa`

#### `Trip`

## notifications.ts

**파일 경로:** `lib/notifications.ts`

**파일 정보:**

- 📏 크기: 6683 bytes
- 📄 라인 수: 232
- 🔧 함수: 7개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `DEFAULT_PREFERENCES`
- `isQuietHours`
- `checkVisaExpiry`
- `checkSchengenWarnings`
- `checkUpcomingTrips`
- `formatNotification`
- `async`
- `showBrowserNotification`

### 🔧 Functions

#### `isQuietHours`

**특성:** `exported`

#### `checkVisaExpiry`

**특성:** `exported`

#### `checkSchengenWarnings`

**특성:** `exported`

#### `checkUpcomingTrips`

**특성:** `exported`

#### `formatNotification`

**특성:** `exported`

#### `requestNotificationPermission`

**특성:** `exported`, `async`

#### `showBrowserNotification`

**특성:** `exported`

## offline-api-client.ts

**파일 경로:** `lib/offline-api-client.ts`

**파일 정보:**

- 📏 크기: 8027 bytes
- 📄 라인 수: 289
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `OfflineApiClient`

### 📦 Classes

#### `OfflineApiClient`

**특성:** `exported`

## offline-storage.ts

**파일 경로:** `lib/offline-storage.ts`

**설명:** IndexedDB를 사용한 오프라인 데이터 저장

**파일 정보:**

- 📏 크기: 7755 bytes
- 📄 라인 수: 256
- 🔧 함수: 0개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `offlineStorage`

### 📦 Classes

#### `OfflineStorage`

## api-cache.ts

**파일 경로:** `lib/performance/api-cache.ts`

**설명:** Advanced API caching and optimization system
Implements in-memory LRU cache with TTL and Redis-like functionality

**파일 정보:**

- 📏 크기: 12382 bytes
- 📄 라인 수: 503
- 🔧 함수: 4개
- 📦 클래스: 4개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 3개

**Exports:**

- `PerformanceCache`
- `apiCache`
- `CacheResponse`
- `requestDeduplicator`
- `rateLimiter`
- `async`
- `compressResponse`
- `decompressResponse`
- `APIPerformanceMonitor`
- `apiMonitor`

### 🔧 Functions

#### `CacheResponse`

**특성:** `exported`

#### `optimizedFetch`

**특성:** `exported`, `async`

#### `compressResponse`

**특성:** `exported`

#### `decompressResponse`

**특성:** `exported`

### 📦 Classes

#### `PerformanceCache`

**특성:** `exported`

#### `RequestDeduplicator`

#### `RateLimiter`

#### `APIPerformanceMonitor`

**특성:** `exported`

### 🔗 Interfaces

#### `CacheEntry`

Advanced API caching and optimization system
Implements in-memory LRU cache with TTL and Redis-like functionality

#### `CacheStats`

#### `OptimizedFetchOptions`

## database-optimizer.ts

**파일 경로:** `lib/performance/database-optimizer.ts`

**설명:** Database performance optimization utilities
Provides query optimization, connection pooling, and performance monitoring

**파일 정보:**

- 📏 크기: 14700 bytes
- 📄 라인 수: 540
- 🔧 함수: 0개
- 📦 클래스: 4개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `QueryOptimizer`
- `ConnectionPoolManager`
- `OptimizedQueries`
- `dbOptimizer`
- `optimizedPrisma`
- `withDatabaseMonitoring`

### 📦 Classes

#### `DatabaseOptimizer`

#### `QueryOptimizer`

**특성:** `exported`

#### `ConnectionPoolManager`

**특성:** `exported`

#### `OptimizedQueries`

**특성:** `exported`

### 🔗 Interfaces

#### `QueryMetrics`

#### `ConnectionPoolConfig`

## dynamic-imports.ts

**파일 경로:** `lib/performance/dynamic-imports.ts`

**설명:** Dynamic imports for code splitting and performance optimization
Lazy loading components to reduce initial bundle size

**파일 정보:**

- 📏 크기: 5694 bytes
- 📄 라인 수: 207
- 🔧 함수: 6개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `DynamicSchengenCalculator`
- `DynamicTravelRecordsTable`
- `DynamicGmailAnalyzer`
- `DynamicCalendarSync`
- `DynamicMonitoringDashboard`
- `DynamicChart`
- `DynamicLineChart`
- `DynamicBarChart`
- `DynamicDatePicker`
- `DynamicRichTextEditor`
- `DynamicPerformanceMonitor`
- `DynamicBundleAnalyzer`
- `createDynamicComponent`
- `preloadCriticalComponents`
- `addResourceHints`

### 🔧 Functions

#### `LoadingSpinner`

#### `preloadCriticalComponents`

**특성:** `exported`

#### `preloadOnHover`

#### `addResourceHints`

**특성:** `exported`

#### `dnsPrefetch`

#### `preconnect`

### 🔗 Interfaces

#### `DynamicComponentOptions`

## resource-optimization.ts

**파일 경로:** `lib/performance/resource-optimization.ts`

**설명:** Resource optimization utilities for critical path performance

**파일 정보:**

- 📏 크기: 13207 bytes
- 📄 라인 수: 470
- 🔧 함수: 19개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `preloadCriticalResources`
- `registerServiceWorker`
- `inlineCriticalCSS`
- `ResourceOptimizer`
- `optimizeWebVitals`
- `initializePerformanceOptimizations`
- `monitorPerformanceBudget`

### 🔧 Functions

#### `preloadCriticalResources`

**특성:** `exported`

#### `preloadFont`

#### `preloadCSS`

#### `preloadJS`

#### `dnsPrefetch`

#### `preconnect`

#### `registerServiceWorker`

**특성:** `exported`, `async`

#### `inlineCriticalCSS`

**특성:** `exported`

#### `optimizeWebVitals`

**특성:** `exported`

#### `optimizeLCP`

#### `deferCSS`

#### `optimizeCLS`

#### `reserveSpace`

#### `optimizeFID`

#### `breakUpLongTasks`

#### `runTask`

#### `scheduleTask`

#### `initializePerformanceOptimizations`

**특성:** `exported`

#### `monitorPerformanceBudget`

**특성:** `exported`

### 📦 Classes

#### `ResourceOptimizer`

**특성:** `exported`

## prisma.ts

**파일 경로:** `lib/prisma.ts`

**설명:** Use the optimized connection pool instead of direct Prisma client

**파일 정보:**

- 📏 크기: 729 bytes
- 📄 라인 수: 21
- 🔧 함수: 0개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `for`

## schengen-calculator.ts

**파일 경로:** `lib/schengen-calculator.ts`

**파일 정보:**

- 📏 크기: 8383 bytes
- 📄 라인 수: 266
- 🔧 함수: 9개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `SchengenVisit`
- `isSchengenCountry`
- `calculateSchengenStatus`
- `getSchengenWarnings`
- `calculateMaxStayDays`
- `getNextEntryDate`
- `FutureTripValidation`
- `validateFutureTrip`
- `getSafeTravelDates`

### 🔧 Functions

#### `isSchengenCountry`

**특성:** `exported`

#### `calculateDaysBetween`

#### `calculateSchengenStatus`

**특성:** `exported`

#### `getSchengenWarnings`

**특성:** `exported`

#### `calculateMaxStayDays`

**특성:** `exported`

#### `getNextEntryDate`

**특성:** `exported`

#### `validateFutureTrip`

**특성:** `exported`

#### `calculateSchengenStatusOnDate`

#### `getSafeTravelDates`

**특성:** `exported`

### 🔗 Interfaces

#### `SchengenVisit`

**특성:** `exported`

#### `FutureTripValidation`

**특성:** `exported`

## api-security.ts

**파일 경로:** `lib/security/api-security.ts`

**파일 정보:**

- 📏 크기: 6814 bytes
- 📄 라인 수: 267
- 🔧 함수: 5개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `ApiSecurityOptions`
- `withApiSecurity`
- `validators`
- `validateTripData`
- `sanitizeInput`
- `createApiResponse`
- `createErrorResponse`

### 🔧 Functions

#### `withApiSecurity`

API Security utilities for DiNoCal
Provides authentication, authorization, and input validation
/

export interface ApiSecurityOptions {
requireAuth?: boolean
allowedMethods?: string[]
rateLimitKey?: string
validateInput?: boolean
}

/\*\*
Secure API route wrapper with comprehensive security checks

**특성:** `exported`

#### `validateTripData`

API Security utilities for DiNoCal
Provides authentication, authorization, and input validation
/

export interface ApiSecurityOptions {
requireAuth?: boolean
allowedMethods?: string[]
rateLimitKey?: string
validateInput?: boolean
}

/\*\*
Secure API route wrapper with comprehensive security checks
/
export function withApiSecurity(
handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
options: ApiSecurityOptions = {}
) {
return async (req: NextRequest, context?: any) => {
const {
requireAuth = true,
allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
validateInput = true
} = options

    try {
      // Method validation
      if (!allowedMethods.includes(req.method || '')) {
        return NextResponse.json(
          { success: false, error: 'Method not allowed' },
          { status: 405, headers: { Allow: allowedMethods.join(', ') } }
        )
      }

      // Authentication check
      if (requireAuth) {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
          return NextResponse.json(
            { success: false, error: 'Authentication required' },
            { status: 401 }
          )
        }

        // Add user to context
        context = { ...context, user: session.user }
      }

      // Input validation
      if (validateInput && (req.method === 'POST' || req.method === 'PUT')) {
        const contentType = req.headers.get('content-type')
        if (contentType && !contentType.includes('application/json')) {
          return NextResponse.json(
            { success: false, error: 'Content-Type must be application/json' },
            { status: 400 }
          )
        }
      }

      // CSRF protection for state-changing operations
      if (['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
        const origin = req.headers.get('origin')
        const host = req.headers.get('host')

        if (origin && !isAllowedOrigin(origin, host)) {
          return NextResponse.json(
            { success: false, error: 'Invalid origin' },
            { status: 403 }
          )
        }
      }

      // Call the actual handler
      return await handler(req, context)

    } catch (error) {
      // API Security Error occurred

      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }

}
}

/\*\*
Input validation helpers
/
export const validators = {
email: (email: string): boolean => {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
return emailRegex.test(email)
},

date: (dateString: string): boolean => {
const date = new Date(dateString)
return !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/)
},

visaType: (type: string): boolean => {
const allowedTypes = [
'Tourist', 'Business', 'Student', 'Work', 'Transit', 'Diplomatic',
'Official', 'Journalist', 'Medical', 'Family', 'Investor', 'Artist',
'Researcher', 'Other'
]
return allowedTypes.includes(type)
},

country: (country: string): boolean => {
return typeof country === 'string' && country.length > 0 && country.length < 100
},

passportCountry: (code: string): boolean => {
const allowedCodes = ['KR', 'US', 'JP', 'CN', 'DE', 'FR', 'GB', 'CA', 'AU', 'OTHER']
return allowedCodes.includes(code)
},

maxDays: (days: number): boolean => {
return Number.isInteger(days) && days > 0 && days <= 365
},

notes: (notes: string): boolean => {
return typeof notes === 'string' && notes.length <= 500
}
}

/\*\*
Validate trip form data

**특성:** `exported`

#### `sanitizeInput`

API Security utilities for DiNoCal
Provides authentication, authorization, and input validation
/

export interface ApiSecurityOptions {
requireAuth?: boolean
allowedMethods?: string[]
rateLimitKey?: string
validateInput?: boolean
}

/\*\*
Secure API route wrapper with comprehensive security checks
/
export function withApiSecurity(
handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
options: ApiSecurityOptions = {}
) {
return async (req: NextRequest, context?: any) => {
const {
requireAuth = true,
allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
validateInput = true
} = options

    try {
      // Method validation
      if (!allowedMethods.includes(req.method || '')) {
        return NextResponse.json(
          { success: false, error: 'Method not allowed' },
          { status: 405, headers: { Allow: allowedMethods.join(', ') } }
        )
      }

      // Authentication check
      if (requireAuth) {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
          return NextResponse.json(
            { success: false, error: 'Authentication required' },
            { status: 401 }
          )
        }

        // Add user to context
        context = { ...context, user: session.user }
      }

      // Input validation
      if (validateInput && (req.method === 'POST' || req.method === 'PUT')) {
        const contentType = req.headers.get('content-type')
        if (contentType && !contentType.includes('application/json')) {
          return NextResponse.json(
            { success: false, error: 'Content-Type must be application/json' },
            { status: 400 }
          )
        }
      }

      // CSRF protection for state-changing operations
      if (['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
        const origin = req.headers.get('origin')
        const host = req.headers.get('host')

        if (origin && !isAllowedOrigin(origin, host)) {
          return NextResponse.json(
            { success: false, error: 'Invalid origin' },
            { status: 403 }
          )
        }
      }

      // Call the actual handler
      return await handler(req, context)

    } catch (error) {
      // API Security Error occurred

      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }

}
}

/\*\*
Input validation helpers
/
export const validators = {
email: (email: string): boolean => {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
return emailRegex.test(email)
},

date: (dateString: string): boolean => {
const date = new Date(dateString)
return !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/)
},

visaType: (type: string): boolean => {
const allowedTypes = [
'Tourist', 'Business', 'Student', 'Work', 'Transit', 'Diplomatic',
'Official', 'Journalist', 'Medical', 'Family', 'Investor', 'Artist',
'Researcher', 'Other'
]
return allowedTypes.includes(type)
},

country: (country: string): boolean => {
return typeof country === 'string' && country.length > 0 && country.length < 100
},

passportCountry: (code: string): boolean => {
const allowedCodes = ['KR', 'US', 'JP', 'CN', 'DE', 'FR', 'GB', 'CA', 'AU', 'OTHER']
return allowedCodes.includes(code)
},

maxDays: (days: number): boolean => {
return Number.isInteger(days) && days > 0 && days <= 365
},

notes: (notes: string): boolean => {
return typeof notes === 'string' && notes.length <= 500
}
}

/\*\*
Validate trip form data
/
export function validateTripData(data: any): { isValid: boolean; errors: string[] } {
const errors: string[] = []

if (!data.country || !validators.country(data.country)) {
errors.push('Valid country is required')
}

if (!data.entryDate || !validators.date(data.entryDate)) {
errors.push('Valid entry date is required')
}

if (data.exitDate && !validators.date(data.exitDate)) {
errors.push('Exit date must be a valid date')
}

if (!data.visaType || !validators.visaType(data.visaType)) {
errors.push('Valid visa type is required')
}

if (!data.maxDays || !validators.maxDays(data.maxDays)) {
errors.push('Max days must be between 1 and 365')
}

if (!data.passportCountry || !validators.passportCountry(data.passportCountry)) {
errors.push('Valid passport country is required')
}

if (data.notes && !validators.notes(data.notes)) {
errors.push('Notes must be 500 characters or less')
}

// Date logic validation
if (data.entryDate && data.exitDate) {
const entry = new Date(data.entryDate)
const exit = new Date(data.exitDate)
if (exit <= entry) {
errors.push('Exit date must be after entry date')
}
}

return {
isValid: errors.length === 0,
errors
}
}

/\*\*
Sanitize user input

**특성:** `exported`

#### `isAllowedOrigin`

API Security utilities for DiNoCal
Provides authentication, authorization, and input validation
/

export interface ApiSecurityOptions {
requireAuth?: boolean
allowedMethods?: string[]
rateLimitKey?: string
validateInput?: boolean
}

/\*\*
Secure API route wrapper with comprehensive security checks
/
export function withApiSecurity(
handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
options: ApiSecurityOptions = {}
) {
return async (req: NextRequest, context?: any) => {
const {
requireAuth = true,
allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
validateInput = true
} = options

    try {
      // Method validation
      if (!allowedMethods.includes(req.method || '')) {
        return NextResponse.json(
          { success: false, error: 'Method not allowed' },
          { status: 405, headers: { Allow: allowedMethods.join(', ') } }
        )
      }

      // Authentication check
      if (requireAuth) {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
          return NextResponse.json(
            { success: false, error: 'Authentication required' },
            { status: 401 }
          )
        }

        // Add user to context
        context = { ...context, user: session.user }
      }

      // Input validation
      if (validateInput && (req.method === 'POST' || req.method === 'PUT')) {
        const contentType = req.headers.get('content-type')
        if (contentType && !contentType.includes('application/json')) {
          return NextResponse.json(
            { success: false, error: 'Content-Type must be application/json' },
            { status: 400 }
          )
        }
      }

      // CSRF protection for state-changing operations
      if (['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
        const origin = req.headers.get('origin')
        const host = req.headers.get('host')

        if (origin && !isAllowedOrigin(origin, host)) {
          return NextResponse.json(
            { success: false, error: 'Invalid origin' },
            { status: 403 }
          )
        }
      }

      // Call the actual handler
      return await handler(req, context)

    } catch (error) {
      // API Security Error occurred

      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }

}
}

/\*\*
Input validation helpers
/
export const validators = {
email: (email: string): boolean => {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
return emailRegex.test(email)
},

date: (dateString: string): boolean => {
const date = new Date(dateString)
return !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/)
},

visaType: (type: string): boolean => {
const allowedTypes = [
'Tourist', 'Business', 'Student', 'Work', 'Transit', 'Diplomatic',
'Official', 'Journalist', 'Medical', 'Family', 'Investor', 'Artist',
'Researcher', 'Other'
]
return allowedTypes.includes(type)
},

country: (country: string): boolean => {
return typeof country === 'string' && country.length > 0 && country.length < 100
},

passportCountry: (code: string): boolean => {
const allowedCodes = ['KR', 'US', 'JP', 'CN', 'DE', 'FR', 'GB', 'CA', 'AU', 'OTHER']
return allowedCodes.includes(code)
},

maxDays: (days: number): boolean => {
return Number.isInteger(days) && days > 0 && days <= 365
},

notes: (notes: string): boolean => {
return typeof notes === 'string' && notes.length <= 500
}
}

/\*\*
Validate trip form data
/
export function validateTripData(data: any): { isValid: boolean; errors: string[] } {
const errors: string[] = []

if (!data.country || !validators.country(data.country)) {
errors.push('Valid country is required')
}

if (!data.entryDate || !validators.date(data.entryDate)) {
errors.push('Valid entry date is required')
}

if (data.exitDate && !validators.date(data.exitDate)) {
errors.push('Exit date must be a valid date')
}

if (!data.visaType || !validators.visaType(data.visaType)) {
errors.push('Valid visa type is required')
}

if (!data.maxDays || !validators.maxDays(data.maxDays)) {
errors.push('Max days must be between 1 and 365')
}

if (!data.passportCountry || !validators.passportCountry(data.passportCountry)) {
errors.push('Valid passport country is required')
}

if (data.notes && !validators.notes(data.notes)) {
errors.push('Notes must be 500 characters or less')
}

// Date logic validation
if (data.entryDate && data.exitDate) {
const entry = new Date(data.entryDate)
const exit = new Date(data.exitDate)
if (exit <= entry) {
errors.push('Exit date must be after entry date')
}
}

return {
isValid: errors.length === 0,
errors
}
}

/\*\*
Sanitize user input
/
export function sanitizeInput(input: any): any {
if (typeof input === 'string') {
return input.trim().replace(/[<>]/g, '')
}

if (Array.isArray(input)) {
return input.map(sanitizeInput)
}

if (typeof input === 'object' && input !== null) {
const sanitized: any = {}
for (const [key, value] of Object.entries(input)) {
sanitized[key] = sanitizeInput(value)
}
return sanitized
}

return input
}

/\*\*
Check if origin is allowed

#### `createErrorResponse`

API Security utilities for DiNoCal
Provides authentication, authorization, and input validation
/

export interface ApiSecurityOptions {
requireAuth?: boolean
allowedMethods?: string[]
rateLimitKey?: string
validateInput?: boolean
}

/\*\*
Secure API route wrapper with comprehensive security checks
/
export function withApiSecurity(
handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
options: ApiSecurityOptions = {}
) {
return async (req: NextRequest, context?: any) => {
const {
requireAuth = true,
allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
validateInput = true
} = options

    try {
      // Method validation
      if (!allowedMethods.includes(req.method || '')) {
        return NextResponse.json(
          { success: false, error: 'Method not allowed' },
          { status: 405, headers: { Allow: allowedMethods.join(', ') } }
        )
      }

      // Authentication check
      if (requireAuth) {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
          return NextResponse.json(
            { success: false, error: 'Authentication required' },
            { status: 401 }
          )
        }

        // Add user to context
        context = { ...context, user: session.user }
      }

      // Input validation
      if (validateInput && (req.method === 'POST' || req.method === 'PUT')) {
        const contentType = req.headers.get('content-type')
        if (contentType && !contentType.includes('application/json')) {
          return NextResponse.json(
            { success: false, error: 'Content-Type must be application/json' },
            { status: 400 }
          )
        }
      }

      // CSRF protection for state-changing operations
      if (['POST', 'PUT', 'DELETE'].includes(req.method || '')) {
        const origin = req.headers.get('origin')
        const host = req.headers.get('host')

        if (origin && !isAllowedOrigin(origin, host)) {
          return NextResponse.json(
            { success: false, error: 'Invalid origin' },
            { status: 403 }
          )
        }
      }

      // Call the actual handler
      return await handler(req, context)

    } catch (error) {
      // API Security Error occurred

      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }

}
}

/\*\*
Input validation helpers
/
export const validators = {
email: (email: string): boolean => {
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
return emailRegex.test(email)
},

date: (dateString: string): boolean => {
const date = new Date(dateString)
return !isNaN(date.getTime()) && !!dateString.match(/^\d{4}-\d{2}-\d{2}$/)
},

visaType: (type: string): boolean => {
const allowedTypes = [
'Tourist', 'Business', 'Student', 'Work', 'Transit', 'Diplomatic',
'Official', 'Journalist', 'Medical', 'Family', 'Investor', 'Artist',
'Researcher', 'Other'
]
return allowedTypes.includes(type)
},

country: (country: string): boolean => {
return typeof country === 'string' && country.length > 0 && country.length < 100
},

passportCountry: (code: string): boolean => {
const allowedCodes = ['KR', 'US', 'JP', 'CN', 'DE', 'FR', 'GB', 'CA', 'AU', 'OTHER']
return allowedCodes.includes(code)
},

maxDays: (days: number): boolean => {
return Number.isInteger(days) && days > 0 && days <= 365
},

notes: (notes: string): boolean => {
return typeof notes === 'string' && notes.length <= 500
}
}

/\*\*
Validate trip form data
/
export function validateTripData(data: any): { isValid: boolean; errors: string[] } {
const errors: string[] = []

if (!data.country || !validators.country(data.country)) {
errors.push('Valid country is required')
}

if (!data.entryDate || !validators.date(data.entryDate)) {
errors.push('Valid entry date is required')
}

if (data.exitDate && !validators.date(data.exitDate)) {
errors.push('Exit date must be a valid date')
}

if (!data.visaType || !validators.visaType(data.visaType)) {
errors.push('Valid visa type is required')
}

if (!data.maxDays || !validators.maxDays(data.maxDays)) {
errors.push('Max days must be between 1 and 365')
}

if (!data.passportCountry || !validators.passportCountry(data.passportCountry)) {
errors.push('Valid passport country is required')
}

if (data.notes && !validators.notes(data.notes)) {
errors.push('Notes must be 500 characters or less')
}

// Date logic validation
if (data.entryDate && data.exitDate) {
const entry = new Date(data.entryDate)
const exit = new Date(data.exitDate)
if (exit <= entry) {
errors.push('Exit date must be after entry date')
}
}

return {
isValid: errors.length === 0,
errors
}
}

/\*\*
Sanitize user input
/
export function sanitizeInput(input: any): any {
if (typeof input === 'string') {
return input.trim().replace(/[<>]/g, '')
}

if (Array.isArray(input)) {
return input.map(sanitizeInput)
}

if (typeof input === 'object' && input !== null) {
const sanitized: any = {}
for (const [key, value] of Object.entries(input)) {
sanitized[key] = sanitizeInput(value)
}
return sanitized
}

return input
}

/\*\*
Check if origin is allowed
/
function isAllowedOrigin(origin: string, host: string | null): boolean {
const allowedOrigins = [
'http://localhost:3000',
'https://dinocal.vercel.app',
'https://dinocal.app'
]

// Allow same-origin requests
if (host && (origin === `https://${host}` || origin === `http://${host}`)) {
return true
}

return allowedOrigins.includes(origin)
}

/\*\*
Generate secure API response
/
export function createApiResponse<T>(
data: T,
success = true,
message?: string,
status = 200
): NextResponse {
const response = NextResponse.json(
{
success,
data: success ? data : undefined,
error: success ? undefined : data,
message,
timestamp: new Date().toISOString()
},
{ status }
)

// Add security headers
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('X-Frame-Options', 'DENY')

return response
}

/\*\*
Error response helper

**특성:** `exported`

### 🔗 Interfaces

#### `ApiSecurityOptions`

API Security utilities for DiNoCal
Provides authentication, authorization, and input validation

**특성:** `exported`

## auth-middleware.ts

**파일 경로:** `lib/security/auth-middleware.ts`

**파일 정보:**

- 📏 크기: 9014 bytes
- 📄 라인 수: 366
- 🔧 함수: 1개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `AuthContext`
- `AuthMiddleware`
- `async`

### 🔧 Functions

#### `securityMiddleware`

**특성:** `exported`, `async`

### 📦 Classes

#### `AuthMiddleware`

**특성:** `exported`

### 🔗 Interfaces

#### `AuthContext`

**특성:** `exported`

## auth-security.ts

**파일 경로:** `lib/security/auth-security.ts`

**설명:** Authentication Security Enhancements
CSRF protection, session management, and rate limiting

**파일 정보:**

- 📏 크기: 6305 bytes
- 📄 라인 수: 215
- 🔧 함수: 1개
- 📦 클래스: 2개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `CSRFProtection`
- `sessionConfig`
- `rateLimiters`
- `async`

### 🔧 Functions

#### `withAuth`

**특성:** `exported`, `async`

### 📦 Classes

#### `CSRFProtection`

**특성:** `exported`

#### `RateLimiter`

### 🔗 Interfaces

#### `RateLimitConfig`

## csrf-protection.ts

**파일 경로:** `lib/security/csrf-protection.ts`

**파일 정보:**

- 📏 크기: 9802 bytes
- 📄 라인 수: 390
- 🔧 함수: 2개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `CSRFProtection`
- `async`
- `generateCSRFResponse`

### 🔧 Functions

#### `csrfProtection`

**특성:** `exported`, `async`

#### `generateCSRFResponse`

**특성:** `exported`

### 📦 Classes

#### `CSRFProtection`

**특성:** `exported`

## env-validator.ts

**파일 경로:** `lib/security/env-validator.ts`

**설명:** Environment Variable Security Validator
Ensures all required environment variables are present and valid

**파일 정보:**

- 📏 크기: 3569 bytes
- 📄 라인 수: 113
- 🔧 함수: 4개
- 📦 클래스: 0개
- 🏷️ 타입: 1개
- 🔗 인터페이스: 0개

**Exports:**

- `ValidatedEnv`
- `validateEnv`
- `isProduction`
- `isDebugMode`
- `getSafeEnv`

### 🔧 Functions

#### `validateEnv`

**특성:** `exported`

#### `isProduction`

**특성:** `exported`

#### `isDebugMode`

**특성:** `exported`

#### `getSafeEnv`

**특성:** `exported`

### 🏷️ Types

- `ValidatedEnv` (exported)

## input-sanitizer.ts

**파일 경로:** `lib/security/input-sanitizer.ts`

**설명:** Server-side HTML sanitization utilities

**파일 정보:**

- 📏 크기: 7827 bytes
- 📄 라인 수: 325
- 🔧 함수: 1개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `InputSanitizer`
- `async`

### 🔧 Functions

#### `sanitizeRequestBody`

**특성:** `exported`, `async`

### 📦 Classes

#### `InputSanitizer`

**특성:** `exported`

## input-validation.ts

**파일 경로:** `lib/security/input-validation.ts`

**설명:** Input Validation and Sanitization
Comprehensive security for all user inputs

**파일 정보:**

- 📏 크기: 6188 bytes
- 📄 라인 수: 204
- 🔧 함수: 2개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `validationPatterns`
- `tripValidation`
- `userValidation`
- `apiValidation`
- `sanitizeSQLIdentifier`
- `sanitizeHTML`
- `fileValidation`
- `async`
- `createValidationMiddleware`

### 🔧 Functions

#### `sanitizeSQLIdentifier`

**특성:** `exported`

#### `sanitizeHTML`

**특성:** `exported`

## rate-limiter.ts

**파일 경로:** `lib/security/rate-limiter.ts`

**파일 정보:**

- 📏 크기: 6805 bytes
- 📄 라인 수: 271
- 🔧 함수: 2개
- 📦 클래스: 2개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 2개

**Exports:**

- `RateLimiter`
- `async`
- `logSecurityEvent`

### 🔧 Functions

#### `applyRateLimit`

**특성:** `exported`, `async`

#### `logSecurityEvent`

**특성:** `exported`

### 📦 Classes

#### `MemoryRateLimiter`

#### `RateLimiter`

**특성:** `exported`

### 🔗 Interfaces

#### `RateLimitConfig`

#### `RateLimitData`

## security.ts

**파일 경로:** `lib/security.ts`

**파일 정보:**

- 📏 크기: 4175 bytes
- 📄 라인 수: 162
- 🔧 함수: 8개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `RateLimitConfig`
- `DEFAULT_RATE_LIMIT`
- `STRICT_RATE_LIMIT`
- `checkRateLimit`
- `getClientIP`
- `sanitizeHTML`
- `sanitizeText`
- `validateContentType`
- `checkRequestSize`
- `securityHeaders`
- `sanitizeTripData`
- `logSecurityEvent`

### 🔧 Functions

#### `checkRateLimit`

Rate limiting middleware

**특성:** `exported`

#### `getClientIP`

Rate limiting middleware
/
export function checkRateLimit(request: NextRequest, config: RateLimitConfig = DEFAULT_RATE_LIMIT): boolean {
const ip = getClientIP(request)
const key = `rate_limit:${ip}`
const now = Date.now()

const existing = rateLimitStore.get(key)

if (!existing || now > existing.resetTime) {
// Reset window
rateLimitStore.set(key, {
count: 1,
resetTime: now + config.windowMs
})
return true
}

if (existing.count >= config.maxRequests) {
return false // Rate limit exceeded
}

// Increment count
existing.count += 1
rateLimitStore.set(key, existing)
return true
}

/\*\*
Extract client IP address

**특성:** `exported`

#### `sanitizeHTML`

Rate limiting middleware
/
export function checkRateLimit(request: NextRequest, config: RateLimitConfig = DEFAULT_RATE_LIMIT): boolean {
const ip = getClientIP(request)
const key = `rate_limit:${ip}`
const now = Date.now()

const existing = rateLimitStore.get(key)

if (!existing || now > existing.resetTime) {
// Reset window
rateLimitStore.set(key, {
count: 1,
resetTime: now + config.windowMs
})
return true
}

if (existing.count >= config.maxRequests) {
return false // Rate limit exceeded
}

// Increment count
existing.count += 1
rateLimitStore.set(key, existing)
return true
}

/\*\*
Extract client IP address
/
export function getClientIP(request: NextRequest): string {
const xForwardedFor = request.headers.get('x-forwarded-for')
const xRealIP = request.headers.get('x-real-ip')

if (xForwardedFor) {
return xForwardedFor.split(',')[0].trim()
}

if (xRealIP) {
return xRealIP
}

return request.ip || 'unknown'
}

/\*\*
Sanitize HTML content to prevent XSS

**특성:** `exported`

#### `sanitizeText`

Rate limiting middleware
/
export function checkRateLimit(request: NextRequest, config: RateLimitConfig = DEFAULT_RATE_LIMIT): boolean {
const ip = getClientIP(request)
const key = `rate_limit:${ip}`
const now = Date.now()

const existing = rateLimitStore.get(key)

if (!existing || now > existing.resetTime) {
// Reset window
rateLimitStore.set(key, {
count: 1,
resetTime: now + config.windowMs
})
return true
}

if (existing.count >= config.maxRequests) {
return false // Rate limit exceeded
}

// Increment count
existing.count += 1
rateLimitStore.set(key, existing)
return true
}

/\*\*
Extract client IP address
/
export function getClientIP(request: NextRequest): string {
const xForwardedFor = request.headers.get('x-forwarded-for')
const xRealIP = request.headers.get('x-real-ip')

if (xForwardedFor) {
return xForwardedFor.split(',')[0].trim()
}

if (xRealIP) {
return xRealIP
}

return request.ip || 'unknown'
}

/\*\*
Sanitize HTML content to prevent XSS
/
export function sanitizeHTML(input: string): string {
if (typeof input !== 'string') {
return ''
}

// Remove all HTML tags
return input.replace(/<[^>]\*>/g, '')
}

/\*\*
Sanitize and validate text input

**특성:** `exported`

#### `validateContentType`

Rate limiting middleware
/
export function checkRateLimit(request: NextRequest, config: RateLimitConfig = DEFAULT_RATE_LIMIT): boolean {
const ip = getClientIP(request)
const key = `rate_limit:${ip}`
const now = Date.now()

const existing = rateLimitStore.get(key)

if (!existing || now > existing.resetTime) {
// Reset window
rateLimitStore.set(key, {
count: 1,
resetTime: now + config.windowMs
})
return true
}

if (existing.count >= config.maxRequests) {
return false // Rate limit exceeded
}

// Increment count
existing.count += 1
rateLimitStore.set(key, existing)
return true
}

/\*\*
Extract client IP address
/
export function getClientIP(request: NextRequest): string {
const xForwardedFor = request.headers.get('x-forwarded-for')
const xRealIP = request.headers.get('x-real-ip')

if (xForwardedFor) {
return xForwardedFor.split(',')[0].trim()
}

if (xRealIP) {
return xRealIP
}

return request.ip || 'unknown'
}

/\*\*
Sanitize HTML content to prevent XSS
/
export function sanitizeHTML(input: string): string {
if (typeof input !== 'string') {
return ''
}

// Remove all HTML tags
return input.replace(/<[^>]\*>/g, '')
}

/\*\*
Sanitize and validate text input
/
export function sanitizeText(input: unknown, maxLength: number = 1000): string {
if (typeof input !== 'string') {
return ''
}

// Remove dangerous characters and limit length
const sanitized = input
.replace(/[<>\"'&]/g, '') // Remove HTML/SQL injection chars
.replace(/javascript:/gi, '') // Remove javascript: protocol
.replace(/on\w+=/gi, '') // Remove event handlers
.trim()
.slice(0, maxLength)

return sanitized
}

/\*\*
Validate request content type

**특성:** `exported`

#### `checkRequestSize`

Rate limiting middleware
/
export function checkRateLimit(request: NextRequest, config: RateLimitConfig = DEFAULT_RATE_LIMIT): boolean {
const ip = getClientIP(request)
const key = `rate_limit:${ip}`
const now = Date.now()

const existing = rateLimitStore.get(key)

if (!existing || now > existing.resetTime) {
// Reset window
rateLimitStore.set(key, {
count: 1,
resetTime: now + config.windowMs
})
return true
}

if (existing.count >= config.maxRequests) {
return false // Rate limit exceeded
}

// Increment count
existing.count += 1
rateLimitStore.set(key, existing)
return true
}

/\*\*
Extract client IP address
/
export function getClientIP(request: NextRequest): string {
const xForwardedFor = request.headers.get('x-forwarded-for')
const xRealIP = request.headers.get('x-real-ip')

if (xForwardedFor) {
return xForwardedFor.split(',')[0].trim()
}

if (xRealIP) {
return xRealIP
}

return request.ip || 'unknown'
}

/\*\*
Sanitize HTML content to prevent XSS
/
export function sanitizeHTML(input: string): string {
if (typeof input !== 'string') {
return ''
}

// Remove all HTML tags
return input.replace(/<[^>]\*>/g, '')
}

/\*\*
Sanitize and validate text input
/
export function sanitizeText(input: unknown, maxLength: number = 1000): string {
if (typeof input !== 'string') {
return ''
}

// Remove dangerous characters and limit length
const sanitized = input
.replace(/[<>\"'&]/g, '') // Remove HTML/SQL injection chars
.replace(/javascript:/gi, '') // Remove javascript: protocol
.replace(/on\w+=/gi, '') // Remove event handlers
.trim()
.slice(0, maxLength)

return sanitized
}

/\*\*
Validate request content type
/
export function validateContentType(request: NextRequest, allowedTypes: string[] = ['application/json']): boolean {
const contentType = request.headers.get('content-type')

if (!contentType) {
return false
}

return allowedTypes.some(type => contentType.includes(type))
}

/\*\*
Check request size limit

**특성:** `exported`

#### `sanitizeTripData`

Rate limiting middleware
/
export function checkRateLimit(request: NextRequest, config: RateLimitConfig = DEFAULT_RATE_LIMIT): boolean {
const ip = getClientIP(request)
const key = `rate_limit:${ip}`
const now = Date.now()

const existing = rateLimitStore.get(key)

if (!existing || now > existing.resetTime) {
// Reset window
rateLimitStore.set(key, {
count: 1,
resetTime: now + config.windowMs
})
return true
}

if (existing.count >= config.maxRequests) {
return false // Rate limit exceeded
}

// Increment count
existing.count += 1
rateLimitStore.set(key, existing)
return true
}

/\*\*
Extract client IP address
/
export function getClientIP(request: NextRequest): string {
const xForwardedFor = request.headers.get('x-forwarded-for')
const xRealIP = request.headers.get('x-real-ip')

if (xForwardedFor) {
return xForwardedFor.split(',')[0].trim()
}

if (xRealIP) {
return xRealIP
}

return request.ip || 'unknown'
}

/\*\*
Sanitize HTML content to prevent XSS
/
export function sanitizeHTML(input: string): string {
if (typeof input !== 'string') {
return ''
}

// Remove all HTML tags
return input.replace(/<[^>]\*>/g, '')
}

/\*\*
Sanitize and validate text input
/
export function sanitizeText(input: unknown, maxLength: number = 1000): string {
if (typeof input !== 'string') {
return ''
}

// Remove dangerous characters and limit length
const sanitized = input
.replace(/[<>\"'&]/g, '') // Remove HTML/SQL injection chars
.replace(/javascript:/gi, '') // Remove javascript: protocol
.replace(/on\w+=/gi, '') // Remove event handlers
.trim()
.slice(0, maxLength)

return sanitized
}

/\*\*
Validate request content type
/
export function validateContentType(request: NextRequest, allowedTypes: string[] = ['application/json']): boolean {
const contentType = request.headers.get('content-type')

if (!contentType) {
return false
}

return allowedTypes.some(type => contentType.includes(type))
}

/\*_
Check request size limit
/
export function checkRequestSize(request: NextRequest, maxSizeBytes: number = 1024 _ 1024): boolean {
const contentLength = request.headers.get('content-length')

if (!contentLength) {
return true // Allow requests without content-length
}

return parseInt(contentLength) <= maxSizeBytes
}

/\*\*
Security headers for API responses
/
export const securityHeaders = {
'X-Content-Type-Options': 'nosniff',
'X-Frame-Options': 'DENY',
'X-XSS-Protection': '1; mode=block',
'Cache-Control': 'private, no-cache, no-store, must-revalidate',
'Pragma': 'no-cache',
'Expires': '0'
}

/\*\*
Validate and sanitize trip data

**특성:** `exported`

#### `logSecurityEvent`

Rate limiting middleware
/
export function checkRateLimit(request: NextRequest, config: RateLimitConfig = DEFAULT_RATE_LIMIT): boolean {
const ip = getClientIP(request)
const key = `rate_limit:${ip}`
const now = Date.now()

const existing = rateLimitStore.get(key)

if (!existing || now > existing.resetTime) {
// Reset window
rateLimitStore.set(key, {
count: 1,
resetTime: now + config.windowMs
})
return true
}

if (existing.count >= config.maxRequests) {
return false // Rate limit exceeded
}

// Increment count
existing.count += 1
rateLimitStore.set(key, existing)
return true
}

/\*\*
Extract client IP address
/
export function getClientIP(request: NextRequest): string {
const xForwardedFor = request.headers.get('x-forwarded-for')
const xRealIP = request.headers.get('x-real-ip')

if (xForwardedFor) {
return xForwardedFor.split(',')[0].trim()
}

if (xRealIP) {
return xRealIP
}

return request.ip || 'unknown'
}

/\*\*
Sanitize HTML content to prevent XSS
/
export function sanitizeHTML(input: string): string {
if (typeof input !== 'string') {
return ''
}

// Remove all HTML tags
return input.replace(/<[^>]\*>/g, '')
}

/\*\*
Sanitize and validate text input
/
export function sanitizeText(input: unknown, maxLength: number = 1000): string {
if (typeof input !== 'string') {
return ''
}

// Remove dangerous characters and limit length
const sanitized = input
.replace(/[<>\"'&]/g, '') // Remove HTML/SQL injection chars
.replace(/javascript:/gi, '') // Remove javascript: protocol
.replace(/on\w+=/gi, '') // Remove event handlers
.trim()
.slice(0, maxLength)

return sanitized
}

/\*\*
Validate request content type
/
export function validateContentType(request: NextRequest, allowedTypes: string[] = ['application/json']): boolean {
const contentType = request.headers.get('content-type')

if (!contentType) {
return false
}

return allowedTypes.some(type => contentType.includes(type))
}

/\*_
Check request size limit
/
export function checkRequestSize(request: NextRequest, maxSizeBytes: number = 1024 _ 1024): boolean {
const contentLength = request.headers.get('content-length')

if (!contentLength) {
return true // Allow requests without content-length
}

return parseInt(contentLength) <= maxSizeBytes
}

/\*\*
Security headers for API responses
/
export const securityHeaders = {
'X-Content-Type-Options': 'nosniff',
'X-Frame-Options': 'DENY',
'X-XSS-Protection': '1; mode=block',
'Cache-Control': 'private, no-cache, no-store, must-revalidate',
'Pragma': 'no-cache',
'Expires': '0'
}

/\*\*
Validate and sanitize trip data
/
export function sanitizeTripData(data: any) {
return {
country: sanitizeText(data.country, 100),
entryDate: data.entryDate, // Date validation handled by Zod
exitDate: data.exitDate,
visaType: sanitizeText(data.visaType, 50),
maxDays: typeof data.maxDays === 'number' ? Math.max(1, Math.min(365, data.maxDays)) : 30,
passportCountry: sanitizeText(data.passportCountry, 10),
notes: data.notes ? sanitizeHTML(data.notes).slice(0, 2000) : null
}
}

/\*\*
Log security events

**특성:** `exported`

### 🔗 Interfaces

#### `RateLimitConfig`

**특성:** `exported`

## travel-manager.ts

**파일 경로:** `lib/travel-manager.ts`

**설명:** PURPOSE: 여행 관리 핵심 비즈니스 로직 - 여행 CRUD, 솅겐 계산, 분석 기능

**파일 정보:**

- 📏 크기: 15694 bytes
- 📄 라인 수: 573
- 🔧 함수: 3개
- 📦 클래스: 1개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 3개

**Exports:**

- `TravelManagerOptions`
- `TripSummary`
- `TravelInsights`
- `TravelManager`
- `createTravelManager`
- `async`

### 🔧 Functions

#### `createTravelManager`

**특성:** `exported`

#### `getUserTravelSummary`

**특성:** `exported`, `async`

#### `validateUserTrip`

**특성:** `exported`, `async`

### 📦 Classes

#### `TravelManager`

**특성:** `exported`

### 🔗 Interfaces

#### `TravelManagerOptions`

**특성:** `exported`

#### `TripSummary`

**특성:** `exported`

#### `TravelInsights`

**특성:** `exported`

## utils.ts

**파일 경로:** `lib/utils.ts`

**파일 정보:**

- 📏 크기: 165 bytes
- 📄 라인 수: 6
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 0개

**Exports:**

- `cn`

### 🔧 Functions

#### `cn`

**특성:** `exported`

## visa-requirements.ts

**파일 경로:** `lib/visa-requirements.ts`

**파일 정보:**

- 📏 크기: 4318 bytes
- 📄 라인 수: 107
- 🔧 함수: 1개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

**Exports:**

- `getVisaRequirements`
- `POPULAR_DESTINATIONS`

### 🔧 Functions

#### `getVisaRequirements`

**특성:** `exported`

### 🔗 Interfaces

#### `VisaRequirement`

## email.ts

**파일 경로:** `types/email.ts`

**파일 정보:**

- 📏 크기: 3529 bytes
- 📄 라인 수: 113
- 🔧 함수: 0개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 6개

**Exports:**

- `EmailProvider`
- `EmailPattern`
- `ParsedEmailData`
- `EmailParserResult`
- `EmailParserOptions`
- `KOREAN_AIRLINES`
- `AirportInfo`
- `MAJOR_AIRPORTS`

### 🔗 Interfaces

#### `EmailProvider`

**특성:** `exported`

#### `EmailPattern`

**특성:** `exported`

#### `ParsedEmailData`

**특성:** `exported`

#### `EmailParserResult`

**특성:** `exported`

#### `EmailParserOptions`

**특성:** `exported`

#### `AirportInfo`

**특성:** `exported`

## global.ts

**파일 경로:** `types/global.ts`

**설명:** Global type definitions for DiNoCal

**파일 정보:**

- 📏 크기: 1356 bytes
- 📄 라인 수: 69
- 🔧 함수: 0개
- 📦 클래스: 0개
- 🏷️ 타입: 2개
- 🔗 인터페이스: 5개

**Exports:**

- `VisaType`
- `PassportCountry`
- `CountryVisit`
- `User`
- `SchengenStatus`
- `SchengenViolation`
- `NotificationSettings`

### 🔗 Interfaces

#### `CountryVisit`

**특성:** `exported`

#### `User`

**특성:** `exported`

#### `SchengenStatus`

**특성:** `exported`

#### `SchengenViolation`

**특성:** `exported`

#### `NotificationSettings`

**특성:** `exported`

### 🏷️ Types

- `VisaType` (exported)
- `PassportCountry` (exported)

## gmail.ts

**파일 경로:** `types/gmail.ts`

**파일 정보:**

- 📏 크기: 1812 bytes
- 📄 라인 수: 100
- 🔧 함수: 0개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 11개

**Exports:**

- `GmailMessage`
- `GmailPayload`
- `GmailHeader`
- `GmailBody`
- `ParsedEmail`
- `ExtractedTravelInfo`
- `GmailSearchOptions`
- `GmailConnectionStatus`
- `TravelEmailPattern`
- `GmailError`
- `EmailParsingConfig`

### 🔗 Interfaces

#### `GmailMessage`

**특성:** `exported`

#### `GmailPayload`

**특성:** `exported`

#### `GmailHeader`

**특성:** `exported`

#### `GmailBody`

**특성:** `exported`

#### `ParsedEmail`

**특성:** `exported`

#### `ExtractedTravelInfo`

**특성:** `exported`

#### `GmailSearchOptions`

**특성:** `exported`

#### `GmailConnectionStatus`

**특성:** `exported`

#### `TravelEmailPattern`

**특성:** `exported`

#### `GmailError`

**특성:** `exported`

#### `EmailParsingConfig`

**특성:** `exported`

## gtag.d.ts

**파일 경로:** `types/gtag.d.ts`

**파일 정보:**

- 📏 크기: 233 bytes
- 📄 라인 수: 12
- 🔧 함수: 0개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 1개

### 🔗 Interfaces

#### `Window`

## next-auth.d.ts

**파일 경로:** `types/next-auth.d.ts`

**파일 정보:**

- 📏 크기: 574 bytes
- 📄 라인 수: 33
- 🔧 함수: 0개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 3개

### 🔗 Interfaces

#### `Session`

#### `User`

#### `JWT`

## notification.ts

**파일 경로:** `types/notification.ts`

**파일 정보:**

- 📏 크기: 982 bytes
- 📄 라인 수: 41
- 🔧 함수: 0개
- 📦 클래스: 0개
- 🏷️ 타입: 0개
- 🔗 인터페이스: 3개

**Exports:**

- `Notification`
- `NotificationPreferences`
- `NotificationSchedule`

### 🔗 Interfaces

#### `Notification`

**특성:** `exported`

#### `NotificationPreferences`

**특성:** `exported`

#### `NotificationSchedule`

**특성:** `exported`

---

_📅 생성일: 2025. 7. 29. 오후 5:23:13_
_📊 총 101개 파일 문서화_
