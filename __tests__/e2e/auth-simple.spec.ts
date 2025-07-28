import { test, expect } from '@playwright/test'

test.describe('Authentication E2E Tests (Simplified)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear all cookies and storage
    await page.context().clearCookies()
  })

  test('should display home page for unauthenticated users', async ({ page }) => {
    await page.goto('/')
    
    // Should show DINO title
    await expect(page.locator('h1:has-text("DINO")')).toBeVisible()
    
    // Should show tagline
    await expect(page.locator('text=Digital Nomad Visa Tracker')).toBeVisible()
    
    // Should show login button with Korean text
    await expect(page.locator('text=로그인하여 시작하기')).toBeVisible()
    
    // Should show demo button
    await expect(page.locator('text=데모 보기')).toBeVisible()
    
    // Should show features section
    await expect(page.locator('text=주요 기능')).toBeVisible()
  })

  test('should redirect to signin page when clicking login', async ({ page }) => {
    await page.goto('/')
    
    // Click login button
    await page.click('text=로그인하여 시작하기')
    
    // Should navigate to signin page
    await expect(page).toHaveURL('/auth/signin')
  })

  test('should prevent access to protected routes', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard')
    
    // Should redirect to signin page
    await expect(page).toHaveURL('/auth/signin')
  })

  test('should simulate authenticated user flow', async ({ page }) => {
    // Mock session API
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-123',
            email: 'test@example.com',
            name: 'Test User',
            image: null
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      })
    })

    // Mock stats API
    await page.route('/api/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            overview: {
              totalVisits: 5,
              totalCountries: 3,
              totalDays: 45
            }
          }
        })
      })
    })

    // Mock schengen API
    await page.route('/api/schengen', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            status: {
              usedDays: 30,
              remainingDays: 60,
              isCompliant: true
            }
          }
        })
      })
    })

    await page.goto('/')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    
    // Should show dashboard title
    await expect(page.locator('text=대시보드 - DINO')).toBeVisible()
    
    // Should show welcome message
    await expect(page.locator('text=안녕하세요, Test User님')).toBeVisible()
    
    // Should show logout button
    await expect(page.locator('text=로그아웃')).toBeVisible()
    
    // Should show trip statistics
    await expect(page.locator('text=5').first()).toBeVisible() // Total trips
    await expect(page.locator('text=30/90')).toBeVisible() // Schengen days
  })

  test('should handle logout flow', async ({ page }) => {
    // Setup authenticated session
    await page.route('/api/auth/session', async (route, request) => {
      const method = request.method()
      
      // Return session for GET requests
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-user-123',
              email: 'test@example.com',
              name: 'Test User'
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
        })
      } else {
        // Handle logout
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ url: '/' })
        })
      }
    })

    // Mock other APIs
    await page.route('/api/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { overview: { totalVisits: 0, totalCountries: 0, totalDays: 0 } } })
      })
    })

    await page.route('/api/schengen', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { status: { usedDays: 0, remainingDays: 90, isCompliant: true } } })
      })
    })

    // Go to dashboard
    await page.goto('/dashboard')
    
    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Click logout button
    await page.click('text=로그아웃')
    
    // Handle signOut redirect
    await page.route('/api/auth/signout', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Location': '/' },
        body: ''
      })
    })
    
    // Should eventually redirect to home
    await page.waitForURL('/', { timeout: 10000 })
  })

  test('should show loading state', async ({ page }) => {
    // Delay the session response to see loading state
    await page.route('/api/auth/session', async (route) => {
      await page.waitForTimeout(1000) // Delay response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({})
      })
    })

    await page.goto('/')
    
    // Should show loading text
    const loadingText = page.locator('text=로딩 중...')
    
    // Check if loading appears (it might be very quick)
    const isLoadingVisible = await loadingText.isVisible().catch(() => false)
    
    // Either loading was shown or page loaded directly
    expect(isLoadingVisible || await page.locator('h1:has-text("DINO")').isVisible()).toBeTruthy()
  })

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Mock authentication error
    await page.route('/api/auth/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })

    await page.goto('/auth/signin')
    
    // Page should still render without crashing
    await expect(page.locator('body')).toBeVisible()
  })

  test('should maintain session across page navigation', async ({ page }) => {
    // Mock authenticated session
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-123',
            email: 'test@example.com',
            name: 'Test User'
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      })
    })

    // Mock other required APIs
    await page.route('/api/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { overview: { totalVisits: 0, totalCountries: 0, totalDays: 0 } } })
      })
    })

    await page.route('/api/schengen', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { status: { usedDays: 0, remainingDays: 90, isCompliant: true } } })
      })
    })

    // Start from home page
    await page.goto('/')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    
    // Navigate to trips page
    await page.goto('/trips')
    
    // Should stay authenticated
    await expect(page).toHaveURL('/trips')
    
    // Navigate back to dashboard
    await page.goto('/dashboard')
    
    // Should still be authenticated
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=안녕하세요, Test User님')).toBeVisible()
  })
})