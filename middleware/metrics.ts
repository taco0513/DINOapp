/**
 * Metrics Middleware
 * Collects HTTP request/response metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { httpMetrics } from '@/lib/monitoring/metrics-collector'

export async function metricsMiddleware(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const { pathname /* , searchParams */ } = request.nextUrl
  const method = request.method
  
  // Start timing
  const endTimer = httpMetrics.requestStart(method, pathname)
  
  // Clone response to read status
  const clonedResponse = response.clone()
  
  try {
    // Record response metrics
    httpMetrics.requestEnd(method, pathname, clonedResponse.status)
    
    // End timing
    endTimer()
    
    // Add metrics headers
    response.headers.set('X-Response-Time', Date.now().toString())
    
    return response
  } catch (error) {
    // Record error
    httpMetrics.requestError(
      method, 
      pathname, 
      error instanceof Error ? error.message : 'Unknown error'
    )
    
    // End timing even on error
    endTimer()
    
    throw error
  }
}