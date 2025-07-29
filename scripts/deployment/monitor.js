#!/usr/bin/env node

/**
 * Post-Deployment Monitoring Script
 * Monitors deployment health and performance over time
 */

const { HealthChecker } = require('./health-check');
const { RollbackManager } = require('./rollback');

class DeploymentMonitor {
  constructor(url, options = {}) {
    this.url = url;
    this.checkInterval = options.checkInterval || 60000; // 1 minute
    this.maxFailures = options.maxFailures || 3;
    this.monitorDuration = options.monitorDuration || 30 * 60 * 1000; // 30 minutes
    this.alertThresholds = {
      responseTime: options.responseTimeThreshold || 5000,
      errorRate: options.errorRateThreshold || 0.05, // 5%
    };

    this.failureCount = 0;
    this.totalChecks = 0;
    this.successfulChecks = 0;
    this.metrics = {
      responseTimes: [],
      errors: [],
      uptime: 0,
    };

    this.healthChecker = new HealthChecker(url, {
      timeout: 10000,
      retries: 2,
      retryDelay: 3000,
    });
  }

  async performHealthCheck() {
    this.totalChecks++;
    const startTime = Date.now();

    try {
      console.log(
        `🔍 Health check #${this.totalChecks} at ${new Date().toLocaleTimeString()}`
      );

      const results = await this.healthChecker.runCompleteHealthCheck();
      const duration = Date.now() - startTime;

      this.metrics.responseTimes.push(duration);

      if (results.passed) {
        this.successfulChecks++;
        this.failureCount = 0; // Reset failure count on success

        console.log(`✅ Health check passed (${duration}ms)`);

        // Check performance thresholds
        if (duration > this.alertThresholds.responseTime) {
          console.log(
            `⚠️ WARNING: Response time ${duration}ms exceeds threshold ${this.alertThresholds.responseTime}ms`
          );
          await this.sendAlert('performance', {
            message: 'Response time threshold exceeded',
            responseTime: duration,
            threshold: this.alertThresholds.responseTime,
          });
        }

        return { success: true, duration, results };
      } else {
        this.failureCount++;
        this.metrics.errors.push({
          timestamp: new Date(),
          duration,
          results,
        });

        console.log(
          `❌ Health check failed (${duration}ms) - Failure count: ${this.failureCount}/${this.maxFailures}`
        );

        // Check if we should trigger emergency rollback
        if (this.failureCount >= this.maxFailures) {
          console.log(
            `🚨 CRITICAL: ${this.failureCount} consecutive failures detected!`
          );
          await this.handleCriticalFailure();
        } else {
          await this.sendAlert('health', {
            message: 'Health check failed',
            failureCount: this.failureCount,
            maxFailures: this.maxFailures,
            results,
          });
        }

        return { success: false, duration, results };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.failureCount++;
      this.metrics.errors.push({
        timestamp: new Date(),
        duration,
        error: error.message,
      });

      console.log(`💥 Health check error (${duration}ms): ${error.message}`);
      console.log(`   Failure count: ${this.failureCount}/${this.maxFailures}`);

      if (this.failureCount >= this.maxFailures) {
        await this.handleCriticalFailure();
      }

      return { success: false, duration, error: error.message };
    }
  }

  async handleCriticalFailure() {
    console.log(
      '\n🚨 CRITICAL FAILURE DETECTED - INITIATING EMERGENCY ROLLBACK'
    );

    try {
      await this.sendAlert('critical', {
        message: 'Critical failure detected - initiating emergency rollback',
        failureCount: this.failureCount,
        errorRate: this.getErrorRate(),
      });

      const rollbackManager = new RollbackManager();
      const rollbackResult = await rollbackManager.executeRollback();

      if (rollbackResult.success) {
        console.log('✅ Emergency rollback completed successfully');
        await this.sendAlert('rollback-success', {
          message: 'Emergency rollback completed successfully',
          rolledBackTo: rollbackResult.rolledBackTo?.uid,
        });
      } else {
        console.log('❌ Emergency rollback failed');
        await this.sendAlert('rollback-failed', {
          message: 'Emergency rollback failed',
          error: rollbackResult.error,
        });
      }
    } catch (error) {
      console.error('💥 Emergency rollback process failed:', error.message);
      await this.sendAlert('rollback-error', {
        message: 'Emergency rollback process failed',
        error: error.message,
      });
    }
  }

  async sendAlert(type, data) {
    const alertPayload = {
      type,
      timestamp: new Date().toISOString(),
      url: this.url,
      metrics: this.getMetricsSummary(),
      ...data,
    };

    console.log(`🚨 ALERT: ${type.toUpperCase()}`);
    console.log(`   ${data.message}`);

    // Send to Slack
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        const slackPayload = this.formatSlackAlert(type, alertPayload);
        const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackPayload),
        });

        if (response.ok) {
          console.log('   ✅ Slack alert sent');
        } else {
          console.log('   ❌ Failed to send Slack alert');
        }
      } catch (error) {
        console.log(`   ❌ Slack alert error: ${error.message}`);
      }
    }

    // Send to monitoring webhook
    if (process.env.MONITORING_WEBHOOK_URL) {
      try {
        const response = await fetch(process.env.MONITORING_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertPayload),
        });

        if (response.ok) {
          console.log('   ✅ Monitoring alert sent');
        } else {
          console.log('   ❌ Failed to send monitoring alert');
        }
      } catch (error) {
        console.log(`   ❌ Monitoring alert error: ${error.message}`);
      }
    }
  }

  formatSlackAlert(type, data) {
    const colors = {
      health: 'warning',
      performance: 'warning',
      critical: 'danger',
      'rollback-success': 'good',
      'rollback-failed': 'danger',
      'rollback-error': 'danger',
    };

    const emoji = {
      health: '🏥',
      performance: '⚡',
      critical: '🚨',
      'rollback-success': '✅',
      'rollback-failed': '❌',
      'rollback-error': '💥',
    };

    return {
      text: `${emoji[type]} Deployment Alert: ${type.toUpperCase()}`,
      attachments: [
        {
          color: colors[type] || 'warning',
          fields: [
            { title: 'URL', value: this.url, short: true },
            { title: 'Type', value: type, short: true },
            { title: 'Message', value: data.message, short: false },
            {
              title: 'Error Rate',
              value: `${(this.getErrorRate() * 100).toFixed(2)}%`,
              short: true,
            },
            {
              title: 'Uptime',
              value: `${(this.getUptime() * 100).toFixed(2)}%`,
              short: true,
            },
          ],
          timestamp: Math.floor(Date.now() / 1000),
        },
      ],
    };
  }

  getErrorRate() {
    if (this.totalChecks === 0) return 0;
    return (this.totalChecks - this.successfulChecks) / this.totalChecks;
  }

  getUptime() {
    if (this.totalChecks === 0) return 1;
    return this.successfulChecks / this.totalChecks;
  }

  getAverageResponseTime() {
    if (this.metrics.responseTimes.length === 0) return 0;
    return (
      this.metrics.responseTimes.reduce((a, b) => a + b, 0) /
      this.metrics.responseTimes.length
    );
  }

  getMetricsSummary() {
    return {
      totalChecks: this.totalChecks,
      successfulChecks: this.successfulChecks,
      failureCount: this.failureCount,
      errorRate: this.getErrorRate(),
      uptime: this.getUptime(),
      averageResponseTime: this.getAverageResponseTime(),
      recentErrors: this.metrics.errors.slice(-5), // Last 5 errors
    };
  }

  async startMonitoring() {
    console.log(`🚀 Starting deployment monitoring for: ${this.url}`);
    console.log(`   Check interval: ${this.checkInterval / 1000}s`);
    console.log(`   Monitor duration: ${this.monitorDuration / 1000 / 60}min`);
    console.log(`   Max failures before rollback: ${this.maxFailures}`);
    console.log('');

    const startTime = Date.now();
    const endTime = startTime + this.monitorDuration;

    const checkInterval = setInterval(async () => {
      if (Date.now() >= endTime) {
        clearInterval(checkInterval);
        await this.stopMonitoring();
        return;
      }

      await this.performHealthCheck();
    }, this.checkInterval);

    // Initial health check
    await this.performHealthCheck();

    // Keep the process alive
    return new Promise(resolve => {
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, this.monitorDuration);
    });
  }

  async stopMonitoring() {
    console.log('\n📊 Monitoring completed. Final summary:');
    const metrics = this.getMetricsSummary();

    console.log(`   Total checks: ${metrics.totalChecks}`);
    console.log(`   Successful checks: ${metrics.successfulChecks}`);
    console.log(`   Error rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
    console.log(`   Uptime: ${(metrics.uptime * 100).toFixed(2)}%`);
    console.log(
      `   Average response time: ${metrics.averageResponseTime.toFixed(0)}ms`
    );

    if (metrics.errorRate > this.alertThresholds.errorRate) {
      console.log(
        `\n⚠️ WARNING: Error rate ${(metrics.errorRate * 100).toFixed(2)}% exceeds threshold ${this.alertThresholds.errorRate * 100}%`
      );
    }

    if (metrics.uptime >= 0.99) {
      console.log('\n✅ Deployment monitoring successful - System is stable');
    } else {
      console.log(
        '\n⚠️ Deployment monitoring completed with issues - Consider investigation'
      );
    }
  }
}

// CLI Usage
async function main() {
  const url = process.argv[2];
  const duration = parseInt(process.argv[3]) || 30; // minutes

  if (!url) {
    console.error('❌ Usage: node monitor.js <url> [duration-in-minutes]');
    console.error('   Example: node monitor.js https://dinoapp.vercel.app 30');
    process.exit(1);
  }

  try {
    const monitor = new DeploymentMonitor(url, {
      checkInterval: 60000, // 1 minute
      maxFailures: 3,
      monitorDuration: duration * 60 * 1000,
      responseTimeThreshold: 5000,
      errorRateThreshold: 0.05,
    });

    await monitor.startMonitoring();
    process.exit(0);
  } catch (error) {
    console.error('💥 Monitoring failed:', error.message);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = { DeploymentMonitor };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
