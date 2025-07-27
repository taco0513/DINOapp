# DINO Database Design Documentation

## 🗄️ Database Architecture Overview

### Technology Stack
- **Development**: SQLite (lightweight, zero-config)
- **Production**: PostgreSQL 15+ (scalable, reliable)
- **ORM**: Prisma (type-safe, auto-generated client)
- **Connection Management**: PgBouncer for connection pooling
- **Hosting**: Vercel Postgres (serverless-optimized)

### Design Principles
1. **Normalization**: 3NF to minimize redundancy
2. **Performance**: Strategic indexing and query optimization
3. **Scalability**: Designed for horizontal scaling
4. **Data Integrity**: Constraints and foreign keys
5. **Audit Trail**: Timestamps on all tables

## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Account : has
    User ||--o{ Session : has
    User ||--o{ CountryVisit : records
    User ||--o| NotificationSettings : configures
    
    User {
        string id PK
        string email UK
        string name
        datetime emailVerified
        string image
        string googleId UK
        string passportCountry
        string timezone
        datetime createdAt
        datetime updatedAt
    }
    
    Account {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token
        string access_token
        int expires_at
        string token_type
        string scope
        string id_token
        string session_state
    }
    
    Session {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
    }
    
    CountryVisit {
        string id PK
        string userId FK
        string country
        datetime entryDate
        datetime exitDate
        string visaType
        int maxDays
        string passportCountry
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    NotificationSettings {
        string id PK
        string userId FK UK
        string visaExpiryDays
        int schengenWarningDays
        boolean emailEnabled
        boolean pushEnabled
        datetime updatedAt
    }
    
    VerificationToken {
        string identifier
        string token UK
        datetime expires
    }
```

## 🔑 Schema Details

### User Table
Primary entity storing user information and preferences.

```sql
CREATE TABLE User (
    id VARCHAR(30) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    emailVerified TIMESTAMP,
    image TEXT,
    googleId VARCHAR(255) UNIQUE,
    passportCountry VARCHAR(10) DEFAULT 'OTHER',
    timezone VARCHAR(50) DEFAULT 'UTC',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_googleId (googleId)
);
```

**Key Points:**
- `passportCountry`: Enum values: US, UK, EU, CA, AU, JP, OTHER
- `timezone`: IANA timezone format (e.g., 'America/New_York')
- Soft delete not implemented (GDPR compliance - true deletion)

### CountryVisit Table
Core table for trip tracking and Schengen calculations.

```sql
CREATE TABLE CountryVisit (
    id VARCHAR(30) PRIMARY KEY DEFAULT gen_random_uuid(),
    userId VARCHAR(30) NOT NULL,
    country VARCHAR(100) NOT NULL,
    entryDate TIMESTAMP NOT NULL,
    exitDate TIMESTAMP,
    visaType VARCHAR(50) NOT NULL,
    maxDays INTEGER NOT NULL CHECK (maxDays >= 1 AND maxDays <= 365),
    passportCountry VARCHAR(10) NOT NULL,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    
    -- Optimized indexes for common queries
    INDEX idx_user_trips (userId),
    INDEX idx_country (country),
    INDEX idx_entry_date (entryDate),
    INDEX idx_user_entry (userId, entryDate),
    INDEX idx_user_country (userId, country),
    INDEX idx_date_range (entryDate, exitDate),
    INDEX idx_visa_type (visaType),
    INDEX idx_passport (passportCountry),
    INDEX idx_schengen_calc (userId, entryDate, exitDate),
    INDEX idx_recent (createdAt)
);
```

**Visa Types:**
- Tourist, Business, Student, Working Holiday, Digital Nomad
- Transit, Work, Investor, Retirement, Volunteer
- Visa Run, Extension, Spouse, Medical

**Index Strategy:**
- `idx_user_entry`: Most common query pattern
- `idx_schengen_calc`: Optimized for 90/180 day calculations
- `idx_date_range`: Date-based filtering and sorting

### Account Table
OAuth provider information (NextAuth.js requirement).

```sql
CREATE TABLE Account (
    id VARCHAR(30) PRIMARY KEY DEFAULT gen_random_uuid(),
    userId VARCHAR(30) NOT NULL,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    providerAccountId VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(50),
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    UNIQUE KEY (provider, providerAccountId)
);
```

### Session Table
Active user sessions (NextAuth.js requirement).

```sql
CREATE TABLE Session (
    id VARCHAR(30) PRIMARY KEY DEFAULT gen_random_uuid(),
    sessionToken VARCHAR(255) UNIQUE NOT NULL,
    userId VARCHAR(30) NOT NULL,
    expires TIMESTAMP NOT NULL,
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    INDEX idx_session_token (sessionToken),
    INDEX idx_expires (expires)
);
```

### NotificationSettings Table
User notification preferences.

```sql
CREATE TABLE NotificationSettings (
    id VARCHAR(30) PRIMARY KEY DEFAULT gen_random_uuid(),
    userId VARCHAR(30) UNIQUE NOT NULL,
    visaExpiryDays TEXT DEFAULT '7,14,30', -- JSON array as string
    schengenWarningDays INTEGER DEFAULT 10,
    emailEnabled BOOLEAN DEFAULT true,
    pushEnabled BOOLEAN DEFAULT false,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);
```

## 📈 Query Optimization

### Common Query Patterns

#### 1. Get User's Recent Trips
```sql
-- Optimized by idx_user_entry
SELECT * FROM CountryVisit 
WHERE userId = ? 
ORDER BY entryDate DESC 
LIMIT 20;
```

#### 2. Schengen Calculation Query
```sql
-- Optimized by idx_schengen_calc
SELECT country, entryDate, exitDate 
FROM CountryVisit 
WHERE userId = ? 
  AND entryDate >= DATE_SUB(CURRENT_DATE, INTERVAL 180 DAY)
  AND country IN (/* Schengen countries */)
ORDER BY entryDate;
```

#### 3. Country Statistics
```sql
-- Optimized by idx_user_country
SELECT country, COUNT(*) as visits, 
       SUM(DATEDIFF(COALESCE(exitDate, CURRENT_DATE), entryDate)) as totalDays
FROM CountryVisit 
WHERE userId = ?
GROUP BY country
ORDER BY visits DESC;
```

## 🔄 Migration Strategy

### Initial Schema (V1)
```prisma
model CountryVisit {
  id              String    @id @default(cuid())
  userId          String
  country         String
  entryDate       DateTime
  exitDate        DateTime?
  visaType        String
  maxDays         Int
  passportCountry String
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([entryDate])
  @@index([userId, entryDate])
}
```

### Future Migrations
```sql
-- V2: Add trip purpose
ALTER TABLE CountryVisit ADD COLUMN purpose VARCHAR(50);

-- V3: Add visa expiry tracking
ALTER TABLE CountryVisit ADD COLUMN visaExpiryDate TIMESTAMP;

-- V4: Add trip cost tracking
CREATE TABLE TripExpense (
    id VARCHAR(30) PRIMARY KEY,
    tripId VARCHAR(30) NOT NULL,
    category VARCHAR(50),
    amount DECIMAL(10, 2),
    currency VARCHAR(3),
    FOREIGN KEY (tripId) REFERENCES CountryVisit(id)
);
```

## 🚀 Performance Considerations

### Connection Pooling
```typescript
// Prisma connection configuration
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool settings
  connectionLimit = 20
  pool_timeout = 10
  // Query timeout
  statement_timeout = 5000
}
```

### Query Optimization Tips
1. **Use indexes**: All foreign keys and commonly filtered columns
2. **Limit results**: Always paginate large result sets
3. **Select specific columns**: Avoid SELECT * in production
4. **Use prepared statements**: Prisma handles this automatically
5. **Monitor slow queries**: Log queries >100ms

### Caching Strategy
```typescript
// Query result caching
const cacheKey = `user_trips_${userId}_${page}`
const cached = await cache.get(cacheKey)
if (cached) return cached

const trips = await prisma.countryVisit.findMany({
  where: { userId },
  orderBy: { entryDate: 'desc' },
  take: 20,
  skip: (page - 1) * 20
})

await cache.set(cacheKey, trips, 300) // 5 min TTL
```

## 🔒 Security Measures

### Data Protection
1. **Encryption at Rest**: Database-level encryption
2. **Encryption in Transit**: SSL/TLS connections
3. **Access Control**: Row-level security for multi-tenant
4. **Audit Logging**: Track all data modifications
5. **PII Protection**: Sensitive data masking

### SQL Injection Prevention
```typescript
// Prisma prevents SQL injection automatically
// Bad (if using raw SQL):
const trips = await prisma.$queryRaw`
  SELECT * FROM CountryVisit WHERE country = ${userInput}
`

// Good (parameterized):
const trips = await prisma.countryVisit.findMany({
  where: { country: userInput }
})
```

## 🔨 Maintenance Operations

### Regular Maintenance Tasks
```sql
-- Vacuum and analyze (PostgreSQL)
VACUUM ANALYZE CountryVisit;

-- Update statistics
ANALYZE CountryVisit;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'countryvisit'
  AND n_distinct > 100
  AND correlation < 0.1;
```

### Backup Strategy
1. **Continuous Backups**: Point-in-time recovery
2. **Daily Snapshots**: Full database backup
3. **Geographic Redundancy**: Backups in multiple regions
4. **Retention Policy**: 30 days of backups
5. **Recovery Testing**: Monthly restore tests

## 📊 Monitoring & Metrics

### Key Metrics to Track
- Query response time (p50, p95, p99)
- Connection pool utilization
- Slow query log (>100ms)
- Table sizes and growth rate
- Index usage statistics
- Cache hit rates

### Alerting Thresholds
- Connection pool >80% utilized
- Query time p95 >200ms
- Failed queries >1% of total
- Database size >80% of limit
- Replication lag >5 seconds

---

This database design provides a solid foundation for the DINO application, balancing performance, scalability, and maintainability while ensuring data integrity and security.