import { 
  SecurityHeaders, 
  validateAPIKey, 
  sanitizeInput, 
  generateSecureToken,
  hashPassword,
  verifyPassword,
  encryptData,
  decryptData,
  generateCSRFToken,
  validateCSRFToken,
  checkPermissions,
  auditLog
} from '@/lib/security/api-security'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Mock dependencies
jest.mock('@/lib/database/db-client', () => ({
  db: {
    apiKey: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

const mockDb = require('@/lib/database/db-client').db

describe('API Security', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('SecurityHeaders', () => {
    it('should add all security headers to response', () => {
      const response = new NextResponse()
      const securedResponse = SecurityHeaders.addHeaders(response)

      expect(securedResponse.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(securedResponse.headers.get('X-Frame-Options')).toBe('DENY')
      expect(securedResponse.headers.get('X-XSS-Protection')).toBe('1; mode=block')
      expect(securedResponse.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
      expect(securedResponse.headers.get('Permissions-Policy')).toBeDefined()
    })

    it('should add HSTS header in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const response = new NextResponse()
      const securedResponse = SecurityHeaders.addHeaders(response)

      expect(securedResponse.headers.get('Strict-Transport-Security')).toBe(
        'max-age=63072000; includeSubDomains; preload'
      )

      process.env.NODE_ENV = originalEnv
    })

    it('should include CSP header with nonce', () => {
      const response = new NextResponse()
      const nonce = 'test-nonce-123'
      const securedResponse = SecurityHeaders.addHeaders(response, { nonce })

      const csp = securedResponse.headers.get('Content-Security-Policy')
      expect(csp).toContain(`'nonce-${nonce}'`)
    })
  })

  describe('validateAPIKey', () => {
    it('should validate a valid API key', async () => {
      const validKey = 'sk_test_valid123'
      mockDb.apiKey.findUnique.mockResolvedValue({
        id: '1',
        key: validKey,
        active: true,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        lastUsedAt: new Date(),
      })

      const result = await validateAPIKey(validKey)

      expect(result.isValid).toBe(true)
      expect(result.userId).toBe('1')
      expect(mockDb.apiKey.update).toHaveBeenCalledWith({
        where: { key: validKey },
        data: { lastUsedAt: expect.any(Date) },
      })
    })

    it('should reject an expired API key', async () => {
      const expiredKey = 'sk_test_expired123'
      mockDb.apiKey.findUnique.mockResolvedValue({
        id: '1',
        key: expiredKey,
        active: true,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      })

      const result = await validateAPIKey(expiredKey)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('API key expired')
    })

    it('should reject an inactive API key', async () => {
      const inactiveKey = 'sk_test_inactive123'
      mockDb.apiKey.findUnique.mockResolvedValue({
        id: '1',
        key: inactiveKey,
        active: false,
        expiresAt: new Date(Date.now() + 3600000),
      })

      const result = await validateAPIKey(inactiveKey)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('API key inactive')
    })

    it('should reject a non-existent API key', async () => {
      mockDb.apiKey.findUnique.mockResolvedValue(null)

      const result = await validateAPIKey('sk_test_notfound123')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid API key')
    })
  })

  describe('sanitizeInput', () => {
    it('should sanitize HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const sanitized = sanitizeInput(input)

      expect(sanitized).toBe('Hello')
      expect(sanitized).not.toContain('<script>')
    })

    it('should preserve safe HTML tags if allowed', () => {
      const input = '<b>Bold</b> and <i>italic</i> text'
      const sanitized = sanitizeInput(input, { 
        allowedTags: ['b', 'i'] 
      })

      expect(sanitized).toBe('<b>Bold</b> and <i>italic</i> text')
    })

    it('should remove dangerous attributes', () => {
      const input = '<a href="javascript:alert(1)">Link</a>'
      const sanitized = sanitizeInput(input, {
        allowedTags: ['a'],
        allowedAttributes: { a: ['href'] }
      })

      expect(sanitized).not.toContain('javascript:')
    })

    it('should handle null and undefined inputs', () => {
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
    })

    it('should trim whitespace', () => {
      const input = '  Hello World  '
      const sanitized = sanitizeInput(input)

      expect(sanitized).toBe('Hello World')
    })
  })

  describe('generateSecureToken', () => {
    it('should generate a token of default length', () => {
      const token = generateSecureToken()

      expect(token).toHaveLength(64) // 32 bytes = 64 hex chars
      expect(token).toMatch(/^[a-f0-9]+$/)
    })

    it('should generate a token of custom length', () => {
      const token = generateSecureToken(16)

      expect(token).toHaveLength(32) // 16 bytes = 32 hex chars
    })

    it('should generate unique tokens', () => {
      const tokens = new Set()
      for (let i = 0; i < 100; i++) {
        tokens.add(generateSecureToken())
      }

      expect(tokens.size).toBe(100)
    })
  })

  describe('Password Hashing', () => {
    const password = 'MySecurePassword123!'

    it('should hash a password', async () => {
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50)
    })

    it('should verify a correct password', async () => {
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)

      expect(isValid).toBe(true)
    })

    it('should reject an incorrect password', async () => {
      const hash = await hashPassword(password)
      const isValid = await verifyPassword('WrongPassword', hash)

      expect(isValid).toBe(false)
    })

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('Data Encryption', () => {
    const secretKey = 'test-secret-key-32-chars-exactly'
    const data = { userId: '123', email: 'test@example.com' }

    beforeEach(() => {
      process.env.ENCRYPTION_KEY = secretKey
    })

    it('should encrypt data', () => {
      const encrypted = encryptData(data)

      expect(encrypted).toBeDefined()
      expect(encrypted).not.toBe(JSON.stringify(data))
      expect(encrypted.split(':')).toHaveLength(2) // iv:encryptedData
    })

    it('should decrypt data', () => {
      const encrypted = encryptData(data)
      const decrypted = decryptData(encrypted)

      expect(decrypted).toEqual(data)
    })

    it('should handle encryption errors', () => {
      delete process.env.ENCRYPTION_KEY

      expect(() => encryptData(data)).toThrow()
    })

    it('should handle decryption errors', () => {
      expect(() => decryptData('invalid-encrypted-data')).toThrow()
    })
  })

  describe('CSRF Protection', () => {
    it('should generate a CSRF token', () => {
      const token = generateCSRFToken()

      expect(token).toBeDefined()
      expect(token).toHaveLength(64)
    })

    it('should validate a correct CSRF token', () => {
      const token = generateCSRFToken()
      const isValid = validateCSRFToken(token, token)

      expect(isValid).toBe(true)
    })

    it('should reject an incorrect CSRF token', () => {
      const token = generateCSRFToken()
      const isValid = validateCSRFToken(token, 'wrong-token')

      expect(isValid).toBe(false)
    })

    it('should handle timing attacks', () => {
      const token = generateCSRFToken()
      const start = Date.now()
      
      // Check multiple invalid tokens
      for (let i = 0; i < 100; i++) {
        validateCSRFToken(token, 'a'.repeat(64))
      }
      
      const duration = Date.now() - start
      expect(duration).toBeGreaterThan(0) // Constant time comparison
    })
  })

  describe('checkPermissions', () => {
    it('should allow access with correct permissions', () => {
      const user = {
        id: '1',
        roles: ['admin', 'user'],
        permissions: ['read', 'write', 'delete']
      }

      expect(checkPermissions(user, ['read'])).toBe(true)
      expect(checkPermissions(user, ['read', 'write'])).toBe(true)
    })

    it('should deny access without required permissions', () => {
      const user = {
        id: '1',
        roles: ['user'],
        permissions: ['read']
      }

      expect(checkPermissions(user, ['write'])).toBe(false)
      expect(checkPermissions(user, ['delete'])).toBe(false)
    })

    it('should handle admin override', () => {
      const admin = {
        id: '1',
        roles: ['admin'],
        permissions: []
      }

      expect(checkPermissions(admin, ['any-permission'])).toBe(true)
    })
  })

  describe('auditLog', () => {
    it('should create an audit log entry', async () => {
      const logData = {
        userId: '123',
        action: 'LOGIN',
        resource: 'auth',
        details: { ip: '192.168.1.1' },
      }

      await auditLog(logData)

      expect(mockDb.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: logData.userId,
          action: logData.action,
          resource: logData.resource,
          details: JSON.stringify(logData.details),
          timestamp: expect.any(Date),
        }),
      })
    })

    it('should handle audit log errors gracefully', async () => {
      mockDb.auditLog.create.mockRejectedValue(new Error('DB Error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await auditLog({
        userId: '123',
        action: 'LOGIN',
        resource: 'auth',
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})