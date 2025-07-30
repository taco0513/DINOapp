import { NextResponse } from 'next/server'

export async function GET() {
  // In production, this should come from environment variables
  // For now, we'll use a dummy key for development
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BKd0G7uMlWZQNUg7ctaS5oZGjmTeli5mXRgUua1zOk6BgmzhJJWc8UMH0aNYH5SJxLsUkHhVH7u8jNqdqHe7mHc'
  
  return NextResponse.json({ publicKey })
}