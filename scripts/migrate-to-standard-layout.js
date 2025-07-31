#!/usr/bin/env node

/**
 * Script to help migrate pages to StandardPageLayout
 * Usage: node scripts/migrate-to-standard-layout.js
 */

const fs = require('fs');
const path = require('path');

// Color mappings
const colorMappings = {
  // Grays
  'gray-50': 'muted',
  'gray-100': 'border',
  'gray-200': 'border',
  'gray-300': 'muted-foreground/30',
  'gray-400': 'muted-foreground/50',
  'gray-500': 'muted-foreground/70',
  'gray-600': 'muted-foreground',
  'gray-700': 'foreground/80',
  'gray-800': 'foreground/90',
  'gray-900': 'foreground',
  
  // Basic colors
  'white': 'background',
  'black': 'foreground',
  
  // Blues (primary)
  'blue-50': 'primary/10',
  'blue-100': 'primary/20',
  'blue-200': 'primary/30',
  'blue-300': 'primary/40',
  'blue-400': 'primary/50',
  'blue-500': 'primary',
  'blue-600': 'primary',
  'blue-700': 'primary',
  'blue-800': 'primary',
  'blue-900': 'primary',
  
  // Hex colors
  '#ffffff': 'background',
  '#000000': 'foreground',
  '#f9fafb': 'muted',
  '#f3f4f6': 'muted',
  '#e5e7eb': 'border',
  '#d1d5db': 'border',
  '#9ca3af': 'muted-foreground',
  '#6b7280': 'muted-foreground',
  '#4b5563': 'muted-foreground',
  '#374151': 'foreground/80',
  '#1f2937': 'foreground/90',
  '#111827': 'foreground',
};

// Helper function to replace colors in className
function replaceColors(content) {
  let updated = content;
  
  // Replace bg-gray-* with bg-*
  Object.entries(colorMappings).forEach(([old, newColor]) => {
    // Background colors
    const bgRegex = new RegExp(`bg-${old}(?![0-9])`, 'g');
    updated = updated.replace(bgRegex, `bg-${newColor}`);
    
    // Text colors
    const textRegex = new RegExp(`text-${old}(?![0-9])`, 'g');
    updated = updated.replace(textRegex, `text-${newColor}`);
    
    // Border colors
    const borderRegex = new RegExp(`border-${old}(?![0-9])`, 'g');
    updated = updated.replace(borderRegex, `border-${newColor}`);
    
    // Ring colors
    const ringRegex = new RegExp(`ring-${old}(?![0-9])`, 'g');
    updated = updated.replace(ringRegex, `ring-${newColor}`);
  });
  
  return updated;
}

// Function to check if file uses StandardPageLayout
function usesStandardPageLayout(content) {
  return content.includes('StandardPageLayout');
}

// Function to check if file has old layout pattern
function hasOldLayoutPattern(content) {
  return content.includes('min-h-screen') && 
         (content.includes('<Header') || content.includes('Header />')) &&
         (content.includes('<Footer') || content.includes('Footer />'));
}

// Analyze all page files
function analyzePages() {
  const appDir = path.join(__dirname, '..', 'app');
  const results = {
    withStandardLayout: [],
    withoutStandardLayout: [],
    withOldPattern: [],
    colorUsage: {}
  };
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      } else if (file === 'page.tsx' || file === 'page.jsx') {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(path.join(__dirname, '..'), filePath);
        
        if (usesStandardPageLayout(content)) {
          results.withStandardLayout.push(relativePath);
        } else {
          results.withoutStandardLayout.push(relativePath);
          
          if (hasOldLayoutPattern(content)) {
            results.withOldPattern.push(relativePath);
          }
        }
        
        // Count color usage
        Object.keys(colorMappings).forEach(color => {
          const regex = new RegExp(`(bg-|text-|border-|ring-)${color}(?![0-9])`, 'g');
          const matches = content.match(regex);
          if (matches) {
            if (!results.colorUsage[color]) {
              results.colorUsage[color] = 0;
            }
            results.colorUsage[color] += matches.length;
          }
        });
      }
    });
  }
  
  walkDir(appDir);
  return results;
}

// Main execution
console.log('🔍 Analyzing pages...\n');
const analysis = analyzePages();

console.log(`✅ Pages with StandardPageLayout: ${analysis.withStandardLayout.length}`);
analysis.withStandardLayout.forEach(page => {
  console.log(`   - ${page}`);
});

console.log(`\n❌ Pages WITHOUT StandardPageLayout: ${analysis.withoutStandardLayout.length}`);
analysis.withoutStandardLayout.forEach(page => {
  console.log(`   - ${page}`);
});

console.log(`\n🔄 Pages with old layout pattern: ${analysis.withOldPattern.length}`);
analysis.withOldPattern.forEach(page => {
  console.log(`   - ${page}`);
});

console.log('\n📊 Color usage statistics:');
Object.entries(analysis.colorUsage)
  .sort((a, b) => b[1] - a[1])
  .forEach(([color, count]) => {
    console.log(`   ${color}: ${count} instances → ${colorMappings[color]}`);
  });

console.log('\n💡 Migration command example:');
console.log('   node scripts/migrate-to-standard-layout.js --migrate app/dashboard/page.tsx');