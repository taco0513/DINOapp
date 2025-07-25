-- Production database optimization script for DiNoCal
-- This script should be run after Prisma migrations in production

-- Create additional indexes for performance (if not already created by Prisma)
CREATE INDEX IF NOT EXISTS "idx_countryvisit_user_entry_exit" ON "CountryVisit"("userId", "entryDate", "exitDate");
CREATE INDEX IF NOT EXISTS "idx_countryvisit_visa_passport" ON "CountryVisit"("visaType", "passportCountry");
CREATE INDEX IF NOT EXISTS "idx_countryvisit_entry_country" ON "CountryVisit"("entryDate", "country");
CREATE INDEX IF NOT EXISTS "idx_user_email_created" ON "User"("email", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_session_expires" ON "Session"("expires");

-- Optimize SQLite for production (if using SQLite)
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 1000000;
PRAGMA foreign_keys = ON;
PRAGMA temp_store = MEMORY;

-- Create a view for quick Schengen calculations
CREATE VIEW IF NOT EXISTS "SchengenTripView" AS
SELECT 
  cv.*,
  CASE 
    WHEN cv.country IN (
      'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
      'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia',
      'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland',
      'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
      'Liechtenstein'
    ) THEN 1 
    ELSE 0 
  END as "isSchengen"
FROM "CountryVisit" cv
WHERE cv.country IN (
  'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
  'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia',
  'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland',
  'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland',
  'Liechtenstein'
);

-- Insert initial system data if needed
INSERT OR IGNORE INTO "User" (id, email, name, passportCountry, createdAt, updatedAt)
VALUES ('system', 'system@dinocal.app', 'System User', 'OTHER', datetime('now'), datetime('now'));

-- Clean up old sessions periodically (run this as a cron job)
-- DELETE FROM "Session" WHERE expires < datetime('now', '-7 days');

-- Database statistics view
CREATE VIEW IF NOT EXISTS "DatabaseStats" AS
SELECT 
  'users' as table_name,
  COUNT(*) as row_count,
  'User accounts' as description
FROM "User"
UNION ALL
SELECT 
  'trips' as table_name,
  COUNT(*) as row_count,
  'Total trip records' as description
FROM "CountryVisit"
UNION ALL
SELECT 
  'schengen_trips' as table_name,
  COUNT(*) as row_count,
  'Schengen area trips' as description
FROM "SchengenTripView"
UNION ALL
SELECT 
  'active_sessions' as table_name,
  COUNT(*) as row_count,
  'Active user sessions' as description
FROM "Session" 
WHERE expires > datetime('now');

-- Performance monitoring
CREATE VIEW IF NOT EXISTS "UserActivityStats" AS
SELECT 
  u.id,
  u.email,
  u.name,
  COUNT(cv.id) as total_trips,
  COUNT(DISTINCT cv.country) as countries_visited,
  MIN(cv.entryDate) as first_trip,
  MAX(cv.entryDate) as last_trip,
  u.createdAt as user_created
FROM "User" u
LEFT JOIN "CountryVisit" cv ON u.id = cv.userId
GROUP BY u.id, u.email, u.name, u.createdAt;

COMMIT;