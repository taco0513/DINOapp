-- Performance optimization indexes for DINOapp
-- These indexes are designed to improve query performance for common operations

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON "User"("createdAt");

-- Travel Records - Most frequently queried table
-- Primary query patterns: by userId, by date ranges, by country
CREATE INDEX IF NOT EXISTS idx_travel_record_user_id ON "TravelRecord"("userId");
CREATE INDEX IF NOT EXISTS idx_travel_record_entry_date ON "TravelRecord"("entryDate");
CREATE INDEX IF NOT EXISTS idx_travel_record_exit_date ON "TravelRecord"("exitDate");
CREATE INDEX IF NOT EXISTS idx_travel_record_country_code ON "TravelRecord"("countryCode");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_travel_record_user_date ON "TravelRecord"("userId", "entryDate" DESC);
CREATE INDEX IF NOT EXISTS idx_travel_record_user_country ON "TravelRecord"("userId", "countryCode");
CREATE INDEX IF NOT EXISTS idx_travel_record_date_range ON "TravelRecord"("entryDate", "exitDate");

-- Schengen-specific optimization (most common use case)
-- Countries that are part of Schengen area
CREATE INDEX IF NOT EXISTS idx_travel_record_schengen ON "TravelRecord"("userId", "countryCode", "entryDate") 
WHERE "countryCode" IN ('AT', 'BE', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'SK', 'SI', 'ES', 'SE', 'CH');

-- Visa Records indexes
CREATE INDEX IF NOT EXISTS idx_visa_record_user_id ON "VisaRecord"("userId");
CREATE INDEX IF NOT EXISTS idx_visa_record_country_code ON "VisaRecord"("countryCode");
CREATE INDEX IF NOT EXISTS idx_visa_record_expiry_date ON "VisaRecord"("expiryDate");
CREATE INDEX IF NOT EXISTS idx_visa_record_user_expiry ON "VisaRecord"("userId", "expiryDate");

-- Account table indexes
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "Account"("userId");
CREATE INDEX IF NOT EXISTS idx_account_provider_account ON "Account"("provider", "providerAccountId");

-- Session table indexes  
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "Session"("userId");
CREATE INDEX IF NOT EXISTS idx_session_expires ON "Session"("expires");
CREATE INDEX IF NOT EXISTS idx_session_token ON "Session"("sessionToken");

-- Verification Token indexes
CREATE INDEX IF NOT EXISTS idx_verification_token_identifier ON "VerificationToken"("identifier");
CREATE INDEX IF NOT EXISTS idx_verification_token_expires ON "VerificationToken"("expires");

-- Performance monitoring queries
-- Use these to monitor index effectiveness

-- Check index usage statistics
-- SELECT schemaname, tablename, attname, n_distinct, correlation 
-- FROM pg_stats 
-- WHERE tablename IN ('TravelRecord', 'User', 'VisaRecord');

-- Check slow queries
-- SELECT query, calls, total_time, mean_time 
-- FROM pg_stat_statements 
-- ORDER BY mean_time DESC 
-- LIMIT 10;

-- Table size monitoring
-- SELECT 
--   schemaname,
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
-- FROM pg_tables 
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index size monitoring
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   pg_size_pretty(pg_relation_size(indexname::regclass)) as size
-- FROM pg_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexname::regclass) DESC;

-- Maintenance commands (run periodically)
-- ANALYZE "TravelRecord";
-- ANALYZE "User";
-- ANALYZE "VisaRecord";
-- VACUUM ANALYZE;

-- Additional optimizations for large datasets
-- Partitioning strategy for TravelRecord by year (if dataset grows large)
-- CREATE TABLE "TravelRecord_2024" PARTITION OF "TravelRecord" 
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Materialized view for Schengen calculations (if needed)
-- CREATE MATERIALIZED VIEW schengen_summary AS
-- SELECT 
--   "userId",
--   COUNT(*) as trip_count,
--   SUM(EXTRACT(DAY FROM ("exitDate" - "entryDate"))) as total_days,
--   MAX("exitDate") as last_exit
-- FROM "TravelRecord"
-- WHERE "countryCode" IN (/* Schengen countries */)
-- GROUP BY "userId";

-- Query hints for complex operations
-- For PostgreSQL, use EXPLAIN ANALYZE to understand query plans:
-- EXPLAIN ANALYZE SELECT * FROM "TravelRecord" WHERE "userId" = 'user-id' ORDER BY "entryDate" DESC;