/**
 * Input Validation and Sanitization
 * Comprehensive security for all user inputs
 */

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Common validation patterns
export const _validationPatterns = {
  // Safe string - no HTML/Script tags
  safeString: z
    .string()
    .min(1)
    .transform(val => {
      if (typeof window !== 'undefined') {
        return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] });
      }
      // Server-side basic sanitization
      return val.replace(/<[^>]*>/g, '').replace(/[<>\"'&]/g, '');
    }),

  // Email validation
  email: z.string().email().toLowerCase().trim(),

  // Country code (ISO 3166-1 alpha-2)
  countryCode: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/),

  // Date validation
  date: z.string().datetime().or(z.date()),

  // Positive integer
  positiveInt: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .or(z.number().int().positive()),

  // URL validation
  url: z
    .string()
    .url()
    .refine(url => {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
    }, 'Invalid URL'),

  // UUID validation
  uuid: z.string().uuid(),

  // Safe filename
  filename: z.string().regex(/^[a-zA-Z0-9-_\.]+$/, 'Invalid filename'),

  // Phone number (basic)
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
};

// Trip validation schemas
export const _tripValidation = {
  create: z
    .object({
      countryCode: validationPatterns.countryCode,
      entryDate: validationPatterns.date,
      exitDate: validationPatterns.date,
      purpose: z.enum([
        'tourism',
        'business',
        'family',
        'education',
        'medical',
        'other',
      ]),
      notes: validationPatterns.safeString.optional(),
    })
    .refine(
      data => {
        const entry = new Date(data.entryDate);
        const exit = new Date(data.exitDate);
        return exit > entry;
      },
      {
        message: 'Exit date must be after entry date',
        path: ['exitDate'],
      }
    ),

  update: z.object({
    countryCode: validationPatterns.countryCode.optional(),
    entryDate: validationPatterns.date.optional(),
    exitDate: validationPatterns.date.optional(),
    purpose: z
      .enum(['tourism', 'business', 'family', 'education', 'medical', 'other'])
      .optional(),
    notes: validationPatterns.safeString.optional(),
    status: z.enum(['PLANNED', 'COMPLETED', 'CANCELLED']).optional(),
  }),

  query: z.object({
    userId: validationPatterns.uuid.optional(),
    countryCode: validationPatterns.countryCode.optional(),
    startDate: validationPatterns.date.optional(),
    endDate: validationPatterns.date.optional(),
    status: z.enum(['PLANNED', 'COMPLETED', 'CANCELLED']).optional(),
    limit: validationPatterns.positiveInt.optional(),
    offset: validationPatterns.positiveInt.optional(),
  }),
};

// User validation schemas
export const _userValidation = {
  update: z.object({
    name: z
      .string()
      .min(1)
      .max(100)
      .transform(val => {
        if (typeof window !== 'undefined') {
          return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] });
        }
        return val.replace(/<[^>]*>/g, '').replace(/[<>\"'&]/g, '');
      })
      .optional(),
    email: validationPatterns.email.optional(),
    image: validationPatterns.url.optional(),
  }),

  notificationSettings: z.object({
    emailNotifications: z.boolean(),
    schengenAlerts: z.boolean(),
    reminderDays: z.number().int().min(0).max(30),
  }),
};

// API parameter validation
export const _apiValidation = {
  pagination: z.object({
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .or(z.number().int().positive())
      .optional()
      .default(1),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .or(z.number().int().positive().max(100))
      .optional()
      .default(20),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
    sortBy: z
      .string()
      .regex(/^[a-zA-Z_]+$/)
      .optional()
      .default('createdAt'),
  }),

  dateRange: z
    .object({
      startDate: validationPatterns.date,
      endDate: validationPatterns.date,
    })
    .refine(
      data => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end >= start;
      },
      {
        message: 'End date must be after or equal to start date',
        path: ['endDate'],
      }
    ),

  search: z.object({
    query: z
      .string()
      .min(1)
      .max(100)
      .transform(val => {
        if (typeof window !== 'undefined') {
          return DOMPurify.sanitize(val, { ALLOWED_TAGS: [] });
        }
        return val.replace(/<[^>]*>/g, '').replace(/[<>\"'&]/g, '');
      }),
    fields: z.array(z.string().regex(/^[a-zA-Z_]+$/)).optional(),
  }),
};

// SQL injection prevention
export function sanitizeSQLIdentifier(identifier: string): string {
  // Only allow alphanumeric and underscore
  return identifier.replace(/[^a-zA-Z0-9_]/g, '');
}

// XSS prevention for dynamic content
export function sanitizeHTML(html: string): string {
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  }
  // Server-side fallback
  return html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );
}

// File upload validation
export const _fileValidation = {
  image: z.object({
    name: validationPatterns.filename,
    type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    size: z.number().max(5 * 1024 * 1024), // 5MB max
  }),

  document: z.object({
    name: validationPatterns.filename,
    type: z.enum(['application/pdf', 'application/msword', 'text/plain']),
    size: z.number().max(10 * 1024 * 1024), // 10MB max
  }),
};

// Validation middleware helper
export async function validateRequest<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): Promise<
  { success: true; data: T } | { success: false; errors: z.ZodError }
> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Express/Next.js middleware wrapper
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (req: Request) => {
    const body = await req.json();
    const result = await validateRequest(body, schema);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: result.errors.format(),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Attach validated data to request
    (req as any).validatedData = result.data;
    return null;
  };
}
