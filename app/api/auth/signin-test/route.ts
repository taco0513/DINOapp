import { NextResponse } from 'next/server';
import { signIn } from 'next-auth/react';

export async function GET() {
  // Create a test signin URL
  const signinUrl = '/api/auth/signin/google';

  return NextResponse.json({
    message: 'Test signin endpoint',
    signinUrl,
    instructions: [
      '1. Visit the signinUrl directly',
      '2. Check browser console for any errors',
      '3. Check Vercel logs for NextAuth debug output',
      '4. Report back any error messages',
    ],
    directLink: `https://www.dinoapp.net${signinUrl}`,
  });
}
