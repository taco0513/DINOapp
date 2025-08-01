#!/usr/bin/env bun
/**
 * Script to fix import errors caused by logger imports
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join } from 'path'

// Files to process (TypeScript and JavaScript files)
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

// Directories to skip
const SKIP_DIRS = ['node_modules', '.next', '.git', 'dist', 'build']

function getAllFiles(dir: string, files: string[] = []): string[] {
  const items = readdirSync(dir)
  
  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)
    
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.includes(item)) {
        getAllFiles(fullPath, files)
      }
    } else if (EXTENSIONS.some(ext => item.endsWith(ext))) {
      files.push(fullPath)
    }
  }
  
  return files
}

function fixImportError(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8')
    let modified = false
    
    // Pattern 1: Fix broken imports where logger import is inserted in the middle
    const brokenPattern1 = /import\s*{\s*([^}]*)\s*import\s*{\s*logger\s*}\s*from\s*['"`]@\/lib\/logger['"`]([^}]*)\s*}\s*from/g
    if (brokenPattern1.test(content)) {
      content = content.replace(brokenPattern1, (match, before, after) => {
        // Clean up the import
        const cleanBefore = before.replace(/,\s*$/, '').trim()
        const cleanAfter = after.replace(/^\s*,/, '').trim()
        let combinedImports = cleanBefore
        if (cleanAfter) {
          combinedImports += combinedImports ? `, ${cleanAfter}` : cleanAfter
        }
        return `import { ${combinedImports} } from`
      })
      
      // Add logger import at the top
      if (!content.includes("import { logger } from '@/lib/logger'")) {
        const lines = content.split('\n')
        let insertIndex = 0
        
        // Skip 'use client' or 'use server' directive
        if (lines[0]?.includes("'use ")) {
          insertIndex = 1
          if (lines[1] === '') insertIndex = 2 // Skip empty line after directive
        }
        
        // Find position after existing imports
        for (let i = insertIndex; i < lines.length; i++) {
          if (!lines[i].startsWith('import') && lines[i].trim() !== '') {
            insertIndex = i
            break
          }
        }
        
        lines.splice(insertIndex, 0, "import { logger } from '@/lib/logger'")
        content = lines.join('\n')
      }
      
      modified = true
    }
    
    // Pattern 2: Fix imports that are completely broken
    const brokenPattern2 = /import\s*{\s*import\s*{\s*logger\s*}\s*from\s*['"`]@\/lib\/logger['"`]/g
    if (brokenPattern2.test(content)) {
      content = content.replace(brokenPattern2, 'import {')
      
      // Add logger import if not present
      if (!content.includes("import { logger } from '@/lib/logger'")) {
        const lines = content.split('\n')
        let insertIndex = 0
        
        // Skip directives
        if (lines[0]?.includes("'use ")) {
          insertIndex = 1
          if (lines[1] === '') insertIndex = 2
        }
        
        lines.splice(insertIndex, 0, "import { logger } from '@/lib/logger'")
        content = lines.join('\n')
      }
      
      modified = true
    }
    
    // Pattern 3: Remove duplicate logger imports
    const loggerImportPattern = /import\s*{\s*logger\s*}\s*from\s*['"`]@\/lib\/logger['"`]/g
    const loggerImports = content.match(loggerImportPattern)
    if (loggerImports && loggerImports.length > 1) {
      // Keep only the first one
      let first = true
      content = content.replace(loggerImportPattern, (match) => {
        if (first) {
          first = false
          return match
        }
        return '' // Remove subsequent matches
      })
      modified = true
    }
    
    if (modified) {
      writeFileSync(filePath, content, 'utf-8')
      console.log(`✅ Fixed imports in: ${filePath}`)
      return true
    }
    
    return false
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error)
    return false
  }
}

function main() {
  const projectRoot = process.cwd()
  console.log(`🔍 Scanning for broken imports in: ${projectRoot}`)
  
  const files = getAllFiles(projectRoot)
  console.log(`📁 Found ${files.length} files to check`)
  
  let processedCount = 0
  let fixedCount = 0
  
  for (const file of files) {
    // Skip test files and certain directories
    if (file.includes('__tests__') || file.includes('.test.') || file.includes('.spec.')) {
      continue
    }
    
    // Skip script files
    if (file.includes('/scripts/')) {
      continue
    }
    
    processedCount++
    if (fixImportError(file)) {
      fixedCount++
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Files scanned: ${processedCount}`)
  console.log(`   Files fixed: ${fixedCount}`)
  console.log(`   Files skipped: ${files.length - processedCount}`)
}

// Run the main function when script is executed directly
main()