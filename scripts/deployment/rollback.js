#!/usr/bin/env node

/**
 * Emergency Rollback Script
 * Quickly rollback to the previous stable deployment
 */

const { execSync } = require('child_process');
const { HealthChecker } = require('./health-check');

class RollbackManager {
  constructor(options = {}) {
    this.vercelToken = process.env.VERCEL_TOKEN;
    this.vercelOrgId = process.env.VERCEL_ORG_ID;
    this.vercelProjectId = process.env.VERCEL_PROJECT_ID;
    this.githubToken = process.env.GITHUB_TOKEN;
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.dryRun = options.dryRun || false;

    if (!this.vercelToken) {
      throw new Error('VERCEL_TOKEN environment variable is required');
    }
  }

  async getDeployments() {
    console.log('📊 Fetching deployment history...');

    try {
      const cmd = `vercel ls --token=${this.vercelToken} --scope=${this.vercelOrgId} --json`;
      const output = execSync(cmd, { encoding: 'utf8' });
      const deployments = JSON.parse(output);

      // Filter for production deployments
      const productionDeployments = deployments
        .filter(d => d.target === 'production')
        .sort((a, b) => new Date(b.created) - new Date(a.created));

      console.log(
        `✅ Found ${productionDeployments.length} production deployments`
      );
      return productionDeployments;
    } catch (error) {
      throw new Error(`Failed to fetch deployments: ${error.message}`);
    }
  }

  async getCurrentDeployment() {
    console.log('🔍 Identifying current deployment...');

    const deployments = await this.getDeployments();
    const current = deployments[0];

    if (!current) {
      throw new Error('No deployments found');
    }

    console.log(`📍 Current deployment: ${current.url} (${current.uid})`);
    console.log(`   Created: ${new Date(current.created).toLocaleString()}`);
    console.log(`   State: ${current.ready}`);

    return current;
  }

  async getPreviousStableDeployment() {
    console.log('🔍 Finding previous stable deployment...');

    const deployments = await this.getDeployments();

    // Skip the current deployment and find the previous one
    for (let i = 1; i < deployments.length; i++) {
      const deployment = deployments[i];

      console.log(`🧪 Testing deployment: ${deployment.uid}`);
      console.log(`   URL: ${deployment.url}`);
      console.log(
        `   Created: ${new Date(deployment.created).toLocaleString()}`
      );

      // Quick health check on previous deployment
      try {
        const checker = new HealthChecker(deployment.url, {
          timeout: 10000,
          retries: 1,
        });

        const healthResult = await checker.checkHealthEndpoints();

        if (healthResult.allPassed) {
          console.log(`✅ Found stable deployment: ${deployment.uid}`);
          return deployment;
        } else {
          console.log(
            `❌ Deployment ${deployment.uid} is not healthy, checking next...`
          );
        }
      } catch (error) {
        console.log(
          `❌ Health check failed for ${deployment.uid}: ${error.message}`
        );
      }
    }

    throw new Error('No stable previous deployment found');
  }

  async promoteDeployment(deployment) {
    console.log(`🚀 Promoting deployment ${deployment.uid} to production...`);

    if (this.dryRun) {
      console.log('🔬 DRY RUN: Would promote deployment but not executing');
      return { success: true, dryRun: true };
    }

    try {
      const cmd = `vercel promote ${deployment.url} --token=${this.vercelToken} --scope=${this.vercelOrgId}`;
      const output = execSync(cmd, { encoding: 'utf8' });

      console.log(`✅ Deployment promoted successfully`);
      console.log(`🌐 New production URL: ${deployment.url}`);

      return { success: true, output };
    } catch (error) {
      throw new Error(`Failed to promote deployment: ${error.message}`);
    }
  }

  async verifyRollback(deployment) {
    console.log('🧪 Verifying rollback deployment...');

    // Wait a bit for the rollback to take effect
    console.log('⏳ Waiting 30s for deployment to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      const checker = new HealthChecker(deployment.url, {
        timeout: 30000,
        retries: 3,
        retryDelay: 10000,
      });

      const results = await checker.runCompleteHealthCheck();

      if (results.passed) {
        console.log('✅ Rollback verification successful!');
        return true;
      } else {
        console.log('❌ Rollback verification failed!');
        return false;
      }
    } catch (error) {
      console.log(`❌ Rollback verification error: ${error.message}`);
      return false;
    }
  }

  async notifySlack(success, currentDeployment, rolledBackTo, error = null) {
    if (!this.slackWebhookUrl) {
      console.log('⚠️ No Slack webhook URL configured, skipping notification');
      return;
    }

    console.log('📢 Sending Slack notification...');

    const status = success ? '✅ SUCCESS' : '❌ FAILED';
    const color = success ? 'good' : 'danger';

    const payload = {
      text: `🚨 Emergency Rollback ${status}`,
      attachments: [
        {
          color,
          fields: [
            { title: 'Environment', value: 'Production', short: true },
            { title: 'Status', value: status, short: true },
            {
              title: 'Rolled back from',
              value: currentDeployment.uid,
              short: true,
            },
            {
              title: 'Rolled back to',
              value: rolledBackTo?.uid || 'N/A',
              short: true,
            },
            {
              title: 'Timestamp',
              value: new Date().toISOString(),
              short: true,
            },
          ],
        },
      ],
    };

    if (error) {
      payload.attachments[0].fields.push({
        title: 'Error',
        value: error.substring(0, 200),
        short: false,
      });
    }

    try {
      const response = await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('✅ Slack notification sent');
      } else {
        console.log('❌ Failed to send Slack notification');
      }
    } catch (error) {
      console.log(`❌ Slack notification error: ${error.message}`);
    }
  }

  async executeRollback() {
    console.log('🚨 Starting emergency rollback process...\n');

    let currentDeployment, previousDeployment;

    try {
      // 1. Get current deployment
      currentDeployment = await this.getCurrentDeployment();

      // 2. Find previous stable deployment
      previousDeployment = await this.getPreviousStableDeployment();

      // 3. Confirm rollback
      if (!this.dryRun) {
        console.log('\n⚠️  ROLLBACK CONFIRMATION');
        console.log(
          `   FROM: ${currentDeployment.uid} (${new Date(currentDeployment.created).toLocaleString()})`
        );
        console.log(
          `   TO:   ${previousDeployment.uid} (${new Date(previousDeployment.created).toLocaleString()})`
        );
        console.log('');

        // In a real scenario, you might want to add interactive confirmation
        // For automated scripts, we'll proceed automatically
      }

      // 4. Execute rollback
      const promotionResult = await this.promoteDeployment(previousDeployment);

      if (!promotionResult.success) {
        throw new Error('Deployment promotion failed');
      }

      if (promotionResult.dryRun) {
        console.log('\n🔬 DRY RUN COMPLETED');
        return { success: true, dryRun: true };
      }

      // 5. Verify rollback
      const verificationSuccess = await this.verifyRollback(previousDeployment);

      if (!verificationSuccess) {
        throw new Error('Rollback verification failed');
      }

      // 6. Send notifications
      await this.notifySlack(true, currentDeployment, previousDeployment);

      console.log('\n🎉 Emergency rollback completed successfully!');
      console.log(`📍 Production is now running: ${previousDeployment.uid}`);
      console.log(`🌐 URL: ${previousDeployment.url}`);

      return {
        success: true,
        currentDeployment,
        rolledBackTo: previousDeployment,
      };
    } catch (error) {
      console.error(`\n💥 Rollback failed: ${error.message}`);

      // Send failure notification
      await this.notifySlack(
        false,
        currentDeployment,
        previousDeployment,
        error.message
      );

      return {
        success: false,
        error: error.message,
        currentDeployment,
        previousDeployment,
      };
    }
  }
}

// CLI Usage
async function main() {
  const dryRun = process.argv.includes('--dry-run');

  if (dryRun) {
    console.log(
      '🔬 Running in DRY RUN mode - no actual changes will be made\n'
    );
  }

  try {
    const rollbackManager = new RollbackManager({ dryRun });
    const result = await rollbackManager.executeRollback();

    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Rollback script failed:', error.message);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = { RollbackManager };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
