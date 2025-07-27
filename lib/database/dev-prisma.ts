/**
 * Development Prisma Client for SQLite
 * This file provides a simple Prisma client for local development with SQLite
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  devPrisma: PrismaClient | undefined
}

// Development Prisma client with SQLite
export const devPrisma = globalForPrisma.devPrisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.devPrisma = devPrisma
}

// Helper to determine if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('file:')

// Export the appropriate client based on environment
export const getPrismaClient = () => {
  if (isDevelopment) {
    return devPrisma
  }
  // In production, use the main prisma client
  return require('../prisma').prisma
}