#!/usr/bin/env node

/**
 * Deployment Health Check Script
 * Verifies that the deployed application is healthy
 */

const https = require('https');
const http = require('http');

class HealthChecker {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 5000;
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout after ${this.timeout}ms`));
      }, this.timeout);

      const req = protocol.get(
        url,
        {
          ...options,
          timeout: this.timeout,
        },
        res => {
          clearTimeout(timeout);
          let data = '';
          res.on('data', chunk => (data += chunk));
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data,
            });
          });
        }
      );

      req.on('error', error => {
        clearTimeout(timeout);
        reject(error);
      });

      req.on('timeout', () => {
        clearTimeout(timeout);
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async checkEndpoint(path, expectedStatus = 200, description = '') {
    const url = `${this.baseUrl}${path}`;
    console.log(`🔍 Checking ${description || path}...`);

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const response = await this.makeRequest(url);

        if (response.statusCode === expectedStatus) {
          console.log(`✅ ${description || path}: OK (${response.statusCode})`);
          return { success: true, response };
        } else {
          console.log(
            `❌ ${description || path}: Expected ${expectedStatus}, got ${response.statusCode}`
          );
          return {
            success: false,
            error: `Unexpected status: ${response.statusCode}`,
          };
        }
      } catch (error) {
        console.log(
          `⚠️ ${description || path}: Attempt ${attempt}/${this.retries} failed - ${error.message}`
        );

        if (attempt === this.retries) {
          return { success: false, error: error.message };
        }

        if (attempt < this.retries) {
          console.log(`   Retrying in ${this.retryDelay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }
  }

  async checkHealthEndpoints() {
    const checks = [
      { path: '/api/health', description: 'Health Check API' },
      { path: '/api/auth/session', description: 'Auth Session API' },
      { path: '/', description: 'Home Page' },
      {
        path: '/dashboard',
        expectedStatus: 200,
        description: 'Dashboard (Public Access)',
      },
    ];

    const results = [];
    let allPassed = true;

    console.log(`🏥 Starting health check for: ${this.baseUrl}\n`);

    for (const check of checks) {
      const result = await this.checkEndpoint(
        check.path,
        check.expectedStatus || 200,
        check.description
      );

      results.push({
        ...check,
        ...result,
      });

      if (!result.success) {
        allPassed = false;
      }
    }

    return { allPassed, results };
  }

  async checkPerformance() {
    console.log('\n⚡ Running performance checks...');

    const performanceChecks = [
      { path: '/api/health', maxTime: 2000, description: 'API Response Time' },
      { path: '/', maxTime: 5000, description: 'Page Load Time' },
    ];

    const results = [];
    let allPassed = true;

    for (const check of performanceChecks) {
      const startTime = Date.now();
      const result = await this.checkEndpoint(
        check.path,
        200,
        check.description
      );
      const duration = Date.now() - startTime;

      const performanceResult = {
        ...check,
        duration,
        success: result.success && duration <= check.maxTime,
      };

      if (performanceResult.success) {
        console.log(
          `✅ ${check.description}: ${duration}ms (under ${check.maxTime}ms)`
        );
      } else {
        console.log(
          `❌ ${check.description}: ${duration}ms (over ${check.maxTime}ms limit)`
        );
        allPassed = false;
      }

      results.push(performanceResult);
    }

    return { allPassed, results };
  }

  async runCompleteHealthCheck() {
    console.log('🚀 Starting complete deployment health check...\n');

    const healthResults = await this.checkHealthEndpoints();
    const performanceResults = await this.checkPerformance();

    console.log('\n📊 Health Check Summary:');
    console.log(
      `   Health Endpoints: ${healthResults.allPassed ? '✅ PASSED' : '❌ FAILED'}`
    );
    console.log(
      `   Performance: ${performanceResults.allPassed ? '✅ PASSED' : '❌ FAILED'}`
    );

    const overallPassed =
      healthResults.allPassed && performanceResults.allPassed;

    console.log(
      `\n🎯 Overall Status: ${overallPassed ? '✅ HEALTHY' : '❌ UNHEALTHY'}`
    );

    if (!overallPassed) {
      console.log('\n❗ Failed Checks:');

      healthResults.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.description}: ${r.error}`));

      performanceResults.results
        .filter(r => !r.success)
        .forEach(r =>
          console.log(
            `   - ${r.description}: ${r.duration}ms (max: ${r.maxTime}ms)`
          )
        );
    }

    return {
      passed: overallPassed,
      health: healthResults,
      performance: performanceResults,
    };
  }
}

// CLI Usage
async function main() {
  const url = process.argv[2];

  if (!url) {
    console.error('❌ Usage: node health-check.js <url>');
    console.error(
      '   Example: node health-check.js https://dinoapp.vercel.app'
    );
    process.exit(1);
  }

  try {
    const checker = new HealthChecker(url, {
      timeout: 30000,
      retries: 3,
      retryDelay: 5000,
    });

    const results = await checker.runCompleteHealthCheck();

    if (results.passed) {
      console.log('\n🎉 Deployment is healthy!');
      process.exit(0);
    } else {
      console.log('\n💥 Deployment has issues!');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Health check failed:', error.message);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = { HealthChecker };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
