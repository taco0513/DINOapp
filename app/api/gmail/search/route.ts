import { NextRequest, NextResponse } from 'next/server'
import { withGmailAuth, sanitizeGmailResponse } from '@/lib/gmail-middleware'
import { searchTravelEmails } from '@/lib/gmail'

export async function GET(request: NextRequest) {
  return withGmailAuth(request, async (session, request) => {
    const { searchParams } = new URL(request.url)
    const maxResults = parseInt(searchParams.get('maxResults') || '20', 10)
    
    // maxResults 제한 (보안상 최대 100개로 제한)
    const limitedMaxResults = Math.min(Math.max(maxResults, 1), 100)
    
    const emails = await searchTravelEmails(
      session.accessToken as string, 
      limitedMaxResults
    )
    
    // 개인정보 보호를 위한 데이터 정리
    const sanitizedEmails = emails.map(email => sanitizeGmailResponse({
      id: email.id,
      subject: email.subject,
      from: email.from,
      date: email.date,
      snippet: email.snippet
      // 보안상 본문 내용은 별도 API로 분리
    }))
    
    return NextResponse.json({
      success: true,
      count: sanitizedEmails.length,
      emails: sanitizedEmails
    })
  })
}