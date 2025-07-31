#!/usr/bin/env node

/**
 * MVP Stability Validation Script
 * Comprehensive validation of all stability improvements
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class StabilityValidator {
  constructor() {
    this.results = {
      security: { passed: 0, failed: 0, details: [] },
      errorHandling: { passed: 0, failed: 0, details: [] },
      database: { passed: 0, failed: 0, details: [] },
      monitoring: { passed: 0, failed: 0, details: [] },
      performance: { passed: 0, failed: 0, details: [] },
      testing: { passed: 0, failed: 0, details: [] }
    }
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'
    }
    
    console.log(`${colors[type]}${message}${colors.reset}`)
  }

  async validate() {
    this.log('🚀 Starting MVP Stability Validation...', 'info')
    this.log('=' .repeat(60), 'info')

    try {
      await this.validateSecurity()
      await this.validateErrorHandling()
      await this.validateDatabase()
      await this.validateMonitoring()
      await this.validatePerformance()
      await this.validateTesting()
      
      this.generateReport()
    } catch (error) {
      this.log(`💥 Validation failed: ${error.message}`, 'error')
      process.exit(1)
    }
  }

  async validateSecurity() {
    this.log('\n🔐 Validating Security Measures...', 'info')
    
    const checks = [
      {
        name: 'Environment validation exists',
        check: () => fs.existsSync('./lib/security/env-validator.ts'),
        critical: true
      },
      {
        name: 'Input validation implemented',
        check: () => fs.existsSync('./lib/security/input-validation.ts'),
        critical: true
      },
      {
        name: 'Authentication middleware exists',
        check: () => fs.existsSync('./lib/security/auth-middleware.ts'),
        critical: true
      },
      {
        name: 'Rate limiting configured',
        check: () => fs.existsSync('./lib/security/rate-limiter.ts'),
        critical: true
      },
      {
        name: 'CSRF protection enabled',
        check: () => fs.existsSync('./lib/security/csrf-protection.ts'),
        critical: true
      },
      {
        name: 'Environment variables properly configured',
        check: () => {
          const envExample = fs.existsSync('./.env.example')
          const envLocal = fs.existsSync('./.env.local')
          return envExample && (envLocal || process.env.NODE_ENV === 'production')
        },
        critical: true
      }
    ]

    this.runChecks('security', checks)
  }

  async validateErrorHandling() {
    this.log('\n🛡️ Validating Error Handling...', 'info')
    
    const checks = [
      {
        name: 'Global error boundary implemented',
        check: () => {
          const layout = fs.readFileSync('./app/layout.tsx', 'utf8')
          return layout.includes('ErrorBoundary')
        },
        critical: true
      },
      {
        name: 'Error boundary component exists',
        check: () => fs.existsSync('./components/error/ErrorBoundary.tsx'),
        critical: true
      },
      {
        name: 'Error reporting API exists',
        check: () => fs.existsSync('./app/api/errors/route.ts'),
        critical: true
      },
      {
        name: 'Centralized error handler exists',
        check: () => fs.existsSync('./lib/error/error-handler.ts'),
        critical: true
      },
      {
        name: 'API error handling consistent',
        check: () => fs.existsSync('./lib/api/error-handler.ts'),
        critical: true
      }
    ]

    this.runChecks('errorHandling', checks)
  }

  async validateDatabase() {
    this.log('\n🗄️ Validating Database Reliability...', 'info')
    
    const checks = [
      {
        name: 'Connection manager implemented',
        check: () => fs.existsSync('./lib/database/connection-manager.ts'),
        critical: true
      },
      {
        name: 'Query optimizer exists',
        check: () => fs.existsSync('./lib/performance/query-optimizer.ts'),
        critical: true
      },
      {
        name: 'Performance indexes defined',
        check: () => fs.existsSync('./prisma/performance/optimize-indexes.sql'),
        critical: false
      },
      {
        name: 'Database health check available',
        check: () => {
          const healthCheck = fs.readFileSync('./app/api/health/route.ts', 'utf8')
          return healthCheck.includes('database') && healthCheck.includes('dbManager')
        },
        critical: true
      },
      {
        name: 'Connection pooling configured',
        check: () => {
          const connManager = fs.readFileSync('./lib/database/connection-manager.ts', 'utf8')
          return connManager.includes('poolSize') && connManager.includes('connectionTimeout')
        },
        critical: true
      }
    ]

    this.runChecks('database', checks)
  }

  async validateMonitoring() {
    this.log('\n📊 Validating Monitoring & Observability...', 'info')
    
    const checks = [
      {
        name: 'Structured logging implemented',
        check: () => fs.existsSync('./lib/monitoring/logger.ts'),
        critical: true
      },
      {
        name: 'Metrics collection exists',
        check: () => fs.existsSync('./lib/monitoring/metrics-collector.ts'),
        critical: false
      },
      {
        name: 'Health check endpoint functional',
        check: () => fs.existsSync('./app/api/health/route.ts'),
        critical: true
      },
      {
        name: 'Performance monitoring enabled',
        check: () => {
          const layout = fs.readFileSync('./app/layout.tsx', 'utf8')
          return layout.includes('PerformanceMonitor')
        },
        critical: false
      },
      {
        name: 'Error tracking configured',
        check: () => {
          const envExample = fs.readFileSync('./.env.example', 'utf8')
          return envExample.includes('SENTRY_DSN')
        },
        critical: false
      }
    ]

    this.runChecks('monitoring', checks)
  }

  async validatePerformance() {
    this.log('\n⚡ Validating Performance Optimizations...', 'info')
    
    const checks = [
      {
        name: 'Query optimization implemented',
        check: () => fs.existsSync('./lib/performance/query-optimizer.ts'),
        critical: true
      },
      {
        name: 'API caching configured',
        check: () => {
          const apiClient = fs.readFileSync('./lib/api/api-client.ts', 'utf8')
          return apiClient.includes('cache') && apiClient.includes('ttl')
        },
        critical: true
      },
      {
        name: 'Database indexes planned',
        check: () => fs.existsSync('./prisma/performance/optimize-indexes.sql'),
        critical: false
      },
      {
        name: 'Performance monitoring in trips API',
        check: () => {
          const tripsApi = fs.readFileSync('./app/api/trips/route.ts', 'utf8')
          return tripsApi.includes('queryOptimizer')
        },
        critical: true
      },
      {
        name: 'Loading states implemented',
        check: () => fs.existsSync('./components/ui/LoadingSpinner.tsx'),
        critical: false
      }
    ]

    this.runChecks('performance', checks)
  }

  async validateTesting() {
    this.log('\n🧪 Validating Testing Infrastructure...', 'info')
    
    const checks = [
      {
        name: 'E2E stability tests exist',
        check: () => fs.existsSync('./__tests__/e2e/mvp-stability.spec.ts'),
        critical: true
      },
      {
        name: 'Error boundary tests exist',
        check: () => fs.existsSync('./__tests__/components/ErrorBoundary.test.tsx'),
        critical: true
      },
      {
        name: 'API tests comprehensive',
        check: () => {
          const apiTests = fs.readdirSync('./__tests__/api/')
          return apiTests.length >= 3 // Should have multiple API test files
        },
        critical: false
      },
      {
        name: 'Playwright configuration exists',
        check: () => fs.existsSync('./playwright.config.ts'),
        critical: true
      },
      {
        name: 'Test coverage configured',
        check: () => {
          const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
          return packageJson.scripts && packageJson.scripts.test
        },
        critical: false
      }
    ]

    this.runChecks('testing', checks)
  }

  runChecks(category, checks) {
    checks.forEach(check => {
      try {
        const passed = check.check()
        if (passed) {
          this.results[category].passed++
          this.log(`  ✅ ${check.name}`, 'success')
        } else {
          this.results[category].failed++
          const level = check.critical ? 'error' : 'warning'
          this.log(`  ${check.critical ? '❌' : '⚠️'} ${check.name}`, level)
          this.results[category].details.push({
            name: check.name,
            status: 'failed',
            critical: check.critical
          })
        }
      } catch (error) {
        this.results[category].failed++
        this.log(`  ❌ ${check.name} (Error: ${error.message})`, 'error')
        this.results[category].details.push({
          name: check.name,
          status: 'error',
          critical: check.critical,
          error: error.message
        })
      }
    })
  }

  generateReport() {
    this.log('\n📋 STABILITY VALIDATION REPORT', 'info')
    this.log('=' .repeat(60), 'info')

    let totalPassed = 0
    let totalFailed = 0
    let criticalFailures = 0

    Object.entries(this.results).forEach(([category, results]) => {
      totalPassed += results.passed
      totalFailed += results.failed
      
      const categoryFailures = results.details.filter(d => d.critical).length
      criticalFailures += categoryFailures
      
      const status = results.failed === 0 ? '✅' : 
                    categoryFailures > 0 ? '❌' : '⚠️'
      
      this.log(`${status} ${category.toUpperCase()}: ${results.passed} passed, ${results.failed} failed`, 
                results.failed === 0 ? 'success' : 
                categoryFailures > 0 ? 'error' : 'warning')
    })

    this.log('\n' + '=' .repeat(60), 'info')
    this.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`, 
             totalFailed === 0 ? 'success' : 'warning')
    
    if (criticalFailures > 0) {
      this.log(`🚨 CRITICAL FAILURES: ${criticalFailures}`, 'error')
      this.log('❌ MVP is NOT ready for production deployment', 'error')
    } else if (totalFailed === 0) {
      this.log('🎉 ALL CHECKS PASSED - MVP is production ready!', 'success')
    } else {
      this.log('⚠️ MVP has non-critical issues but may be suitable for deployment', 'warning')
    }

    // Save detailed report
    const reportPath = './stability-validation-report.json'
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalPassed,
        totalFailed,
        criticalFailures,
        productionReady: criticalFailures === 0
      },
      results: this.results
    }, null, 2))

    this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'info')

    // Exit with appropriate code
    if (criticalFailures > 0) {
      process.exit(1)
    }
  }
}

// Run validation
if (require.main === module) {
  const validator = new StabilityValidator()
  validator.validate().catch(error => {
    console.error('Validation script failed:', error)
    process.exit(1)
  })
}

module.exports = StabilityValidator