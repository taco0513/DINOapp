import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      googleId?: string
      timezone?: string
    }
    accessToken?: string
    error?: string
  }

  interface User {
    googleId?: string
    timezone?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    googleId?: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
    userId?: string
    email?: string
    name?: string
    picture?: string
    error?: string
  }
}