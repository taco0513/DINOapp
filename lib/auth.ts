import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

// Ultra-simplified NextAuth configuration to eliminate login loops
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Simple validation - always allow Google sign in
      return account?.provider === 'google'
    },
    
    async jwt({ token, user }) {
      // Store user ID on first sign in
      if (user) {
        token.id = user.id
      }
      return token
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}