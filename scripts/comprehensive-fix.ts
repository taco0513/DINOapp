#!/usr/bin/env bun
/**
 * Comprehensive script to fix all import and syntax errors
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join } from 'path'

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']
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

function fixFile(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8')
    let modified = false
    
    // 1. Fix broken imports where logger import is in the middle of other imports
    const brokenImportRegex = /import\s*{\s*([^}]*)\s*import\s*{\s*logger\s*}\s*from\s*['"`]@\/lib\/logger['"`]\s*([^}]*)\s*}\s*from\s*['"`]([^'"]+)['"`]/g
    
    if (brokenImportRegex.test(content)) {
      content = content.replace(brokenImportRegex, (match, before, after, modulePath) => {
        const cleanBefore = before.replace(/,\s*$/, '').trim()
        const cleanAfter = after.replace(/^\s*,/, '').trim()
        let combinedImports = cleanBefore
        if (cleanAfter) {
          combinedImports += combinedImports ? `, ${cleanAfter}` : cleanAfter
        }
        return `import { ${combinedImports} } from '${modulePath}'`
      })
      
      // Add logger import if not already present
      if (!content.includes("import { logger } from '@/lib/logger'")) {
        const lines = content.split('\n')
        let insertIndex = 0
        
        // Skip directives
        if (lines[0]?.includes("'use ")) {
          insertIndex = 1
          if (lines[1] === '') insertIndex = 2
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
    
    // 2. Fix completely broken import structure
    const anotherBrokenPattern = /import\s*{\s*import\s*{\s*logger\s*}\s*from\s*['"`]@\/lib\/logger['"`]/g
    content = content.replace(anotherBrokenPattern, 'import {')
    
    // 3. Clean up empty imports or malformed imports
    content = content.replace(/import\s*{\s*}\s*from\s*['"`][^'"]+['"`]/g, '')
    
    // 4. Remove duplicate logger imports
    const loggerImportPattern = /import\s*{\s*logger\s*}\s*from\s*['"`]@\/lib\/logger['"`]/g
    const loggerImports = content.match(loggerImportPattern)
    if (loggerImports && loggerImports.length > 1) {
      let first = true
      content = content.replace(loggerImportPattern, (match) => {
        if (first) {
          first = false
          return match
        }
        return ''
      })
    }
    
    // 5. Add logger import if there are logger calls but no import
    if (content.includes('console.') && !content.includes("import { logger } from '@/lib/logger'")) {
      const lines = content.split('\n')
      let insertIndex = 0
      
      // Skip directives
      if (lines[0]?.includes("'use ")) {
        insertIndex = 1
        if (lines[1] === '') insertIndex = 2
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
      modified = true
    }
    
    // 6. Clean up any remaining empty lines from removed imports
    content = content.replace(/\n\s*\n{2,}/g, '\n\n')
    
    if (modified) {
      writeFileSync(filePath, content, 'utf-8')
      console.log(`✅ Fixed: ${filePath}`)
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
  console.log(`🔍 Comprehensive fix for: ${projectRoot}`)
  
  const files = getAllFiles(projectRoot)
  console.log(`📁 Found ${files.length} files to check`)
  
  let processedCount = 0
  let fixedCount = 0
  
  for (const file of files) {
    if (file.includes('__tests__') || file.includes('.test.') || file.includes('.spec.')) {
      continue
    }
    
    if (file.includes('/scripts/')) {
      continue
    }
    
    processedCount++
    if (fixFile(file)) {
      fixedCount++
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Files scanned: ${processedCount}`)
  console.log(`   Files fixed: ${fixedCount}`)
  console.log(`   Files skipped: ${files.length - processedCount}`)
}

main()