import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest } from 'next/server'

const handler = NextAuth(authOptions)

// Custom handler wrapper to handle logout properly
async function customHandler(req: NextRequest, context: any) {
  // Check if this is a signout request
  const url = new URL(req.url)
  if (url.pathname.endsWith('/signout') && req.method === 'POST') {
    // Clear cookies before NextAuth handles signout
    const response = await handler(req, context)
    
    // Add additional cookie clearing headers
    if (response) {
      response.headers.append('Set-Cookie', 'next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax')
      response.headers.append('Set-Cookie', '__Secure-next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax')
    }
    
    return response
  }
  
  return handler(req, context)
}

export { customHandler as GET, customHandler as POST }