import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Dynamic URL handling for multiple Vercel deployments
const getBaseUrl = () => {
  // In production, always use VERCEL_URL if NEXTAUTH_URL is not set
  if (process.env.VERCEL) {
    return process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}`
  }
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

// Vercel 배포 URL 사용
if (process.env.VERCEL && !process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        token.id = user.id
        token.googleId = account.providerAccountId
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        // @ts-ignore - custom properties
        session.user.googleId = token.googleId
        // @ts-ignore - custom property
        session.accessToken = token.accessToken
      }
      return session
    },
    async signIn({ user, account }) {
      console.log('[NextAuth] SignIn attempt:', { 
        provider: account?.provider,
        email: user?.email,
        baseUrl: getBaseUrl()
      })
      
      if (account?.provider === 'google') {
        try {
          // Update user with Google ID if not exists
          if (user.email) {
            await prisma.user.upsert({
              where: { email: user.email },
              update: {
                googleId: account.providerAccountId,
                name: user.name,
                image: user.image,
              },
              create: {
                email: user.email,
                name: user.name,
                image: user.image,
                googleId: account.providerAccountId,
              }
            })
          }
          return true
        } catch (error) {
          console.error('[NextAuth] Error updating user:', error)
          return false
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('[NextAuth] Redirect:', { url, baseUrl, configuredUrl: getBaseUrl() })
      // Always use the dynamic base URL
      const dynamicBaseUrl = getBaseUrl()
      
      // If the URL is relative, make it absolute
      if (url.startsWith('/')) {
        return `${dynamicBaseUrl}${url}`
      }
      
      // If the URL is already absolute and matches our domain, use it
      if (url.startsWith(dynamicBaseUrl)) {
        return url
      }
      
      // Default to dashboard
      return `${dynamicBaseUrl}/dashboard`
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: undefined // Let NextAuth handle domain automatically
      }
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  // Fix for Vercel deployment
  useSecureCookies: process.env.NODE_ENV === 'production',
  trustHost: true
}