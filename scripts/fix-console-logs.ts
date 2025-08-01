#!/usr/bin/env bun
/**
 * Script to replace console.log statements with proper logging
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join } from 'path'

// Patterns to match and replace
const PATTERNS = [
  // Error logging
  {
    pattern: /console\.error\(['"`](.+?)['"`],?\s*(.+?)\)/g,
    replacement: (match: string, message: string, error: string) => {
      return `logger.error('${message}', ${error})`
    },
    imports: "import { logger } from '@/lib/logger'"
  },
  
  // Warning logging
  {
    pattern: /console\.warn\(['"`](.+?)['"`],?\s*(.+?)\)/g,
    replacement: (match: string, message: string, data: string) => {
      return `logger.warn('${message}', ${data})`
    },
    imports: "import { logger } from '@/lib/logger'"
  },
  
  // Info logging
  {
    pattern: /console\.log\(['"`](.+?)['"`],?\s*(.+?)\)/g,
    replacement: (match: string, message: string, data: string) => {
      return `logger.debug('${message}', ${data})`
    },
    imports: "import { logger } from '@/lib/logger'"
  },
  
  // Simple console.error without params
  {
    pattern: /console\.error\(['"`](.+?)['"`]\)/g,
    replacement: (match: string, message: string) => {
      return `logger.error('${message}')`
    },
    imports: "import { logger } from '@/lib/logger'"
  },
  
  // Simple console.log without params
  {
    pattern: /console\.log\(['"`](.+?)['"`]\)/g,
    replacement: (match: string, message: string) => {
      // Skip if it's in development/debug context
      if (message.includes('Dev') || message.includes('Debug')) {
        return `logger.debug('${message}')`
      }
      return `logger.info('${message}')`
    },
    imports: "import { logger } from '@/lib/logger'"
  }
]

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

function processFile(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8')
    let modified = false
    let needsImport = false
    
    // Apply patterns
    for (const pattern of PATTERNS) {
      const matches = content.match(pattern.pattern)
      if (matches) {
        content = content.replace(pattern.pattern, pattern.replacement)
        modified = true
        needsImport = true
      }
    }
    
    // Add import if needed and not already present
    if (needsImport && !content.includes("from '@/lib/logger'")) {
      const importStatement = "import { logger } from '@/lib/logger'\n"
      
      // Find the right place to insert the import
      const lines = content.split('\n')
      let insertIndex = 0
      
      // Skip 'use client' directive
      if (lines[0]?.includes("'use client'")) {
        insertIndex = 1
        // Skip empty line after 'use client'
        if (lines[1] === '') insertIndex = 2
      }
      
      // Insert after existing imports
      for (let i = insertIndex; i < lines.length; i++) {
        if (!lines[i].startsWith('import') && lines[i].trim() !== '') {
          insertIndex = i
          break
        }
      }
      
      lines.splice(insertIndex, 0, importStatement)
      content = lines.join('\n')
    }
    
    if (modified) {
      writeFileSync(filePath, content, 'utf-8')
      console.log(`✅ Processed: ${filePath}`)
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
  console.log(`🔍 Scanning for console.log statements in: ${projectRoot}`)
  
  const files = getAllFiles(projectRoot)
  console.log(`📁 Found ${files.length} files to check`)
  
  let processedCount = 0
  let modifiedCount = 0
  
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
    if (processFile(file)) {
      modifiedCount++
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Files scanned: ${processedCount}`)
  console.log(`   Files modified: ${modifiedCount}`)
  console.log(`   Files skipped: ${files.length - processedCount}`)
}

// Run the main function when script is executed directly
main()