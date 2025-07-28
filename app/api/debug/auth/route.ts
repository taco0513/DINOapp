import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';

export async function GET() {
  const session = await getServerSession(authOptions);
  const headersList = headers();
  const cookieStore = cookies();

  // Get all cookies for debugging
  const allCookies = cookieStore.getAll();
  const cookieNames = allCookies.map(c => c.name);

  const debug = {
    session: session ? 'Authenticated' : 'Not authenticated',
    userId: session?.user?.id || 'No user ID',
    email: session?.user?.email || 'No email',
    nextAuthUrl: process.env.NEXTAUTH_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    nodeEnv: process.env.NODE_ENV,
    host: headersList.get('host'),
    origin: headersList.get('origin'),
    referer: headersList.get('referer'),
    userAgent: headersList.get('user-agent'),
    cookies: {
      hasAny: cookieNames.length > 0,
      count: cookieNames.length,
      names: cookieNames,
      sessionToken:
        cookieNames.find(name => name.includes('session-token')) || 'Not found',
      callbackUrl:
        cookieNames.find(name => name.includes('callback-url')) || 'Not found',
      csrfToken:
        cookieNames.find(name => name.includes('csrf-token')) || 'Not found',
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(debug);
}
