#!/usr/bin/env bun
/**
 * Script to fix import errors caused by the console.log replacement script
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

    // Fix pattern: import {\nimport { logger } from '@/lib/logger'\n\n  otherImports...
    const badImportPattern = /import \{\s*\nimport \{ logger \} from '@\/lib\/logger'\s*\n\s*([\s\S]*?)\} from/g
    if (badImportPattern.test(content)) {
      content = content.replace(badImportPattern, (_match, imports) => {
        const cleanImports = imports.trim()
        return `import {\n  ${cleanImports}\n} from`
      })
      
      // Add logger import at the end of imports section if not already there
      if (!content.includes("import { logger } from '@/lib/logger'")) {
        // Find the last import statement
        const importLines = content.split('\n')
        let lastImportIndex = -1
        
        for (let i = 0; i < importLines.length; i++) {
          if (importLines[i].startsWith('import ') || importLines[i].includes('} from ')) {
            lastImportIndex = i
          } else if (importLines[i].trim() === '' && lastImportIndex >= 0) {
            // Empty line after imports
            break
          } else if (lastImportIndex >= 0 && importLines[i].trim() !== '' && !importLines[i].startsWith('import')) {
            // Non-import, non-empty line
            break
          }
        }
        
        if (lastImportIndex >= 0) {
          importLines.splice(lastImportIndex + 1, 0, "import { logger } from '@/lib/logger'")
          content = importLines.join('\n')
        }
      }
      
      modified = true
    }

    // Fix logger import that was inserted mid-import
    const midImportPattern = /import \{ logger \} from '@\/lib\/logger'\s*\n\s*\n\s*([A-Za-z_][A-Za-z0-9_]*,?)/g
    if (midImportPattern.test(content)) {
      content = content.replace(midImportPattern, '$1')
      modified = true
    }

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
  console.log(`🔧 Fixing import errors in: ${projectRoot}`)
  
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
  console.log(`   Files processed: ${processedCount}`)
  console.log(`   Files fixed: ${fixedCount}`)
  console.log(`   Files skipped: ${files.length - processedCount}`)
}

// Run the main function when script is executed directly
main()