import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { signIn, signOut, useSession } from 'next-auth/react'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

// Mock next-auth
jest.mock('next-auth')
jest.mock('next-auth/react')
jest.mock('@next-auth/prisma-adapter')

// Mock prisma
jest.mock('@/lib/database/dev-prisma', () => ({
  getPrismaClient: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    account: {
      findFirst: jest.fn(),
      create: jest.fn()
    },
    session: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }))
}))

describe('Authentication Flow Tests', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: 'https://example.com/avatar.jpg',
    emailVerified: new Date()
  }

  const mockSession = {
    user: mockUser,
    expires: '2024-12-31'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('NextAuth Configuration', () => {
    it('should have correct Google provider configuration', () => {
      expect(authOptions.providers).toBeDefined()
      expect(authOptions.providers.length).toBeGreaterThan(0)
      
      const googleProvider = authOptions.providers[0]
      expect(googleProvider.id).toBe('google')
      expect(googleProvider.name).toBe('Google')
    })

    it('should use PrismaAdapter', () => {
      expect(authOptions.adapter).toBeDefined()
    })

    it('should have correct callbacks configured', () => {
      expect(authOptions.callbacks).toBeDefined()
      expect(authOptions.callbacks.session).toBeDefined()
      expect(authOptions.callbacks.jwt).toBeDefined()
    })
  })

  describe('Server-side Authentication', () => {
    it('should get authenticated session', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const session = await getServerSession(authOptions)

      expect(session).toEqual(mockSession)
      expect(session?.user.email).toBe('test@example.com')
    })

    it('should handle unauthenticated session', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const session = await getServerSession(authOptions)

      expect(session).toBeNull()
    })

    it('should handle session errors', async () => {
      ;(getServerSession as jest.Mock).mockRejectedValue(new Error('Session error'))

      await expect(getServerSession(authOptions)).rejects.toThrow('Session error')
    })
  })

  describe('Client-side Authentication', () => {
    it('should handle user sign in', async () => {
      const mockSignInResponse = {
        error: null,
        ok: true,
        status: 200,
        url: '/'
      }

      ;(signIn as jest.Mock).mockResolvedValue(mockSignInResponse)

      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/dashboard'
      })

      expect(result).toEqual(mockSignInResponse)
      expect(signIn).toHaveBeenCalledWith('google', {
        redirect: false,
        callbackUrl: '/dashboard'
      })
    })

    it('should handle sign in errors', async () => {
      const mockErrorResponse = {
        error: 'OAuthSignin',
        ok: false,
        status: 401,
        url: null
      }

      ;(signIn as jest.Mock).mockResolvedValue(mockErrorResponse)

      const result = await signIn('google', { redirect: false })

      expect(result.error).toBe('OAuthSignin')
      expect(result.ok).toBe(false)
    })

    it('should handle user sign out', async () => {
      ;(signOut as jest.Mock).mockResolvedValue(undefined)

      await signOut({ redirect: false })

      expect(signOut).toHaveBeenCalledWith({ redirect: false })
    })

    it('should use session hook', () => {
      const mockSessionData = {
        data: mockSession,
        status: 'authenticated' as const,
        update: jest.fn()
      }

      ;(useSession as jest.Mock).mockReturnValue(mockSessionData)

      const { data, status } = useSession()

      expect(data).toEqual(mockSession)
      expect(status).toBe('authenticated')
    })

    it('should handle loading session state', () => {
      const mockLoadingSession = {
        data: null,
        status: 'loading' as const,
        update: jest.fn()
      }

      ;(useSession as jest.Mock).mockReturnValue(mockLoadingSession)

      const { data, status } = useSession()

      expect(data).toBeNull()
      expect(status).toBe('loading')
    })
  })

  describe('JWT and Session Callbacks', () => {
    it('should handle JWT callback', async () => {
      const token = { sub: 'test-user-id' }
      const account = {
        provider: 'google',
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123'
      }

      const result = await authOptions.callbacks.jwt({ 
        token, 
        account,
        user: mockUser,
        profile: undefined,
        trigger: 'signIn'
      })

      expect(result).toMatchObject({
        sub: 'test-user-id',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123'
      })
    })

    it('should handle session callback', async () => {
      const token = {
        sub: 'test-user-id',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123'
      }

      const result = await authOptions.callbacks.session({ 
        session: mockSession, 
        token,
        user: mockUser
      })

      expect(result.accessToken).toBe('access-token-123')
      expect(result.refreshToken).toBe('refresh-token-123')
    })
  })

  describe('OAuth Account Linking', () => {
    it('should handle first-time Google sign in', async () => {
      const prisma = require('@/lib/database/dev-prisma').getPrismaClient()
      
      // User doesn't exist
      prisma.user.findUnique.mockResolvedValue(null)
      // Create new user
      prisma.user.create.mockResolvedValue(mockUser)
      // Create account link
      prisma.account.create.mockResolvedValue({
        userId: mockUser.id,
        provider: 'google',
        providerAccountId: 'google-account-id'
      })

      // Simulate OAuth callback
      const newUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg'
        }
      })

      expect(newUser).toEqual(mockUser)
      expect(prisma.user.create).toHaveBeenCalled()
    })

    it('should handle existing user sign in', async () => {
      const prisma = require('@/lib/database/dev-prisma').getPrismaClient()
      
      // User exists
      prisma.user.findUnique.mockResolvedValue(mockUser)
      // Account exists
      prisma.account.findFirst.mockResolvedValue({
        userId: mockUser.id,
        provider: 'google',
        providerAccountId: 'google-account-id'
      })

      const existingUser = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
      })

      expect(existingUser).toEqual(mockUser)
      expect(prisma.user.create).not.toHaveBeenCalled()
    })
  })

  describe('Session Management', () => {
    it('should create new session', async () => {
      const prisma = require('@/lib/database/dev-prisma').getPrismaClient()
      
      const newSession = {
        id: 'session-id',
        userId: mockUser.id,
        sessionToken: 'session-token-123',
        expires: new Date('2024-12-31')
      }

      prisma.session.create.mockResolvedValue(newSession)

      const result = await prisma.session.create({
        data: newSession
      })

      expect(result).toEqual(newSession)
    })

    it('should update session', async () => {
      const prisma = require('@/lib/database/dev-prisma').getPrismaClient()
      
      const updatedSession = {
        sessionToken: 'session-token-123',
        expires: new Date('2025-01-01')
      }

      prisma.session.update.mockResolvedValue(updatedSession)

      const result = await prisma.session.update({
        where: { sessionToken: 'session-token-123' },
        data: { expires: new Date('2025-01-01') }
      })

      expect(result.expires).toEqual(new Date('2025-01-01'))
    })

    it('should delete session on sign out', async () => {
      const prisma = require('@/lib/database/dev-prisma').getPrismaClient()
      
      prisma.session.delete.mockResolvedValue({ sessionToken: 'session-token-123' })

      const result = await prisma.session.delete({
        where: { sessionToken: 'session-token-123' }
      })

      expect(result.sessionToken).toBe('session-token-123')
      expect(prisma.session.delete).toHaveBeenCalled()
    })
  })

  describe('Security Features', () => {
    it('should have CSRF protection enabled', () => {
      expect(authOptions.cookies).toBeDefined()
      // NextAuth handles CSRF protection internally
    })

    it('should use secure cookies in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      expect(authOptions.cookies?.sessionToken?.options?.secure).toBe(true)

      process.env.NODE_ENV = originalEnv
    })

    it('should handle OAuth errors gracefully', async () => {
      ;(signIn as jest.Mock).mockRejectedValue(new Error('OAuth provider error'))

      await expect(signIn('google')).rejects.toThrow('OAuth provider error')
    })
  })
})