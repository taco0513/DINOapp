/**
 * Debug endpoint to check session and OAuth tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'No session found',
      });
    }

    const sessionData = session as any;
    
    return NextResponse.json({
      authenticated: true,
      user: {
        email: session.user?.email,
        name: session.user?.name,
      },
      tokens: {
        hasAccessToken: !!sessionData.accessToken,
        accessTokenPreview: sessionData.accessToken ? 
          sessionData.accessToken.substring(0, 20) + '...' : null,
        tokenType: sessionData.accessToken ? 
          (sessionData.accessToken.startsWith('ya29.') ? 'Google OAuth' : 'Unknown') : null,
      },
      oauth: {
        scopes: 'Should include gmail.readonly for Gmail access',
        redirectUri: process.env.NEXTAUTH_URL + '/api/auth/callback/google',
        clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
      },
      debug: {
        sessionKeys: Object.keys(session),
        sessionDataKeys: Object.keys(sessionData),
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL,
      }
    });

  } catch (error) {
    console.error('Session debug error:', error);
    return NextResponse.json(
      { 
        error: 'Debug endpoint error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}