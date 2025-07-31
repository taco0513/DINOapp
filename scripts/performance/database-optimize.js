#!/usr/bin/env node

/**
 * Database Performance Optimization Script
 * Applies indexes, analyzes performance, and provides recommendations
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🔧 Starting database performance optimization...\n');

  try {
    // 1. Apply performance indexes
    await applyIndexes();

    // 2. Analyze table statistics
    await analyzeTableStats();

    // 3. Check query performance
    await checkQueryPerformance();

    // 4. Generate recommendations
    await generateRecommendations();

    console.log('\n✅ Database optimization completed successfully!');
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function applyIndexes() {
  console.log('📊 Applying performance indexes...');

  const indexesPath = path.join(
    __dirname,
    '../../prisma/performance/indexes.sql'
  );

  if (!fs.existsSync(indexesPath)) {
    console.log('⚠️  Indexes file not found, skipping...');
    return;
  }

  const indexesSQL = fs.readFileSync(indexesPath, 'utf8');
  const statements = indexesSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.toLowerCase().includes('create index')) {
      try {
        await prisma.$executeRawUnsafe(statement);
        const indexName = statement.match(/idx_\w+/)?.[0] || 'unknown';
        console.log(`  ✓ Applied index: ${indexName}`);
      } catch (error) {
        // Index might already exist
        if (!error.message.includes('already exists')) {
          console.log(`  ⚠️  Failed to apply index: ${error.message}`);
        }
      }
    }
  }
}

async function analyzeTableStats() {
  console.log('\n📈 Analyzing table statistics...');

  const tables = ['User', 'TravelRecord', 'VisaRecord', 'Account', 'Session'];

  for (const table of tables) {
    try {
      // Get table size
      const sizeResult = await prisma.$queryRawUnsafe(
        `
        SELECT pg_size_pretty(pg_total_relation_size($1)) as size
      `,
        table
      );

      // Get row count
      const countResult = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM "${table}"
      `);

      console.log(`  📋 ${table}:`);
      console.log(`     Size: ${sizeResult[0].size}`);
      console.log(`     Rows: ${countResult[0].count}`);

      // Run ANALYZE to update statistics
      await prisma.$executeRawUnsafe(`ANALYZE "${table}"`);
      console.log(`     ✓ Statistics updated`);
    } catch (error) {
      console.log(`  ❌ Failed to analyze ${table}: ${error.message}`);
    }
  }
}

async function checkQueryPerformance() {
  console.log('\n⚡ Checking query performance...');

  const performanceQueries = [
    {
      name: 'User lookup by email',
      query: 'SELECT * FROM "User" WHERE email = $1 LIMIT 1',
      params: ['test@example.com'],
    },
    {
      name: 'Travel records by user (recent)',
      query: `
        SELECT * FROM "TravelRecord" 
        WHERE "userId" = $1 
        ORDER BY "entryDate" DESC 
        LIMIT 20
      `,
      params: ['test-user-id'],
    },
    {
      name: 'Schengen records (6 months)',
      query: `
        SELECT * FROM "TravelRecord" 
        WHERE "userId" = $1 
        AND "countryCode" IN ('DE', 'FR', 'IT', 'ES') 
        AND "entryDate" >= $2
      `,
      params: [
        'test-user-id',
        new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
      ],
    },
  ];

  for (const { name, query, params } of performanceQueries) {
    try {
      const startTime = Date.now();

      // Use EXPLAIN ANALYZE to get query plan
      const explainQuery = `EXPLAIN ANALYZE ${query}`;
      const result = await prisma.$queryRawUnsafe(explainQuery, ...params);

      const duration = Date.now() - startTime;

      console.log(`  🔍 ${name}:`);
      console.log(`     Duration: ${duration}ms`);

      // Look for performance issues in explain output
      const explainText = result.map(r => Object.values(r)[0]).join('\n');

      if (explainText.includes('Seq Scan')) {
        console.log(
          `     ⚠️  Sequential scan detected - consider adding index`
        );
      }

      if (duration > 100) {
        console.log(`     ⚠️  Slow query detected (>${duration}ms)`);
      } else {
        console.log(`     ✓ Good performance`);
      }
    } catch (error) {
      console.log(`  ❌ Failed to test ${name}: ${error.message}`);
    }
  }
}

async function generateRecommendations() {
  console.log('\n💡 Generating performance recommendations...');

  try {
    // Check for missing indexes on large tables
    const travelRecordCount = await prisma.travelRecord.count();

    if (travelRecordCount > 1000) {
      console.log('  📊 Large dataset detected:');
      console.log('     - Consider partitioning TravelRecord by year');
      console.log('     - Implement data archiving for old records');
      console.log('     - Use materialized views for complex calculations');
    }

    // Check for unused indexes
    const indexUsageQuery = `
      SELECT schemaname, tablename, indexname, idx_scan 
      FROM pg_stat_user_indexes 
      WHERE idx_scan = 0 
      AND schemaname = 'public'
    `;

    try {
      const unusedIndexes = await prisma.$queryRawUnsafe(indexUsageQuery);

      if (unusedIndexes.length > 0) {
        console.log('  🗑️  Unused indexes found:');
        unusedIndexes.forEach(idx => {
          console.log(`     - ${idx.indexname} on ${idx.tablename}`);
        });
        console.log(
          '     Consider dropping unused indexes to improve write performance'
        );
      }
    } catch (error) {
      // pg_stat_user_indexes might not be available
      console.log('  ℹ️  Unable to check index usage statistics');
    }

    // Connection pool recommendations
    console.log('  🔗 Connection pool recommendations:');
    console.log('     - Set connection_limit based on your hosting plan');
    console.log('     - Use connection pooling (PgBouncer) for high traffic');
    console.log('     - Monitor active connections during peak usage');

    // Caching recommendations
    console.log('  💾 Caching recommendations:');
    console.log('     - Cache frequently accessed user data');
    console.log('     - Use Redis for session storage in production');
    console.log(
      '     - Implement query result caching for complex calculations'
    );
  } catch (error) {
    console.log(`  ❌ Failed to generate recommendations: ${error.message}`);
  }
}

// Health check function
async function healthCheck() {
  console.log('🏥 Database health check...\n');

  try {
    // Check connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection: OK');

    // Check response time
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT NOW()`;
    const responseTime = Date.now() - startTime;

    console.log(`⏱️  Response time: ${responseTime}ms`);

    if (responseTime > 1000) {
      console.log('⚠️  High response time detected');
    }

    // Check active connections
    try {
      const connectionStats = await prisma.$queryRawUnsafe(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);

      const stats = connectionStats[0];
      console.log(
        `🔗 Connections: ${stats.active_connections} active, ${stats.idle_connections} idle (${stats.total_connections} total)`
      );

      if (stats.active_connections > 15) {
        console.log('⚠️  High number of active connections');
      }
    } catch (error) {
      console.log('ℹ️  Unable to check connection statistics');
    }
  } catch (error) {
    console.log('❌ Database health check failed:', error.message);
    process.exit(1);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'optimize':
    main();
    break;
  case 'health':
    healthCheck().finally(() => prisma.$disconnect());
    break;
  case 'indexes':
    applyIndexes().finally(() => prisma.$disconnect());
    break;
  case 'analyze':
    analyzeTableStats().finally(() => prisma.$disconnect());
    break;
  default:
    console.log(`
Usage: node database-optimize.js <command>

Commands:
  optimize  - Run full optimization (indexes, analyze, recommendations)
  health    - Check database health and performance
  indexes   - Apply performance indexes only
  analyze   - Update table statistics only

Examples:
  node database-optimize.js optimize
  node database-optimize.js health
    `);
    process.exit(1);
}
