#!/usr/bin/env bun
import { readFileSync, writeFileSync } from 'fs';

// All remaining files with import issues
const FILES_TO_FIX = [
  "components/admin/BackupManagementDashboard.tsx",
  "components/admin/MonitoringDashboard.tsx", 
  "components/ai/AIAssistant.tsx",
  "components/ai/CodeGenerator.tsx",
  "components/ai/ProblemSolver.tsx",
  "components/analytics/AdvancedAnalyticsDashboard.tsx",
  "components/auto-entries/AutoEntryDetector.tsx",
  "components/calendar/StayVisualizationCalendar.tsx",
  "components/calendar/TravelCalendarView.tsx",
  "components/icons/index.tsx",
  "components/overstay/OverstayWarningDashboard.tsx",
  "components/schengen/EnhancedSchengenPlanner.tsx",
  "components/settings/PushNotificationSettings.tsx",
  "components/stay/AddStayModal.tsx",
  "components/stay/CurrentStayTracker.tsx",
  "components/stay/ExitCountryModal.tsx",
  "components/trip-planning/TripPlanningValidator.tsx",
  "components/trips/NewTripForm.tsx",
  "components/visas/AddVisaModal.tsx",
  "components/visas/VisaExpiryAlerts.tsx",
  "lib/email/parser.ts"
];

function fixBrokenImport(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8');
    const original = content;
    
    // Find and fix the broken import pattern
    // Pattern: import { something import { logger } from '@/lib/logger' more } from 'module'
    const lines = content.split('\n');
    let modified = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for lines that have broken import with logger
      if (line.includes('import {') && line.includes("import { logger } from '@/lib/logger'")) {
        // This is a broken import line
        const beforeLogger = line.substring(0, line.indexOf("import { logger } from '@/lib/logger'"));
        const afterLogger = line.substring(line.indexOf("import { logger } from '@/lib/logger'") + "import { logger } from '@/lib/logger'".length);
        
        // Extract the import items and module path
        let imports = [];
        let modulePath = '';
        
        // Look for the closing } from 'module' pattern
        let fullImportBlock = line;
        let j = i + 1;
        while (j < lines.length && !fullImportBlock.includes('} from \'') && !fullImportBlock.includes('} from "')) {
          fullImportBlock += '\n' + lines[j];
          j++;
        }
        
        // Extract module path
        const moduleMatch = fullImportBlock.match(/}\s*from\s*['"`]([^'"`]+)['"`]/);
        if (moduleMatch) {
          modulePath = moduleMatch[1];
          
          // Extract import items
          const importPart = fullImportBlock.substring(fullImportBlock.indexOf('{') + 1, fullImportBlock.indexOf('} from'));
          const cleanImportPart = importPart.replace(/import\s*{\s*logger\s*}\s*from\s*['"`]@\/lib\/logger['"`]\s*/g, '');
          
          imports = cleanImportPart.split(',').map(item => item.trim()).filter(item => item && item !== '');
          
          // Create new import structure
          const newImports = [];
          
          // Add logger import if not already present elsewhere
          if (!content.includes("import { logger } from '@/lib/logger';")) {
            newImports.push("import { logger } from '@/lib/logger';");
          }
          
          // Add the fixed import
          if (imports.length > 0) {
            newImports.push(`import {\n  ${imports.join(',\n  ')},\n} from '${modulePath}';`);
          }
          
          // Replace the broken import block
          const newLines = [...lines];
          newLines.splice(i, j - i + 1, ...newImports);
          content = newLines.join('\n');
          modified = true;
          break;
        }
      }
    }
    
    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error);
    return false;
  }
}

function main() {
  console.log('🔥 Ultimate import fix - handling all broken imports...');
  
  let fixedCount = 0;
  for (const file of FILES_TO_FIX) {
    if (fixBrokenImport(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎯 Ultimate Fix Results:`);
  console.log(`   Files processed: ${FILES_TO_FIX.length}`);
  console.log(`   Files fixed: ${fixedCount}`);
}

main();