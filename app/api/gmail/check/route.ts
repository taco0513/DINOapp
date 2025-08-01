import { NextRequest, NextResponse } from 'next/server'
import { withGmailAuth, getRateLimitStatus } from '@/lib/gmail-middleware'
import { checkGmailConnection } from '@/lib/gmail'

// TODO: Remove unused logger import

export async function GET(request: NextRequest) {
  return withGmailAuth(request, async (session) => {
    // Debug: Check if accessToken exists
    if (!session.accessToken) {
      console.error('No access token in session:', session)
      return NextResponse.json({
        connected: false,
        message: 'Gmail 연결에 실패했습니다. 다시 로그인해주세요.',
        error: 'No access token',
        rateLimitStatus: getRateLimitStatus(session.user?.id || '')
      })
    }
    
    const isConnected = await checkGmailConnection(session.accessToken as string)
    const rateLimitStatus = getRateLimitStatus(session.user?.id || '')
    
    return NextResponse.json({
      connected: isConnected,
      message: isConnected 
        ? 'Gmail 연결이 정상입니다.' 
        : 'Gmail 연결에 실패했습니다.',
      rateLimitStatus
    })
  })
}