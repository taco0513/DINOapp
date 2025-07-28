import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  const session = await getServerSession(authOptions);
  const headersList = headers();

  const debug = {
    session: session ? 'Authenticated' : 'Not authenticated',
    userId: session?.user?.id || 'No user ID',
    email: session?.user?.email || 'No email',
    nextAuthUrl: process.env.NEXTAUTH_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    nodeEnv: process.env.NODE_ENV,
    host: headersList.get('host'),
    referer: headersList.get('referer'),
    userAgent: headersList.get('user-agent'),
    cookie: headersList.get('cookie') ? 'Has cookies' : 'No cookies',
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(debug);
}
