# 🚨 긴급 상황 대응 - Smart Problem Solving 모드

> 개발 중 막힘 없는 문제 해결을 위한 체계적 디버깅 및 복구 마스터 가이드

상황이 급하지? 괜찮아! 이 가이드는 어떤 기술적 문제든 2분 안에 해결 방향을 찾을 수 있도록 설계된 검증된 프로세스야. 패닉 대신 체계적 접근으로 효율적으로 해결해보자.

---

## 🎯 이런 상황에 사용하세요

🚨 **서버가 갑자기 죽었거나 빌드가 실패한 경우**
🚨 **에러 메시지를 봐도 도무지 원인을 모르겠는 경우**
🚨 **데드라인이 임박했는데 중요한 기능이 작동하지 않는 경우**
🚨 **새로운 기술 스택에서 예상치 못한 문제가 발생한 경우**
🚨 **팀원이나 사용자로부터 긴급 버그 리포트가 들어온 경우**

---

## ⚡ 즉시 활성화 - Smart Problem Solving 시스템

### 🔥 2분 룰 엄격 적용

**절대 원칙**: 어떤 문제든 2분 이상 혼자 고민하지 말 것!

```
⏰ 0-30초: 에러 메시지 정확히 읽기
⏰ 30초-1분: 기존 경험에서 해결책 탐색
⏰ 1분-2분: 로그, 설정 파일 점검
⏰ 2분 초과: 즉시 웹 검색 시작! 🚀
```

**필수 학습 자료**:
```
@/MASTER_PLAYBOOK/20_Smart_Problem_Solving/README.md - 전체 정독 필수!
```

### 🧠 5단계 Problem Solving 파이프라인

**Stage 1: 즉시 진단 (30초)**
```typescript
// 문제 상황 즉시 분류
interface EmergencyDiagnosis {
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: 'production' | 'development' | 'local';
  category: 'build' | 'runtime' | 'network' | 'data' | 'auth' | 'performance';
  timeConstraint: 'immediate' | 'urgent' | 'normal';
}

const diagnoseProblem = (error: string, context: string): EmergencyDiagnosis => {
  // 키워드 기반 자동 분류
  if (error.includes('EADDRINUSE') || error.includes('port')) {
    return { severity: 'medium', impact: 'development', category: 'network', timeConstraint: 'urgent' };
  }
  if (error.includes('Cannot find module') || error.includes('MODULE_NOT_FOUND')) {
    return { severity: 'high', impact: 'development', category: 'build', timeConstraint: 'urgent' };
  }
  if (error.includes('500') || error.includes('database')) {
    return { severity: 'critical', impact: 'production', category: 'runtime', timeConstraint: 'immediate' };
  }
  // ... 더 많은 패턴들
};
```

**Stage 2: 구조적 분석 (1분)**
```bash
# 즉시 실행할 진단 명령어들
echo "=== 시스템 상태 체크 ==="
ps aux | grep node  # Node 프로세스 확인
netstat -tulpn | grep :3000  # 포트 사용 상태
df -h  # 디스크 공간

echo "=== 로그 확인 ==="
tail -n 50 /var/log/application.log  # 애플리케이션 로그
npm list --depth=0  # 의존성 확인
git status  # Git 상태

echo "=== 환경 변수 ==="
env | grep -E "(NODE|PORT|DATABASE)"  # 주요 환경 변수
```

**Stage 3: 웹 검색 (2분) - 자동 트리거!**
```
검색 쿼리 템플릿:
1. "[기술스택] [정확한 에러메시지] fix 2024"
2. "[프레임워크] [에러코드] solution stackoverflow"
3. "[라이브러리명] [버전] [증상] github issues"
```

**Stage 4: 커뮤니티 솔루션 (5분)**
```
우선순위별 검색 소스:
1. Stack Overflow (실용적 해결책)
2. GitHub Issues (버그 리포트 및 해결책)
3. 공식 문서 (정확한 API 사용법)
4. Reddit r/programming, r/webdev (최신 트렌드)
5. Discord/Slack 커뮤니티 (실시간 도움)
```

**Stage 5: 전문가 패턴 (10분)**
```typescript
// 근본 원인 분석 체크리스트
interface RootCauseAnalysis {
  timeline: string[];  // 문제 발생 직전 변경사항
  environment: string; // 개발/스테이징/프로덕션 환경 차이
  dependencies: string[]; // 최근 설치/업데이트된 패키지
  configuration: object; // 설정 파일 변경사항
  infrastructure: string; // 서버, 네트워크, 인프라 이슈
}

const analyzeRootCause = (problem: EmergencyDiagnosis): RootCauseAnalysis => {
  return {
    timeline: getRecentChanges(),
    environment: compareEnvironments(),
    dependencies: checkDependencyConflicts(),
    configuration: auditConfigChanges(),
    infrastructure: monitorSystemHealth()
  };
};
```

---

## 🛠️ 상황별 긴급 대응 매뉴얼

### 🔥 빌드 실패 - 즉시 복구

**증상**: `npm run build` 또는 `yarn build` 실패

```bash
# 1단계: 즉시 진단 (30초)
echo "=== 빌드 환경 체크 ==="
node --version && npm --version
ls -la package.json package-lock.json
echo $NODE_ENV

# 2단계: 캐시 정리 (1분)
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 3단계: 의존성 충돌 해결 (2분)
npm audit fix
npm ls | grep -i error  # 의존성 트리 에러 확인

# 4단계: 단계별 빌드 테스트
npm run lint  # 린트 에러 먼저 수정
npm run type-check  # 타입 에러 확인
npm run build  # 최종 빌드
```

**웹 검색 쿼리**:
```
"[빌드도구] build failed [구체적 에러메시지] fix 2024"
"webpack module not found [모듈명] solution"
"typescript build error [에러코드] resolve"
```

### 🌐 서버 다운 - 응급 복구

**증상**: 서버 접속 불가, 500 에러, 응답 없음

```bash
# 1단계: 서버 상태 즉시 확인 (30초)
curl -I http://localhost:3000  # 헬스체크
ps aux | grep -E "(node|python|java)"  # 프로세스 확인
netstat -tulpn | grep -E "(3000|8000|80|443)"  # 포트 상태

# 2단계: 로그 분석 (1분)
tail -n 100 /var/log/nginx/error.log  # 웹서버 로그
tail -n 100 ~/.pm2/logs/app-error.log  # 애플리케이션 로그
dmesg | tail  # 시스템 로그

# 3단계: 응급 재시작 (1분)
pm2 restart all  # PM2 사용 시
sudo systemctl restart nginx  # Nginx 재시작
docker-compose restart  # Docker 사용 시

# 4단계: 데이터베이스 연결 확인
ping database-host
telnet database-host 5432  # PostgreSQL
telnet database-host 3306  # MySQL
```

**웹 검색 쿼리**:
```
"[서버환경] server not responding troubleshoot 2024"
"502 bad gateway nginx [원인] fix"
"database connection refused [DB종류] solution"
```

### 💾 데이터베이스 연결 오류

**증상**: DB 연결 실패, 쿼리 타임아웃, 트랜잭션 에러

```bash
# 1단계: 연결 상태 확인 (30초)
telnet db-host 5432  # PostgreSQL
mysql -h db-host -u user -p  # MySQL 직접 연결 테스트

# 2단계: 연결 풀 상태 확인 (1분)
echo "SELECT COUNT(*) FROM pg_stat_activity;" | psql  # PostgreSQL
echo "SHOW PROCESSLIST;" | mysql  # MySQL

# 3단계: 애플리케이션 연결 설정 검증
grep -r "database\|db\|connection" .env*
cat config/database.js  # 설정 파일 확인

# 4단계: 연결 풀 리셋
pm2 restart app  # 애플리케이션 재시작
# 또는 연결 풀 초기화 코드 실행
```

**웹 검색 쿼리**:
```
"[DB종류] connection refused fix 2024"
"connection pool exhausted [ORM] solution"
"database timeout [프레임워크] resolve"
```

### 🔐 인증/권한 에러

**증상**: 401, 403 에러, 토큰 만료, 세션 오류

```bash
# 1단계: 토큰/세션 상태 확인 (30초)
echo $JWT_SECRET  # JWT 시크릿 확인
redis-cli ping  # Redis 세션 스토어 확인

# 2단계: 인증 미들웨어 로그 확인 (1분)
grep -r "auth\|jwt\|session" logs/
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/protected

# 3단계: 권한 설정 검증
ls -la uploads/  # 파일 권한 확인
sudo -u www-data ls -la /var/www/  # 웹서버 권한 확인

# 4단계: 인증 시스템 리셋
redis-cli FLUSHALL  # 세션 초기화 (주의!)
# JWT 시크릿 로테이션 (필요시)
```

**웹 검색 쿼리**:
```
"JWT token expired handling [프레임워크] 2024"
"401 unauthorized [인증라이브러리] fix"
"session middleware [기술스택] troubleshoot"
```

---

## 🔍 실시간 디버깅 도구 활용

### 📊 성능 모니터링 명령어

```bash
# CPU 및 메모리 사용량 실시간 모니터링
top -p $(pgrep node)  # Node.js 프로세스 모니터링
htop  # 시스템 전체 리소스 확인

# 네트워크 연결 상태
ss -tulpn | grep :3000  # 포트별 연결 상태
netstat -i  # 네트워크 인터페이스 통계

# 디스크 I/O 모니터링
iotop  # 디스크 사용량 실시간 확인
df -h && du -sh /var/log/*  # 디스크 공간 및 로그 크기
```

### 🐛 애플리케이션 레벨 디버깅

```typescript
// 긴급 디버깅을 위한 로깅 유틸리티
class EmergencyDebugger {
  private static instance: EmergencyDebugger;
  private debugMode = process.env.NODE_ENV === 'development';

  static getInstance(): EmergencyDebugger {
    if (!EmergencyDebugger.instance) {
      EmergencyDebugger.instance = new EmergencyDebugger();
    }
    return EmergencyDebugger.instance;
  }

  logError(error: Error, context: string = ''): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    };

    console.error('🚨 EMERGENCY DEBUG:', JSON.stringify(errorInfo, null, 2));

    // 프로덕션에서는 외부 로깅 서비스로 전송
    if (!this.debugMode) {
      this.sendToLoggingService(errorInfo);
    }
  }

  logPerformance(label: string, startTime: number): void {
    const duration = Date.now() - startTime;
    console.log(`⏱️ PERFORMANCE [${label}]: ${duration}ms`);

    if (duration > 1000) {
      console.warn(`🐌 SLOW OPERATION [${label}]: ${duration}ms`);
    }
  }

  dumpSystemState(): void {
    const systemState = {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        // 민감한 정보는 마스킹
      }
    };

    console.log('📊 SYSTEM STATE:', JSON.stringify(systemState, null, 2));
  }

  private sendToLoggingService(errorInfo: any): void {
    // Sentry, LogRocket, DataDog 등 외부 서비스 연동
    // 구현 예시는 각 서비스 문서 참조
  }
}

// 사용 예시
const debugger = EmergencyDebugger.getInstance();

// API 에러 디버깅
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  debugger.logError(error, `API: ${req.method} ${req.path}`);

  if (process.env.NODE_ENV === 'development') {
    debugger.dumpSystemState();
  }

  res.status(500).json({ error: 'Internal Server Error' });
});

// 성능 디버깅
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    debugger.logPerformance(`${req.method} ${req.path}`, startTime);
  });
  next();
});
```

---

## 💡 예방 중심 긴급 대응 시스템

### 🔔 자동 알림 및 모니터링

```typescript
// 문제 발생 전 조기 경고 시스템
class EarlyWarningSystem {
  private thresholds = {
    memory: 80, // 메모리 사용률 80% 이상
    cpu: 70,    // CPU 사용률 70% 이상
    diskSpace: 90, // 디스크 사용률 90% 이상
    responseTime: 2000, // 응답 시간 2초 이상
    errorRate: 5 // 에러율 5% 이상
  };

  monitorSystem(): void {
    setInterval(() => {
      this.checkMemoryUsage();
      this.checkCPUUsage();
      this.checkDiskSpace();
      this.checkResponseTime();
      this.checkErrorRate();
    }, 60000); // 1분마다 체크
  }

  private checkMemoryUsage(): void {
    const usage = process.memoryUsage();
    const usagePercent = (usage.heapUsed / usage.heapTotal) * 100;

    if (usagePercent > this.thresholds.memory) {
      this.sendAlert('HIGH_MEMORY_USAGE', {
        current: usagePercent,
        threshold: this.thresholds.memory,
        recommendation: 'Check for memory leaks, restart if necessary'
      });
    }
  }

  private sendAlert(type: string, data: any): void {
    console.warn(`🚨 EARLY WARNING [${type}]:`, data);

    // Slack, Discord, 이메일 등으로 알림 전송
    // 구현은 각 플랫폼별 API 문서 참조

    // 자동 복구 로직 실행 (옵션)
    this.attemptAutoRecovery(type, data);
  }

  private attemptAutoRecovery(type: string, data: any): void {
    switch (type) {
      case 'HIGH_MEMORY_USAGE':
        // 가비지 컬렉션 강제 실행
        if (global.gc) global.gc();
        break;
      case 'HIGH_DISK_USAGE':
        // 오래된 로그 파일 정리
        this.cleanupOldLogs();
        break;
      // 다른 자동 복구 로직들...
    }
  }

  private cleanupOldLogs(): void {
    // 7일 이상 된 로그 파일 삭제
    const exec = require('child_process').exec;
    exec('find /var/log -name "*.log" -mtime +7 -delete', (error, stdout, stderr) => {
      if (error) {
        console.error('Log cleanup failed:', error);
      } else {
        console.log('Old logs cleaned up successfully');
      }
    });
  }
}
```

### 🏥 자동 복구 메커니즘

```bash
#!/bin/bash
# emergency-recovery.sh - 자동 복구 스크립트

echo "🚨 Emergency Recovery Mode Activated"

# 1. 시스템 리소스 확인
echo "=== Checking System Resources ==="
free -h
df -h
ps aux --sort=-%cpu | head -10

# 2. 서비스 상태 확인 및 복구
echo "=== Service Health Check ==="
services=("nginx" "postgresql" "redis")

for service in "${services[@]}"; do
  if ! systemctl is-active --quiet $service; then
    echo "⚠️ $service is down, attempting restart..."
    sudo systemctl restart $service
    sleep 5

    if systemctl is-active --quiet $service; then
      echo "✅ $service restarted successfully"
    else
      echo "❌ $service restart failed"
      # 알림 전송 로직
    fi
  else
    echo "✅ $service is running"
  fi
done

# 3. 애플리케이션 복구
echo "=== Application Recovery ==="
if pgrep -f "node.*app.js" > /dev/null; then
  echo "✅ Application is running"
else
  echo "⚠️ Application is down, restarting..."
  pm2 restart all
  sleep 10

  if pgrep -f "node.*app.js" > /dev/null; then
    echo "✅ Application restarted successfully"
  else
    echo "❌ Application restart failed"
    # 긴급 알림 전송
  fi
fi

# 4. 데이터베이스 연결 테스트
echo "=== Database Connection Test ==="
if pg_isready -h localhost -p 5432; then
  echo "✅ Database connection OK"
else
  echo "❌ Database connection failed"
  # DB 복구 로직 또는 긴급 알림
fi

echo "🏁 Emergency Recovery Complete"
```

---

## 📞 긴급 상황 체크리스트

### ⚡ 즉시 실행 (첫 2분)

**Step 1: 상황 파악**
- [ ] 에러 메시지 정확한 텍스트 복사
- [ ] 문제 발생 시점 및 변경사항 확인
- [ ] 영향 범위 파악 (로컬/개발/프로덕션)
- [ ] 사용자 영향도 평가

**Step 2: 즉시 대응**
- [ ] 2분 룰 적용 - 웹 검색 시작
- [ ] 로그 파일 확인 및 관련 정보 수집
- [ ] 시스템 리소스 상태 체크
- [ ] 관련 팀원에게 상황 공유

### 🔧 체계적 해결 (5-10분)

**Step 3: 구조적 분석**
- [ ] 5단계 파이프라인 적용
- [ ] Stack Overflow, GitHub Issues 검색
- [ ] 공식 문서 및 커뮤니티 검색
- [ ] 유사 사례 및 해결책 수집

**Step 4: 솔루션 적용**
- [ ] 백업 또는 롤백 계획 수립
- [ ] 테스트 환경에서 솔루션 검증
- [ ] 프로덕션 적용 및 모니터링
- [ ] 해결 과정 문서화

### 📝 사후 관리

**Step 5: 개선 및 예방**
- [ ] 근본 원인 분석 및 기록
- [ ] 재발 방지 대책 수립
- [ ] 모니터링 및 알림 시스템 개선
- [ ] 팀 지식 공유 및 프로세스 업데이트

---

## 🚀 긴급 상황 시작하기

### 📞 지금 당장 도움이 필요하다면!

**현재 상황을 다음 형식으로 알려주세요:**

```markdown
## 🚨 긴급 상황 정보
- **문제 유형**: [빌드실패/서버다운/DB연결오류/성능문제/기타]
- **에러 메시지**: [정확한 에러 메시지 전문]
- **발생 시점**: [언제부터 문제가 시작되었는지]
- **최근 변경사항**: [문제 발생 전 마지막 수정 내용]
- **영향 범위**: [로컬/개발/스테이징/프로덕션]
- **기술 스택**: [사용 중인 주요 기술들]
- **시급성**: [즉시/긴급/일반] - 사용자 영향도 포함
```

**💡 긴급 대응 준비물**
- [ ] 에러 로그 파일 또는 스크린샷
- [ ] 최근 Git 커밋 히스토리
- [ ] 시스템 환경 정보 (OS, Node 버전 등)
- [ ] 네트워크 및 서비스 상태 정보

**Ready for Emergency Response?** 상황 정보를 공유해주시면 2분 룰에 따라 즉시 해결책을 찾아보겠습니다! 🚨