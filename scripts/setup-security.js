#!/usr/bin/env node

/**
 * Security Setup Script for DINO App
 * Generates secure keys and helps configure environment variables
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 DINO App Security Setup\n');

// Generate secure random keys
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function generateHexKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local from .env.example...\n');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
  } else {
    console.error('❌ .env.example not found. Please create it first.');
    process.exit(1);
  }
}

// Generate security keys
console.log('🔑 Generating secure keys...\n');

const keys = {
  NEXTAUTH_SECRET: generateSecureKey(32),
  ENCRYPTION_KEY: generateHexKey(32),
  CSRF_SECRET: generateSecureKey(32),
};

console.log('Add these to your .env.local file:\n');
console.log('# =================================');
console.log('# SECURITY KEYS (Generated)');
console.log('# =================================');
console.log(`NEXTAUTH_SECRET="${keys.NEXTAUTH_SECRET}"`);
console.log(`ENCRYPTION_KEY="${keys.ENCRYPTION_KEY}"`);
console.log(`CSRF_SECRET="${keys.CSRF_SECRET}"`);
console.log('');

// Security recommendations
console.log('📋 Security Checklist:\n');

const checklist = [
  {
    item: 'Environment Variables',
    checks: [
      'Set NODE_ENV="production" in production',
      'Never commit .env.local to version control',
      'Use environment variables in hosting platform',
      'Rotate keys regularly (every 90 days)'
    ]
  },
  {
    item: 'Database Security',
    checks: [
      'Use SSL/TLS connection (sslmode=require)',
      'Limit database user permissions',
      'Enable connection pooling',
      'Regular backups'
    ]
  },
  {
    item: 'Authentication',
    checks: [
      'Configure Google OAuth credentials',
      'Set proper redirect URLs',
      'Enable 2FA for admin accounts',
      'Monitor failed login attempts'
    ]
  },
  {
    item: 'Security Features',
    checks: [
      'Enable all security flags in production',
      'Configure rate limiting thresholds',
      'Set up error monitoring (Sentry)',
      'Enable security logging'
    ]
  },
  {
    item: 'Deployment',
    checks: [
      'Use HTTPS only',
      'Enable HSTS',
      'Configure firewall rules',
      'Set up DDoS protection'
    ]
  }
];

checklist.forEach(section => {
  console.log(`\n✅ ${section.item}:`);
  section.checks.forEach(check => {
    console.log(`   □ ${check}`);
  });
});

console.log('\n\n🚀 Next Steps:\n');
console.log('1. Copy the generated keys to your .env.local file');
console.log('2. Configure your database connection string');
console.log('3. Set up Google OAuth credentials');
console.log('4. Review and adjust rate limiting settings');
console.log('5. Deploy with confidence!\n');

// Create security report
const reportPath = path.join(process.cwd(), 'security-setup-report.txt');
const report = `
DINO App Security Setup Report
Generated: ${new Date().toISOString()}

Generated Keys:
==============
NEXTAUTH_SECRET="${keys.NEXTAUTH_SECRET}"
ENCRYPTION_KEY="${keys.ENCRYPTION_KEY}"
CSRF_SECRET="${keys.CSRF_SECRET}"

Security Features Enabled:
========================
- Environment variable validation
- CSRF protection
- Rate limiting
- Input sanitization
- Security headers
- Authentication middleware

Remember:
=========
- Never share these keys
- Rotate keys every 90 days
- Use different keys for each environment
- Store production keys securely

${checklist.map(section => `
${section.item}:
${section.checks.map(check => `- ${check}`).join('\n')}
`).join('\n')}
`;

fs.writeFileSync(reportPath, report);
console.log(`📄 Security report saved to: ${reportPath}\n`);

console.log('✨ Security setup complete!\n');