#!/usr/bin/env tsx

/**
 * Simple cleanup script for specific remaining issues
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const fixes = [
  // React hooks dependency
  {
    file: 'app/(dashboard)/integrations/page.tsx',
    pattern: /useEffect\(\(\) => \{\s*if \(status === 'authenticated' && session\) \{\s*checkConnections\(\);\s*\}\s*\}, \[session, status\]\);/g,
    replacement: `useEffect(() => {
    if (status === 'authenticated' && session) {
      checkConnections();
    }
  }, [session, status, checkConnections]);`
  },
  
  // Fix autoConfirm unused variable
  {
    file: 'app/api/auto-entries/save/route.ts',
    pattern: /const autoConfirm = /g,
    replacement: 'const _autoConfirm = '
  },
  
  // Fix unused imports in various files
  {
    file: 'app/api/overstay-warnings/route.ts',
    pattern: /import \{ z \} from 'zod';/g,
    replacement: '// import { z } from \'zod\'; // unused'
  },
  
  {
    file: 'app/api/overstay-warnings/route.ts',
    pattern: /import \{ checkOverstayWarnings, predictOverstayForTrip \} from/g,
    replacement: 'import { checkOverstayWarnings } from'
  },
  
  // Fix unused function parameters by prefixing with underscore
  {
    file: 'app/api/notifications/preferences/route.ts',
    pattern: /export async function GET\(request: NextRequest\)/g,
    replacement: 'export async function GET(_request: NextRequest)'
  },
  
  {
    file: 'app/api/notifications/read-all/route.ts',
    pattern: /export async function PUT\(request: NextRequest\)/g,
    replacement: 'export async function PUT(_request: NextRequest)'
  },
  
  {
    file: 'app/api/push-subscriptions/route.ts',
    pattern: /export async function GET\(request: NextRequest\)/g,
    replacement: 'export async function GET(_request: NextRequest)'
  },
  
  {
    file: 'app/api/stay-tracking/route.ts',
    pattern: /export async function GET\(request: NextRequest\)/g,
    replacement: 'export async function GET(_request: NextRequest)'
  },
  
  // Fix unused date-fns imports
  {
    file: 'app/api/stay-tracking/route.ts',
    pattern: /import \{ differenceInDays, format, parseISO, isAfter, isBefore \} from 'date-fns';/g,
    replacement: 'import { differenceInDays, format, parseISO, isBefore } from \'date-fns\';'
  },
  
  {
    file: 'app/api/stay-tracking/route.ts',
    pattern: /import \{ ko \} from 'date-fns\/locale';/g,
    replacement: '// import { ko } from \'date-fns/locale\'; // unused'
  },
  
  {
    file: 'app/api/trip-planning/validate/route.ts',
    pattern: /import \{ differenceInDays, format, parseISO, isAfter, isBefore, addDays \} from 'date-fns';/g,
    replacement: 'import { differenceInDays, format, parseISO } from \'date-fns\';'
  },
  
  {
    file: 'app/api/trip-planning/validate/route.ts',
    pattern: /import \{ ko \} from 'date-fns\/locale';/g,
    replacement: '// import { ko } from \'date-fns/locale\'; // unused'
  },
  
  // Fix unused variables in stay-tracking
  {
    file: 'app/api/stay-tracking/route.ts',
    pattern: /const expectedExitDate = /g,
    replacement: 'const _expectedExitDate = '
  },
  
  // Fix utility functions unused parameters
  {
    file: 'lib/utils.ts',
    pattern: /import \{ type ClassValue, clsx \} from "clsx"/g,
    replacement: 'import { clsx } from "clsx"'
  }
];

async function main() {
  console.log('🧹 Starting simple cleanup...\n');

  let fixedCount = 0;

  for (const fix of fixes) {
    const filePath = `/Users/zimo_mbp16_m1max/Projects/DINOapp/${fix.file}`;
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      const newContent = content.replace(fix.pattern, fix.replacement);
      
      if (newContent !== content) {
        writeFileSync(filePath, newContent, 'utf-8');
        console.log(`✅ Fixed: ${fix.file}`);
        fixedCount++;
      }
    } catch (error) {
      console.warn(`⚠️ Could not process ${fix.file}:`, error);
    }
  }

  // Now let's replace all remaining console statements with logger
  const files = await glob('**/*.{ts,tsx}', {
    cwd: '/Users/zimo_mbp16_m1max/Projects/DINOapp',
    ignore: ['node_modules/**', '.next/**', 'scripts/**']
  });

  for (const file of files) {
    const filePath = `/Users/zimo_mbp16_m1max/Projects/DINOapp/${file}`;
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      let newContent = content;
      
      // Check if we have console statements and need logger import
      const hasConsole = /console\.(log|error|warn|info|debug)\s*\(/g.test(content);
      const hasLogger = /import.*logger.*from|import.*\{.*logger.*\}/g.test(content);
      
      if (hasConsole && !hasLogger) {
        // Add logger import at the beginning
        const lines = newContent.split('\n');
        let insertIndex = 0;
        
        // Find the right place to insert logger import
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            insertIndex = i + 1;
          } else if (lines[i].trim() === '' || lines[i].startsWith('//') || lines[i].startsWith('/*')) {
            continue;
          } else {
            break;
          }
        }
        
        lines.splice(insertIndex, 0, "import { logger } from '@/lib/logger';");
        newContent = lines.join('\n');
      }
      
      // Replace console statements
      newContent = newContent
        .replace(/console\.log\(/g, 'logger.info(')
        .replace(/console\.error\(/g, 'logger.error(')
        .replace(/console\.warn\(/g, 'logger.warn(')
        .replace(/console\.info\(/g, 'logger.info(')
        .replace(/console\.debug\(/g, 'logger.debug(');
      
      if (newContent !== content) {
        writeFileSync(filePath, newContent, 'utf-8');
        console.log(`📝 Updated console statements: ${file}`);
        fixedCount++;
      }
    } catch (error) {
      // Skip files that can't be processed
    }
  }

  console.log(`\n🎉 Cleanup completed! Fixed ${fixedCount} files.`);
}

main().catch(console.error);