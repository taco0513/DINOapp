-- Performance Optimization Indexes for DINO App
-- Run these indexes to improve query performance

-- =======================
-- TRIPS TABLE INDEXES
-- =======================

-- Index for user trips queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_trips_user_entry_date 
ON Trip(userId, entryDate DESC);

-- Index for Schengen calculations (country + date range queries)
CREATE INDEX IF NOT EXISTS idx_trips_country_dates 
ON Trip(countryCode, entryDate, exitDate);

-- Index for status-based queries
CREATE INDEX IF NOT EXISTS idx_trips_user_status 
ON Trip(userId, status);

-- Composite index for complex trip queries
CREATE INDEX IF NOT EXISTS idx_trips_user_country_status_date 
ON Trip(userId, countryCode, status, entryDate DESC);

-- Index for trip updates (frequently updated fields)
CREATE INDEX IF NOT EXISTS idx_trips_updated_at 
ON Trip(updatedAt DESC);

-- =======================
-- USER TABLE INDEXES  
-- =======================

-- Index for user email lookups (authentication)
CREATE INDEX IF NOT EXISTS idx_users_email 
ON User(email);

-- Index for user lookup by external ID
CREATE INDEX IF NOT EXISTS idx_users_external_id 
ON User(id, email);

-- =======================
-- SESSION TABLE INDEXES
-- =======================

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_id 
ON Session(userId);

-- Index for session token lookups
CREATE INDEX IF NOT EXISTS idx_sessions_session_token 
ON Session(sessionToken);

-- Index for session expiry cleanup
CREATE INDEX IF NOT EXISTS idx_sessions_expires 
ON Session(expires);

-- =======================
-- ACCOUNTS TABLE INDEXES
-- =======================

-- Index for account provider lookups
CREATE INDEX IF NOT EXISTS idx_accounts_provider_account 
ON Account(provider, providerAccountId);

-- Index for user account lookups
CREATE INDEX IF NOT EXISTS idx_accounts_user_id 
ON Account(userId);

-- =======================
-- PERFORMANCE STATISTICS
-- =======================

-- Query to analyze index usage (PostgreSQL)
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- ORDER BY idx_scan DESC;

-- Query to find unused indexes (PostgreSQL)
-- SELECT schemaname, tablename, indexname, idx_scan
-- FROM pg_stat_user_indexes 
-- WHERE idx_scan = 0 AND schemaname != 'information_schema';

-- =======================
-- MAINTENANCE QUERIES
-- =======================

-- Analyze tables to update statistics (PostgreSQL)
-- ANALYZE Trip;
-- ANALYZE User;
-- ANALYZE Session;  
-- ANALYZE Account;

-- Vacuum tables to reclaim space (PostgreSQL)
-- VACUUM ANALYZE Trip;
-- VACUUM ANALYZE User;

-- =======================
-- QUERY PERFORMANCE HINTS
-- =======================

-- For SQLite, enable query planner:
-- PRAGMA optimize;

-- For PostgreSQL, update table statistics:
-- ANALYZE;

-- Monitor slow queries:
-- For PostgreSQL: Enable log_min_duration_statement
-- For SQLite: Use EXPLAIN QUERY PLAN