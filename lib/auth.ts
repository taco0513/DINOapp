import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'

// NextAuth URL 설정을 간단하게 처리

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
    async session({ session, user }) {
      // With database sessions, user data comes from database
      if (session.user && user) {
        session.user.id = user.id
        // @ts-ignore - custom property for Google access
        session.user.googleId = user.googleId
      }
      return session
    },
    async signIn({ user, account }) {
      console.log('[NextAuth] SignIn attempt:', { 
        provider: account?.provider,
        email: user?.email
      })
      
      // Let PrismaAdapter handle user creation/updates
      // Just verify the sign-in is valid
      if (account?.provider === 'google' && user?.email) {
        console.log('[NextAuth] Google sign-in successful for:', user.email)
        return true
      }
      
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('[NextAuth] Redirect:', { url, baseUrl })
      
      // 상대 경로인 경우
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // 이미 절대 경로이고 같은 호스트인 경우
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // 기본값: 대시보드
      return `${baseUrl}/dashboard`
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
}