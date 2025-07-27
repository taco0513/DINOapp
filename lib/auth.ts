import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

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
  
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 day only
    updateAge: 60 * 60, // Update every hour
  },
  
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: undefined
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
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow Google sign in only
      if (account?.provider === 'google') {
        // Google sign in successful
        return true
      }
      return false
    },
    
    async redirect({ url, baseUrl }) {
      // Handle signout redirect
      if (url.includes('/api/auth/signout')) {
        return '/'
      }
      
      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Always redirect to dashboard after sign in
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // Redirect to dashboard by default
      return `${baseUrl}/dashboard`
    },
    
    async jwt({ token, user, account, trigger }) {
      // Store user info and access token on first sign in
      if (user && account) {
        token.id = user.id
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.provider = account.provider
        token.iat = Math.floor(Date.now() / 1000) // Issue time
        token.exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
        // JWT token created
      }
      
      // Check token expiration
      if (token.exp && Date.now() >= token.exp * 1000) {
        // Token expired
        return {}
      }
      
      // Add security metadata
      token.jti = crypto.randomUUID() // JWT ID for tracking
      
      return token
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (token.id) {
        session.user.id = token.id as string
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  
  // Add explicit redirect URLs
  trustHost: true,
  
  // Use secure cookies in production
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Events for debugging
  events: {
    async signOut(message) {
      // Log signout event
      console.log('User signed out:', message)
    }
  }
}