/**
 * Development Prisma Client for SQLite
 * This file provides a simple Prisma client for local development with SQLite
 * Enhanced with connection recovery and error handling
 */

import { PrismaClient } from '@prisma/client';
import { getPrismaClient as getEnhancedClient } from './prisma-client';

const globalForPrisma = globalThis as unknown as {
  devPrisma: PrismaClient | undefined;
};

// Development Prisma client with SQLite - Enhanced error handling
export const devPrisma =
  globalForPrisma.devPrisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:./dev.db',
      },
    },
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.devPrisma = devPrisma;
}

// Helper to determine if we're in development mode
export const isDevelopment =
  process.env.NODE_ENV === 'development' ||
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes('file:');

// Export the appropriate client based on environment
export const getPrismaClient = async () => {
  if (isDevelopment) {
    // In development, return the simple client without connection recovery
    // SQLite doesn't need connection recovery
    return devPrisma;
  }
  // In production, use the enhanced client with connection recovery
  return getEnhancedClient();
};
