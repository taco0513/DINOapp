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
        email: user?.email
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
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
}