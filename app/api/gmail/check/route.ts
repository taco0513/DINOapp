import { NextRequest, NextResponse } from 'next/server'
import { withGmailAuth, getRateLimitStatus } from '@/lib/gmail-middleware'
import { checkGmailConnection } from '@/lib/gmail'

export async function GET(request: NextRequest) {
  return withGmailAuth(request, async (session) => {
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