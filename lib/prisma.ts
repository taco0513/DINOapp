// Use the optimized connection pool instead of direct Prisma client
export { prisma } from './database/connection-pool'
export { prisma as default } from './database/connection-pool'

// Keep legacy export for compatibility during transition
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Legacy client for compatibility (will be phased out)
const legacyPrisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL?.includes('sqlite') 
        ? process.env.DATABASE_URL 
        : process.env.DATABASE_URL + '?pgbouncer=true&statement_cache_size=0',
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = legacyPrisma