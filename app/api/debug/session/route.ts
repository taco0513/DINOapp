import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get current session
    const session = await getServerSession(authOptions);

    // Get all users from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Get all accounts
    const accounts = await prisma.account.findMany({
      select: {
        id: true,
        userId: true,
        provider: true,
        type: true,
      },
    });

    // Get all sessions from database
    const sessions = await prisma.session.findMany({
      select: {
        id: true,
        userId: true,
        expires: true,
        sessionToken: true,
      },
    });

    return NextResponse.json({
      currentSession: session,
      database: {
        users,
        accounts,
        sessions,
        userCount: users.length,
        accountCount: accounts.length,
        sessionCount: sessions.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Session debug error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
