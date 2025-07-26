// Danger JS configuration for PR validation
import { danger, warn, fail, message } from 'danger'

// PR Size Check
const bigPRThreshold = 500
const additions = danger.github.pr.additions
const deletions = danger.github.pr.deletions
const totalChanges = additions + deletions

if (totalChanges > bigPRThreshold) {
  warn(`🚨 This PR is quite large (${totalChanges} lines changed). Consider breaking it into smaller PRs.`)
}

// Check for console.log statements
const jsFiles = danger.git.created_files.concat(danger.git.modified_files).filter(path => path.match(/\.(js|ts|tsx)$/))
for (const file of jsFiles) {
  const content = await danger.github.utils.fileContents(file)
  if (content.includes('console.log')) {
    warn(`⚠️ \`console.log\` statement found in ${file}. Please remove before merging.`)
  }
}

// Ensure PR has a description
if (!danger.github.pr.body || danger.github.pr.body.length < 10) {
  fail('📝 Please add a meaningful description to this PR.')
}

// Check for tests
const hasTestChanges = danger.git.modified_files.some(path => 
  path.includes('.test.') || path.includes('.spec.') || path.includes('__tests__')
)
const hasCodeChanges = danger.git.modified_files.some(path => 
  path.match(/\.(js|ts|tsx)$/) && !path.includes('.test.') && !path.includes('.spec.')
)

if (hasCodeChanges && !hasTestChanges) {
  warn('🧪 This PR modifies code but does not include test changes. Consider adding tests.')
}

// Check for migration files
const hasMigrationChanges = danger.git.modified_files.some(path => path.includes('prisma/migrations'))
const hasSchemaChanges = danger.git.modified_files.includes('prisma/schema.prisma')

if (hasSchemaChanges && !hasMigrationChanges) {
  warn('📊 Schema changes detected but no migration file. Did you forget to run `prisma migrate dev`?')
}

// Security checks
const hasSecurityChanges = danger.git.modified_files.some(path => 
  path.includes('auth') || path.includes('security') || path.includes('.env')
)

if (hasSecurityChanges) {
  message('🔐 Security-related changes detected. Please ensure proper review.')
}

// Check for TODO comments
for (const file of jsFiles) {
  const content = await danger.github.utils.fileContents(file)
  if (content.includes('TODO') || content.includes('FIXME')) {
    message(`📋 TODO/FIXME found in ${file}. Consider creating an issue to track this.`)
  }
}

// Performance impact check
const hasPerformanceImpact = danger.git.modified_files.some(path => 
  path.includes('db-') || path.includes('monitoring') || path.includes('analytics')
)

if (hasPerformanceImpact) {
  message('⚡ Performance-related changes detected. Please run performance tests before merging.')
}

// Documentation reminder
const hasApiChanges = danger.git.modified_files.some(path => path.includes('app/api/'))
if (hasApiChanges) {
  message('📚 API changes detected. Please update the API documentation if needed.')
}

// Congratulate on small PRs
if (totalChanges < 100) {
  message('✨ Great job keeping this PR small and focused!')
}

// Check for package.json changes
if (danger.git.modified_files.includes('package.json')) {
  const lockFileChanged = danger.git.modified_files.some(path => 
    path === 'package-lock.json' || path === 'pnpm-lock.yaml' || path === 'yarn.lock'
  )
  
  if (!lockFileChanged) {
    fail('📦 package.json was modified but no lock file changes detected. Please run `npm install` and commit the lock file.')
  }
}