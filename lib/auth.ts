// TODO: Remove unused logger import

// PURPOSE: NextAuth.js 인증 설정 - Google OAuth 2.0 전용
// ARCHITECTURE: 인증 레이어 - 모든 보호된 라우트의 게이트웨이
// RELATED: app/api/auth/[...nextauth]/route.ts, lib/prisma.ts, middleware.ts
// GOTCHAS: Gmail/Calendar 권한은 사용자 동의 필요, refresh token 관리 중요

import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      // Add profile callback to ensure data is saved
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 day only
    updateAge: 60 * 60, // Update every hour
  },

  callbacks: {
    async signIn({ user, account }) {
      // Allow Google sign in only
      if (account?.provider === 'google') {
        console.debug('Google sign in successful for:', user.email);
        return true;
      }
      return false;
    },

    async redirect({ url, baseUrl }) {
      // Handle signout redirect
      if (url.includes('/api/auth/signout')) {
        return '/';
      }

      // Avoid redirect loops - if already on signin page, don't redirect
      if (url.includes('/auth/signin')) {
        return baseUrl;
      }

      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // Allow same-origin URLs
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Redirect to dashboard by default after login
      return `${baseUrl}/dashboard`;
    },

    async jwt({ token, user, account }) {
      // Store user info and access token on first sign in
      if (user && account) {
        token.id = user.id;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.iat = Math.floor(Date.now() / 1000); // Issue time
        token.exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
        // JWT token created
      }

      // Check token expiration
      if (token.exp && Date.now() >= (token.exp as number) * 1000) {
        // Token expired
        return {};
      }

      // Add security metadata
      token.jti = crypto.randomUUID(); // JWT ID for tracking

      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token.id) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',

  // Add cookies configuration with environment-based security
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.callback-url` : `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? `__Host-next-auth.csrf-token` : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Events for debugging
  events: {
    async signOut(message) {
      // Log signout event
      console.debug('User signed out:', message);
    },
  },
};
