#!/usr/bin/env bun
import { readFileSync, writeFileSync } from 'fs';

const FILES_TO_FIX = [
  "app/my-visas/page.tsx",
  "app/stay-tracking/page.tsx", 
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

function fixImports(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    // Pattern: fix broken import structure
    // Look for: import { something import { logger } from '@/lib/logger' more stuff } from 'module'
    const brokenPattern = /import\s*{\s*([^}]*)\s*import\s*{\s*logger\s*}\s*from\s*['"`]@\/lib\/logger['"`]\s*([^}]*)\s*}\s*from\s*['"`]([^'"]+)['"`]/g;
    
    if (brokenPattern.test(content)) {
      content = content.replace(brokenPattern, (match, before, after, modulePath) => {
        // Clean up and combine the imports
        const cleanBefore = before.replace(/,\s*$/, '').trim();
        const cleanAfter = after.replace(/^\s*,/, '').trim();
        let combinedImports = cleanBefore;
        if (cleanAfter) {
          combinedImports += combinedImports ? `, ${cleanAfter}` : cleanAfter;
        }
        return `import { ${combinedImports} } from '${modulePath}'`;
      });
      
      // Add logger import if not present
      if (!content.includes("import { logger } from '@/lib/logger'")) {
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Skip directives
        if (lines[0]?.includes("'use ")) {
          insertIndex = 1;
          if (lines[1] === '') insertIndex = 2;
        }
        
        // Find position after existing imports
        for (let i = insertIndex; i < lines.length; i++) {
          if (!lines[i].startsWith('import') && lines[i].trim() !== '') {
            insertIndex = i;
            break;
          }
        }
        
        lines.splice(insertIndex, 0, "import { logger } from '@/lib/logger';");
        content = lines.join('\n');
      }
      
      modified = true;
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
  console.log('🔧 Final import fix for remaining files...');
  
  let fixedCount = 0;
  for (const file of FILES_TO_FIX) {
    if (fixImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n📊 Final Fix Summary:`);
  console.log(`   Files processed: ${FILES_TO_FIX.length}`);
  console.log(`   Files fixed: ${fixedCount}`);
}

main();