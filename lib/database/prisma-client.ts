/**
 * Enhanced Prisma Client with Connection Recovery
 * Provides resilient database access with automatic recovery
 */

import { PrismaClient } from '@prisma/client';
import {
  DatabaseConnectionManager,
  getPrismaClient as getConnectionManagerClient,
  executeWithRetry,
  isDbHealthy,
} from './connection-manager';
import { AppError, ErrorCode, ErrorSeverity } from '@/lib/error/error-handler';

// Global error handler for Prisma
const handlePrismaError = (error: any): never => {
  if (error.code === 'P2002') {
    throw new AppError(
      ErrorCode.CONFLICT,
      'Duplicate entry found',
      409,
      ErrorSeverity.LOW,
      { field: error.meta?.target }
    );
  }

  if (error.code === 'P2025') {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      'Record not found',
      404,
      ErrorSeverity.LOW
    );
  }

  if (error.code === 'P2003') {
    throw new AppError(
      ErrorCode.BAD_REQUEST,
      'Foreign key constraint failed',
      400,
      ErrorSeverity.MEDIUM,
      { field: error.meta?.field_name }
    );
  }

  // Connection errors
  if (error.code === 'P1001' || error.code === 'P1002') {
    throw new AppError(
      ErrorCode.DATABASE_ERROR,
      'Database connection failed',
      500,
      ErrorSeverity.CRITICAL
    );
  }

  // Generic database error
  throw new AppError(
    ErrorCode.DATABASE_ERROR,
    'Database operation failed',
    500,
    ErrorSeverity.HIGH,
    { originalError: error.message }
  );
};

// Create singleton instance with middleware
let prismaClient: PrismaClient | null = null;

export async function getPrismaClient(): Promise<PrismaClient> {
  // Always get fresh client from connection manager
  const client = await getConnectionManagerClient();

  // Add middleware only once
  if (!prismaClient) {
    prismaClient = client;

    // Add error handling middleware
    prismaClient.$use(async (params, next) => {
      try {
        // Log slow queries in development
        if (process.env.NODE_ENV === 'development') {
          const startTime = Date.now();
          const result = await next(params);
          const duration = Date.now() - startTime;

          if (duration > 1000) {
            console.warn(`⚠️ Slow query (${duration}ms):`, {
              model: params.model,
              action: params.action,
            });
          }

          return result;
        }

        return await next(params);
      } catch (error) {
        handlePrismaError(error);
      }
    });

    // Add retry middleware for transient errors
    prismaClient.$use(async (params, next) => {
      const isWrite = [
        'create',
        'update',
        'upsert',
        'delete',
        'createMany',
        'updateMany',
        'deleteMany',
      ].includes(params.action);

      if (isWrite) {
        return executeWithRetry(() => next(params), {
          maxRetries: 2,
          retryDelay: 500,
          onRetry: (attempt, error) => {
            console.warn(
              `Retrying database operation (${attempt}/2):`,
              error.message
            );
          },
        });
      }

      return next(params);
    });
  }

  return client;
}

// Health check function
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const client = await getPrismaClient();
    await client.$queryRaw`SELECT 1`;

    return {
      isHealthy: true,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      isHealthy: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Transaction helper with automatic retry
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?:
      | 'ReadUncommitted'
      | 'ReadCommitted'
      | 'RepeatableRead'
      | 'Serializable';
  }
): Promise<T> {
  const client = await getPrismaClient();

  return executeWithRetry(
    () =>
      client.$transaction(fn, {
        maxWait: options?.maxWait ?? 5000,
        timeout: options?.timeout ?? 10000,
        isolationLevel: options?.isolationLevel,
      }),
    {
      maxRetries: 2,
      retryDelay: 1000,
    }
  );
}

// Query builder helpers with automatic connection recovery
export const db = {
  get user() {
    return getPrismaClient().then(client => client.user);
  },

  get trip() {
    return getPrismaClient().then(client => client.trip);
  },

  get userProfile() {
    return getPrismaClient().then(client => client.userProfile);
  },

  get notification() {
    return getPrismaClient().then(client => client.notification);
  },

  get visaRequirement() {
    return getPrismaClient().then(client => client.visaRequirement);
  },

  get countryRestriction() {
    return getPrismaClient().then(client => client.countryRestriction);
  },

  get subscription() {
    return getPrismaClient().then(client => client.subscription);
  },

  get billingHistory() {
    return getPrismaClient().then(client => client.billingHistory);
  },

  // Raw query with retry
  async $queryRaw<T = unknown>(
    query: TemplateStringsArray,
    ...values: any[]
  ): Promise<T> {
    const client = await getPrismaClient();
    return executeWithRetry(() => client.$queryRaw<T>(query, ...values));
  },

  // Execute raw with retry
  async $executeRaw(
    query: TemplateStringsArray,
    ...values: any[]
  ): Promise<number> {
    const client = await getPrismaClient();
    return executeWithRetry(() => client.$executeRaw(query, ...values));
  },

  // Transaction helper
  $transaction: withTransaction,
};

// Export health check
export { isDbHealthy } from './connection-manager';
