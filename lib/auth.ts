import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { NextAuthOptions } from 'next-auth'
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
          console.error('Error updating user:', error)
          return false
        }
      }
      return true
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
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
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