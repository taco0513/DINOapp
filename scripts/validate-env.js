#!/usr/bin/env node

/**
 * Environment validation script for DiNoCal deployment
 * Run this before deploying to ensure all required environment variables are set
 */

const chalk = require('chalk');

const requiredEnvVars = {
  production: [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ],
  development: ['DATABASE_URL', 'NEXTAUTH_URL'],
};

const optionalEnvVars = [
  'GMAIL_CREDENTIALS_PATH',
  'GMAIL_TOKEN_PATH',
  'NEXT_PUBLIC_ANALYTICS_ID',
  'SENTRY_DSN',
  'REDIS_URL',
  'ENCRYPTION_KEY',
];

function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || requiredEnvVars.development;

  console.log(chalk.blue(`🔍 Validating environment: ${env}`));
  console.log();

  let hasErrors = false;
  const missing = [];
  const present = [];

  // Check required variables
  console.log(chalk.bold('Required Environment Variables:'));
  required.forEach(varName => {
    if (process.env[varName]) {
      console.log(chalk.green(`✓ ${varName}`));
      present.push(varName);
    } else {
      console.log(chalk.red(`✗ ${varName} (MISSING)`));
      missing.push(varName);
      hasErrors = true;
    }
  });

  console.log();

  // Check optional variables
  console.log(chalk.bold('Optional Environment Variables:'));
  optionalEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(chalk.yellow(`• ${varName} (configured)`));
    } else {
      console.log(chalk.gray(`• ${varName} (not configured)`));
    }
  });

  console.log();

  // Validation results
  if (hasErrors) {
    console.log(chalk.red.bold('❌ Environment validation failed!'));
    console.log();
    console.log(chalk.red('Missing required variables:'));
    missing.forEach(varName => {
      console.log(chalk.red(`  - ${varName}`));
    });
    console.log();
    console.log(
      chalk.yellow(
        '💡 Please check your .env file or environment configuration.'
      )
    );
    console.log(
      chalk.yellow(
        '   Refer to .env.example for the complete list of variables.'
      )
    );
    process.exit(1);
  } else {
    console.log(chalk.green.bold('✅ Environment validation passed!'));
    console.log();
    console.log(
      chalk.green(`Configured: ${present.length} required variables`)
    );

    // Additional checks for production
    if (env === 'production') {
      console.log();
      console.log(chalk.blue('🔒 Production-specific checks:'));

      // Check NEXTAUTH_SECRET strength
      const secret = process.env.NEXTAUTH_SECRET;
      if (secret && secret.length < 32) {
        console.log(
          chalk.yellow(
            '⚠️  NEXTAUTH_SECRET should be at least 32 characters long'
          )
        );
      } else if (secret) {
        console.log(chalk.green('✓ NEXTAUTH_SECRET length is adequate'));
      }

      // Check database URL format
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        if (
          dbUrl.startsWith('postgresql://') ||
          dbUrl.startsWith('postgres://')
        ) {
          console.log(chalk.green('✓ PostgreSQL database detected'));
        } else if (dbUrl.includes('file:')) {
          console.log(
            chalk.yellow(
              '⚠️  SQLite detected - consider PostgreSQL for production'
            )
          );
        } else {
          console.log(chalk.yellow('⚠️  Unknown database type'));
        }
      }

      // Check NEXTAUTH_URL format
      const authUrl = process.env.NEXTAUTH_URL;
      if (authUrl && !authUrl.startsWith('https://')) {
        console.log(
          chalk.yellow('⚠️  NEXTAUTH_URL should use HTTPS in production')
        );
      } else if (authUrl) {
        console.log(chalk.green('✓ NEXTAUTH_URL uses HTTPS'));
      }
    }
  }
}

function showHelp() {
  console.log(chalk.bold('DiNoCal Environment Validator'));
  console.log();
  console.log('Usage:');
  console.log('  node scripts/validate-env.js');
  console.log();
  console.log('Environment variables will be validated based on NODE_ENV:');
  console.log('  - development: basic validation');
  console.log('  - production: strict validation with security checks');
  console.log();
  console.log('For a complete list of variables, see .env.example');
}

// Main execution
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
} else {
  try {
    validateEnvironment();
  } catch (error) {
    console.error(chalk.red('Error during validation:', error.message));
    process.exit(1);
  }
}
