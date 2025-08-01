#!/usr/bin/env tsx

/**
 * Final ESLint Cleanup Script
 * Handles console statements and unused variables specifically
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

interface Fix {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
}

/**
 * Parse ESLint JSON output to get specific fixes needed
 */
function getESLintIssues(): Fix[] {
  try {
    const output = execSync('npx next lint --format json', { encoding: 'utf8' });
    const results = JSON.parse(output);
    const fixes: Fix[] = [];

    for (const result of results) {
      for (const message of result.messages) {
        if (message.ruleId === 'no-console' || 
            message.ruleId === 'no-unused-vars' ||
            message.ruleId === 'react-hooks/exhaustive-deps') {
          fixes.push({
            file: result.filePath,
            line: message.line,
            column: message.column,
            rule: message.ruleId,
            message: message.message
          });
        }
      }
    }

    return fixes;
  } catch (error) {
    console.error('Failed to get ESLint issues:', error);
    return [];
  }
}

/**
 * Fix console statements by replacing with logger
 */
function fixConsoleStatements(filePath: string, content: string): string {
  let modifiedContent = content;
  
  // Only add logger import if we have console statements and no logger import
  const hasConsole = /console\.(log|error|warn|info|debug)\s*\(/g.test(content);
  const hasLogger = /import.*logger.*from|import.*\{.*logger.*\}/g.test(content);
  
  if (hasConsole && !hasLogger) {
    // Add logger import after other imports
    const lines = modifiedContent.split('\n');
    let importInsertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        importInsertIndex = i + 1;
      } else if (lines[i].trim() === '' || lines[i].startsWith('//')) {
        continue;
      } else {
        break;
      }
    }
    
    lines.splice(importInsertIndex, 0, "import { logger } from '@/lib/logger';");
    modifiedContent = lines.join('\n');
  }
  
  // Replace console statements
  modifiedContent = modifiedContent
    .replace(/console\.log\(/g, 'logger.info(')
    .replace(/console\.error\(/g, 'logger.error(')
    .replace(/console\.warn\(/g, 'logger.warn(')
    .replace(/console\.info\(/g, 'logger.info(')
    .replace(/console\.debug\(/g, 'logger.debug(');
  
  return modifiedContent;
}

/**
 * Fix unused variables by prefixing with underscore
 */
function fixUnusedVariables(content: string, fixes: Fix[]): string {
  let modifiedContent = content;
  const lines = modifiedContent.split('\n');
  
  for (const fix of fixes) {
    if (fix.rule !== 'no-unused-vars') continue;
    
    const lineIndex = fix.line - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      
      // Extract variable name from message
      const match = fix.message.match(/'([^']+)' is (?:defined but never used|assigned a value but never used)/);
      if (match && match[1]) {
        const varName = match[1];
        
        // Replace variable name with underscore prefix if not already prefixed
        if (!varName.startsWith('_')) {
          const patterns = [
            new RegExp(`\\b(const|let|var)\\s+${varName}\\b`, 'g'),
            new RegExp(`\\b${varName}\\s*:`, 'g'), // function parameters
            new RegExp(`\\b${varName}\\s*,`, 'g'), // destructuring
            new RegExp(`\\b${varName}\\s*\\)`, 'g'), // function parameters at end
          ];
          
          for (const pattern of patterns) {
            if (pattern.test(line)) {
              lines[lineIndex] = line.replace(pattern, (match) => 
                match.replace(varName, `_${varName}`)
              );
              break;
            }
          }
        }
      }
    }
  }
  
  return lines.join('\n');
}

/**
 * Fix React hooks dependencies
 */
function fixHooksDependencies(content: string, fixes: Fix[]): string {
  let modifiedContent = content;
  
  for (const fix of fixes) {
    if (fix.rule !== 'react-hooks/exhaustive-deps') continue;
    
    // Extract missing dependency from message
    const match = fix.message.match(/missing dependency: '([^']+)'/);
    if (match && match[1]) {
      const missingDep = match[1];
      
      // Find the useEffect and add the dependency
      const useEffectRegex = /useEffect\(\s*\(\s*\)\s*=>\s*{[\s\S]*?},\s*\[(.*?)\]\s*\)/g;
      modifiedContent = modifiedContent.replace(useEffectRegex, (match, deps) => {
        const currentDeps = deps.trim();
        const newDeps = currentDeps ? `${currentDeps}, ${missingDep}` : missingDep;
        return match.replace(`[${deps}]`, `[${newDeps}]`);
      });
    }
  }
  
  return modifiedContent;
}

/**
 * Process a single file with targeted fixes
 */
function processFile(filePath: string, fixes: Fix[]): boolean {
  try {
    const content = readFileSync(filePath, 'utf-8');
    let modifiedContent = content;
    
    const fileFixes = fixes.filter(fix => fix.file.endsWith(filePath.split('/').slice(-2).join('/')));
    
    // Apply fixes
    modifiedContent = fixConsoleStatements(filePath, modifiedContent);
    modifiedContent = fixUnusedVariables(modifiedContent, fileFixes);
    modifiedContent = fixHooksDependencies(modifiedContent, fileFixes);
    
    // Only write if content changed
    if (modifiedContent !== content) {
      writeFileSync(filePath, modifiedContent, 'utf-8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Main execution
 */
function main(): void {
  console.log('🧹 Starting targeted ESLint cleanup...\n');

  const fixes = getESLintIssues();
  console.log(`Found ${fixes.length} issues to fix\n`);

  if (fixes.length === 0) {
    console.log('🎉 No issues found!');
    return;
  }

  // Group fixes by file
  const fileGroups = new Map<string, Fix[]>();
  for (const fix of fixes) {
    const filePath = fix.file;
    if (!fileGroups.has(filePath)) {
      fileGroups.set(filePath, []);
    }
    fileGroups.get(filePath)!.push(fix);
  }

  let processedFiles = 0;
  let fixedFiles = 0;

  for (const [filePath, fileFixes] of fileGroups) {
    console.log(`📁 Processing ${filePath} (${fileFixes.length} issues)`);
    if (processFile(filePath, fileFixes)) {
      fixedFiles++;
    }
    processedFiles++;
  }

  console.log(`\n🎉 Cleanup completed!`);
  console.log(`📊 Statistics:`);
  console.log(`   Files processed: ${processedFiles}`);
  console.log(`   Files modified: ${fixedFiles}`);
  console.log(`   Issues addressed: ${fixes.length}`);
}

if (require.main === module) {
  main();
}