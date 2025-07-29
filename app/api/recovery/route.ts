import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { recoveryManager, RecoveryScenario } from '@/lib/backup/recovery-manager'
import { asyncHandler } from '@/lib/error/error-handler'
import { httpMetrics } from '@/lib/monitoring/metrics-collector'

// POST /api/recovery/test - Test recovery plan (admin only)
export const POST = asyncHandler(async (request: NextRequest) => {
  const endTimer = httpMetrics.requestStart('POST', '/api/recovery')
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
      httpMetrics.requestEnd('POST', '/api/recovery', 403)
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, scenario } = body

    if (action === 'test') {
      // Test recovery plan without executing
      const isValid = await recoveryManager.testRecoveryPlan(scenario as RecoveryScenario)
      
      httpMetrics.requestEnd('POST', '/api/recovery', 200)
      endTimer()
      
      return NextResponse.json({
        scenario,
        valid: isValid,
        message: isValid 
          ? 'Recovery plan is valid and ready to execute' 
          : 'Recovery plan validation failed'
      })
    }
    
    if (action === 'execute') {
      // Execute recovery (requires additional confirmation)
      const { confirmationCode } = body
      
      // Verify confirmation code
      const expectedCode = `RECOVER-${scenario.toUpperCase()}-${new Date().toISOString().split('T')[0]}`
      if (confirmationCode !== expectedCode) {
        httpMetrics.requestEnd('POST', '/api/recovery', 400)
        return NextResponse.json(
          { 
            error: 'Invalid confirmation code',
            hint: 'Use format: RECOVER-SCENARIO-YYYY-MM-DD'
          },
          { status: 400 }
        )
      }
      
      // Execute recovery
      const result = await recoveryManager.executeRecovery(scenario as RecoveryScenario)
      
      httpMetrics.requestEnd('POST', '/api/recovery', 200)
      endTimer()
      
      return NextResponse.json(result)
    }
    
    httpMetrics.requestEnd('POST', '/api/recovery', 400)
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    httpMetrics.requestEnd('POST', '/api/recovery', 500)
    endTimer()
    throw error
  }
})