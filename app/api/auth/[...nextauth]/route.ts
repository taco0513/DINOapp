/**
 * DINO v2.0 - NextAuth.js Route Handler
 * API routes for authentication
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-simple';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };