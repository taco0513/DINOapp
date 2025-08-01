#!/usr/bin/env node
/**
 * Bundle Size Analysis Script
 * Provides detailed bundle size analysis and optimization recommendations
 */

const fs = require('fs');
const path = require('path');

const BUNDLE_SIZE_BUDGET = {
  // DINO project budget from CLAUDE.md
  totalBudget: 500 * 1024, // 500KB
  chunkBudget: 100 * 1024,  // 100KB per chunk
  vendorBudget: 300 * 1024  // 300KB for vendor chunks
};

function analyzeBundleSize() {
  const buildPath = path.join(__dirname, '../.next/static/chunks');
  
  if (!fs.existsSync(buildPath)) {
    console.error('❌ Build directory not found. Run `npm run build` first.');
    process.exit(1);
  }

  console.log('📊 DINO Bundle Size Analysis\n');
  
  const chunks = fs.readdirSync(buildPath)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(buildPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        sizeKB: Math.round(stats.size / 1024 * 100) / 100
      };
    })
    .sort((a, b) => b.size - a.size);

  // Calculate totals
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const totalSizeKB = Math.round(totalSize / 1024 * 100) / 100;
  
  const vendorChunks = chunks.filter(chunk => 
    chunk.name.includes('vendor') || chunk.name.includes('react-vendors')
  );
  const vendorSize = vendorChunks.reduce((sum, chunk) => sum + chunk.size, 0);

  // Display results
  console.log('📈 Bundle Size Summary:');
  console.log(`   Total Size: ${totalSizeKB} KB`);
  console.log(`   Vendor Size: ${Math.round(vendorSize / 1024 * 100) / 100} KB`);
  console.log(`   Budget: ${BUNDLE_SIZE_BUDGET.totalBudget / 1024} KB`);
  console.log(`   Status: ${totalSize <= BUNDLE_SIZE_BUDGET.totalBudget ? '✅ Within Budget' : '⚠️ Over Budget'}\n`);

  // Top 10 largest chunks
  console.log('🔍 Largest Chunks:');
  chunks.slice(0, 10).forEach((chunk, index) => {
    const indicator = chunk.size > BUNDLE_SIZE_BUDGET.chunkBudget ? '⚠️' : '✅';
    console.log(`   ${index + 1}. ${chunk.name} - ${chunk.sizeKB} KB ${indicator}`);
  });

  // Recommendations
  console.log('\n💡 Optimization Recommendations:');
  
  if (totalSize > BUNDLE_SIZE_BUDGET.totalBudget) {
    console.log('   • Bundle size exceeds 500KB budget');
    console.log('   • Consider more aggressive code splitting');
  }
  
  const largeChunks = chunks.filter(chunk => chunk.size > BUNDLE_SIZE_BUDGET.chunkBudget);
  if (largeChunks.length > 0) {
    console.log(`   • ${largeChunks.length} chunks exceed 100KB individual budget`);
    console.log('   • Consider dynamic imports for heavy components');
  }

  if (vendorSize > BUNDLE_SIZE_BUDGET.vendorBudget) {
    console.log('   • Vendor bundles are large - review third-party dependencies');
  }
  
  console.log('   • Run `ANALYZE=true npm run build` for detailed bundle analyzer');
  console.log('   • Check for unused dependencies with `npm run bundle-check`');
  
  return {
    totalSize: totalSizeKB,
    withinBudget: totalSize <= BUNDLE_SIZE_BUDGET.totalBudget,
    recommendations: largeChunks.length
  };
}

if (require.main === module) {
  analyzeBundleSize();
}

module.exports = { analyzeBundleSize, BUNDLE_SIZE_BUDGET };