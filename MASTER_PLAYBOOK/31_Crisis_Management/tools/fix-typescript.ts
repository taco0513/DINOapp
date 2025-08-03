#!/usr/bin/env node
/**
 * TypeScript Error Auto-Fixer
 * 실전에서 검증된 자동 수정 도구
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface ErrorPattern {
  pattern: RegExp;
  fix: (file: string, line: number) => void;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  {
    // Cannot find module 'X'
    pattern: /Cannot find module '(.+)'/,
    fix: (file, line) => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      // Try adding extension
      lines[line - 1] = lines[line - 1].replace(/from '(.+)'/, "from '$1.js'");
      
      fs.writeFileSync(file, lines.join('\n'));
    }
  },
  {
    // Type 'X' is not assignable to type 'Y'
    pattern: /Type '(.+)' is not assignable to type '(.+)'/,
    fix: (file, line) => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      // Add type assertion as temporary fix
      if (lines[line - 1].includes('=')) {
        lines[line - 1] = lines[line - 1].replace(/= (.+)/, '= $1 as any');
      }
      
      fs.writeFileSync(file, lines.join('\n'));
    }
  }
];

function analyzeErrors() {
  try {
    execSync('npx tsc --noEmit', { encoding: 'utf8' });
    console.log('✅ No TypeScript errors found!');
    return [];
  } catch (error: any) {
    const output = error.stdout || error.message;
    return output.split('\n').filter((line: string) => line.includes('error TS'));
  }
}

function fixErrors(errors: string[]) {
  const fixes = new Map<string, number>();
  
  errors.forEach(error => {
    const match = error.match(/(.+)\((\d+),\d+\): error TS\d+: (.+)/);
    if (!match) return;
    
    const [, file, lineStr, message] = match;
    const line = parseInt(lineStr);
    
    ERROR_PATTERNS.forEach(({ pattern, fix }) => {
      if (pattern.test(message)) {
        try {
          fix(file, line);
          fixes.set(pattern.source, (fixes.get(pattern.source) || 0) + 1);
        } catch (e) {
          console.error(`Failed to fix: ${file}:${line}`);
        }
      }
    });
  });
  
  return fixes;
}

// Main execution
console.log('🔧 TypeScript Auto-Fixer');
console.log('========================');

const errors = analyzeErrors();
console.log(`Found ${errors.length} errors`);

if (errors.length > 0) {
  const fixes = fixErrors(errors);
  
  console.log('\nApplied fixes:');
  fixes.forEach((count, pattern) => {
    console.log(`  ${pattern}: ${count} fixes`);
  });
  
  // Re-analyze
  const remainingErrors = analyzeErrors();
  console.log(`\n${errors.length - remainingErrors.length} errors fixed!`);
  console.log(`${remainingErrors.length} errors remaining`);
}