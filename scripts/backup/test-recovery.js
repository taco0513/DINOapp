#!/usr/bin/env node

/**
 * Recovery Test Script
 * Tests disaster recovery plans without executing them
 */

const { recoveryManager } = require('../../lib/backup/recovery-manager');

const scenarios = ['database-corruption', 'file-loss', 'complete-disaster'];

async function testRecovery() {
  console.log('🧪 Testing disaster recovery plans...\n');

  let allPassed = true;

  for (const scenario of scenarios) {
    console.log(`📋 Testing scenario: ${scenario}`);

    try {
      const result = await recoveryManager.testRecoveryPlan(scenario);

      if (result) {
        console.log(`✅ ${scenario}: PASSED`);
      } else {
        console.log(`❌ ${scenario}: FAILED`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${scenario}: ERROR - ${error.message}`);
      allPassed = false;
    }

    console.log('');
  }

  if (allPassed) {
    console.log('✅ All recovery plans validated successfully!');
  } else {
    console.log('❌ Some recovery plans failed validation');
    console.log(
      '⚠️  Please ensure all required backups exist before running recovery'
    );
    process.exit(1);
  }
}

// Show available scenarios
console.log('🔧 Available recovery scenarios:');
scenarios.forEach(s => console.log(`   - ${s}`));
console.log('');

// Run tests
testRecovery().catch(console.error);
