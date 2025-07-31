import { NextResponse } from 'next/server';

export async function GET() {
  const _baseUrl = 'https://dinoapp.net';
  const currentDate = new Date().toISOString();

  // Static pages with their priorities and update frequencies
  const staticPages = [
    {
      url: '',
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: '1.0',
    },
    {
      url: '/dashboard',
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: '0.9',
    },
    {
      url: '/trips',
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: '0.9',
    },
    {
      url: '/schengen',
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: '0.8',
    },
    {
      url: '/analytics',
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: '0.7',
    },
    {
      url: '/calendar',
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: '0.7',
    },
    {
      url: '/integrations',
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: '0.6',
    },
    {
      url: '/notifications',
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: '0.6',
    },
    {
      url: '/gmail',
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: '0.6',
    },
    {
      url: '/auth/signin',
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: '0.5',
    },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${staticPages
  .map(
    page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
    <mobile:mobile/>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
    },
  });
}
