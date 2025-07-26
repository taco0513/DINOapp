import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

// Simplified NextAuth configuration without adapter for testing

export const authOptions: NextAuthOptions = {
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
      // Keep it simple
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Keep it simple
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
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