#!/usr/bin/env node

/**
 * Performance Benchmark Script for DINOapp
 * Measures build size, performance metrics, and generates report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 DINOapp Performance Benchmark\n');

// 1. Build the project
console.log('📦 Building project...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build completed\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// 2. Analyze build output
console.log('📊 Analyzing build output...');
const buildDir = path.join(process.cwd(), '.next');

function getDirectorySize(dir) {
  let totalSize = 0;
  
  function calculateSize(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        calculateSize(filePath);
      } else {
        totalSize += stat.size;
      }
    });
  }
  
  if (fs.existsSync(dir)) {
    calculateSize(dir);
  }
  
  return totalSize;
}

// Get build sizes
const staticSize = getDirectorySize(path.join(buildDir, 'static'));
const serverSize = getDirectorySize(path.join(buildDir, 'server'));
const totalSize = staticSize + serverSize;

console.log(`📁 Build Sizes:
  - Static: ${(staticSize / 1024 / 1024).toFixed(2)} MB
  - Server: ${(serverSize / 1024 / 1024).toFixed(2)} MB
  - Total: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

// 3. Check page sizes
console.log('📄 Page Bundle Sizes:');
const pagesDir = path.join(buildDir, 'server', 'pages');
const appDir = path.join(buildDir, 'server', 'app');

function analyzePages(dir, prefix = '') {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('_')) {
      analyzePages(filePath, `${prefix}${file}/`);
    } else if (file.endsWith('.js') || file.endsWith('.html')) {
      const size = stat.size / 1024;
      if (size > 50) { // Only show files larger than 50KB
        console.log(`  - ${prefix}${file}: ${size.toFixed(1)} KB`);
      }
    }
  });
}

analyzePages(pagesDir);
analyzePages(appDir);

// 4. Count source files
console.log('\n📈 Project Statistics:');
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'];
let fileCount = 0;
let lineCount = 0;

function countFiles(dir) {
  if (dir.includes('node_modules') || dir.includes('.next')) return;
  
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      countFiles(filePath);
    } else if (sourceExtensions.some(ext => file.endsWith(ext))) {
      fileCount++;
      const content = fs.readFileSync(filePath, 'utf8');
      lineCount += content.split('\n').length;
    }
  });
}

countFiles(process.cwd());
console.log(`  - Source Files: ${fileCount}`);
console.log(`  - Lines of Code: ${lineCount.toLocaleString()}`);

// 5. Performance recommendations
console.log('\n💡 Performance Recommendations:');

const recommendations = [];

if (totalSize > 50 * 1024 * 1024) {
  recommendations.push('⚠️  Total build size exceeds 50MB - consider code splitting');
}

if (staticSize > 10 * 1024 * 1024) {
  recommendations.push('⚠️  Static assets exceed 10MB - optimize images and fonts');
}

// Check for large dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const heavyDeps = ['moment', 'lodash', 'jquery'];
const foundHeavyDeps = Object.keys(packageJson.dependencies || {})
  .filter(dep => heavyDeps.some(heavy => dep.includes(heavy)));

if (foundHeavyDeps.length > 0) {
  recommendations.push(`⚠️  Heavy dependencies found: ${foundHeavyDeps.join(', ')} - consider lighter alternatives`);
}

if (recommendations.length === 0) {
  console.log('✅ Build size looks good!');
} else {
  recommendations.forEach(rec => console.log(rec));
}

// 6. Generate report
const report = {
  timestamp: new Date().toISOString(),
  build: {
    staticSize: `${(staticSize / 1024 / 1024).toFixed(2)} MB`,
    serverSize: `${(serverSize / 1024 / 1024).toFixed(2)} MB`,
    totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`
  },
  project: {
    sourceFiles: fileCount,
    linesOfCode: lineCount
  },
  recommendations
};

fs.writeFileSync(
  'performance-benchmark-report.json',
  JSON.stringify(report, null, 2)
);

console.log('\n✅ Performance benchmark complete!');
console.log('📄 Report saved to: performance-benchmark-report.json');