-- Database Optimization Script for DINO Application
-- Performance optimizations, additional indexes, and maintenance

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Analyze current tables
ANALYZE "User";
ANALYZE "CountryVisit";
ANALYZE "Account";
ANALYZE "Session";
ANALYZE "NotificationSettings";

-- Additional optimized indexes for CountryVisit table
-- (These supplement the existing indexes in schema.prisma)

-- Composite index for Schengen calculations (most common query pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_country_visit_schengen_calc" 
ON "CountryVisit" ("userId", "entryDate", "exitDate") 
WHERE "country" IN (
    'Austria', 'Belgium', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
    'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Italy', 'Latvia',
    'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Norway', 'Poland',
    'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland'
);

-- Partial index for active trips (exitDate is null)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_country_visit_active_trips" 
ON "CountryVisit" ("userId", "entryDate") 
WHERE "exitDate" IS NULL;

-- Covering index for trip analytics (includes all needed columns)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_country_visit_analytics_covering" 
ON "CountryVisit" ("userId", "country") 
INCLUDE ("entryDate", "exitDate", "visaType", "maxDays");

-- Index for visa expiry notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_country_visit_visa_expiry" 
ON "CountryVisit" ("entryDate", "maxDays") 
WHERE "exitDate" IS NULL;

-- Optimize User table queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_email_verified" 
ON "User" ("email") 
WHERE "emailVerified" IS NOT NULL;

-- Session table optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_session_expires_active" 
ON "Session" ("expires") 
WHERE "expires" > NOW();

-- Account table optimization for OAuth
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_account_provider_type" 
ON "Account" ("provider", "type", "userId");

-- Performance tuning settings
-- Adjust these based on your production environment

-- Connection and memory settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Query optimization
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Logging for performance monitoring
ALTER SYSTEM SET log_min_duration_statement = 100;
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_lock_waits = on;

-- Auto-vacuum tuning for high-traffic tables
ALTER TABLE "CountryVisit" SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05,
    autovacuum_vacuum_cost_limit = 200
);

ALTER TABLE "Session" SET (
    autovacuum_vacuum_scale_factor = 0.05,
    autovacuum_analyze_scale_factor = 0.02
);

-- Create maintenance procedures

-- Procedure to cleanup old sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM "Session" WHERE "expires" < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO pg_log(message) VALUES (
        'Cleaned up ' || deleted_count || ' expired sessions'
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Procedure to update table statistics
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS VOID AS $$
BEGIN
    ANALYZE "User";
    ANALYZE "CountryVisit";
    ANALYZE "Account";
    ANALYZE "Session";
    ANALYZE "NotificationSettings";
    
    -- Log the update
    INSERT INTO pg_log(message) VALUES (
        'Updated table statistics at ' || NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Procedure to get database health metrics
CREATE OR REPLACE FUNCTION get_database_health()
RETURNS TABLE (
    metric_name TEXT,
    metric_value TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Database Size'::TEXT,
        pg_size_pretty(pg_database_size(current_database()))::TEXT,
        'INFO'::TEXT
    UNION ALL
    SELECT 
        'Active Connections'::TEXT,
        COUNT(*)::TEXT,
        CASE WHEN COUNT(*) > 80 THEN 'WARNING' ELSE 'OK' END::TEXT
    FROM pg_stat_activity
    WHERE state = 'active'
    UNION ALL
    SELECT 
        'Cache Hit Ratio'::TEXT,
        ROUND((blks_hit::FLOAT / (blks_hit + blks_read) * 100)::NUMERIC, 2)::TEXT || '%',
        CASE 
            WHEN (blks_hit::FLOAT / (blks_hit + blks_read) * 100) < 95 THEN 'WARNING'
            ELSE 'OK'
        END::TEXT
    FROM pg_stat_database
    WHERE datname = current_database()
    UNION ALL
    SELECT 
        'Slow Queries'::TEXT,
        COUNT(*)::TEXT,
        CASE WHEN COUNT(*) > 10 THEN 'WARNING' ELSE 'OK' END::TEXT
    FROM pg_stat_statements
    WHERE mean_time > 100;
END;
$$ LANGUAGE plpgsql;

-- Create maintenance schedule (to be used with cron jobs)
-- These would be called from the Vercel cron jobs defined in vercel.json

COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Run daily to clean up expired sessions';
COMMENT ON FUNCTION update_table_statistics() IS 'Run weekly to update query planner statistics';
COMMENT ON FUNCTION get_database_health() IS 'Run for health checks and monitoring';

-- Final optimization
VACUUM ANALYZE;

-- Create performance monitoring view
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    CASE 
        WHEN seq_scan > idx_scan THEN 'Consider adding indexes'
        WHEN n_dead_tup > n_live_tup * 0.1 THEN 'Needs vacuum'
        ELSE 'OK'
    END as recommendation
FROM pg_stat_user_tables
ORDER BY seq_tup_read DESC;

COMMENT ON VIEW performance_summary IS 'Database performance overview with recommendations';

-- Grant appropriate permissions
-- Note: Adjust these based on your actual database user setup
-- GRANT SELECT ON performance_summary TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_database_health() TO your_app_user;