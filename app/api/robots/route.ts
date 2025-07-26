import { NextResponse } from 'next/server'

export async function GET() {
  const robots = `User-agent: *
Allow: /
Allow: /dashboard
Allow: /trips
Allow: /schengen
Allow: /analytics
Allow: /calendar
Allow: /auth/signin

# Disallow sensitive areas
Disallow: /api/
Disallow: /auth/error
Disallow: /debug
Disallow: /test-auth
Disallow: /_next/

# Sitemap location
Sitemap: https://dinoapp.net/sitemap.xml

# Additional rules for SEO
Crawl-delay: 1

# Block common bot patterns that might overload
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

User-agent: MJ12bot
Disallow: /`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400' // 24 hours
    }
  })
}