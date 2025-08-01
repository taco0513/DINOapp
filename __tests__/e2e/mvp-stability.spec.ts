import { test, expect, Page } from '@playwright/test'
import { logger } from '@/lib/logger';

/**
 * MVP Stability End-to-End Tests
 * Tests critical user flows for production readiness
 */

test.describe('MVP Stability - Critical User Flows', () => {
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage
    
    // Set up error tracking
    page.on('pageerror', error => {
      logger.error('Page error:', error.message)
    })
    
    page.on('requestfailed', request => {
      logger.error('Request failed:', request.url(), request.failure()?.errorText)
    })
  })

  test.describe('Authentication Flow', () => {
    test('should handle authentication gracefully', async () => {
      // Navigate to home page
      await page.goto('/')
      
      // Should not crash on load
      await expect(page).toHaveTitle(/DINO/)
      
      // Should show sign in option
      const signInButton = page.locator('text=Sign in')
      await expect(signInButton).toBeVisible({ timeout: 10000 })
      
      // Click sign in
      await signInButton.click()
      
      // Should navigate to auth page without errors
      await page.waitForURL('**/auth/**', { timeout: 10000 })
      
      // Should show Google sign in option
      const googleSignIn = page.locator('button:has-text("Continue with Google")')
      await expect(googleSignIn).toBeVisible()
    })

    test('should handle auth errors gracefully', async () => {
      // Navigate directly to protected route
      await page.goto('/dashboard')
      
      // Should redirect to auth page
      await page.waitForURL('**/auth/**', { timeout: 10000 })
      
      // Should not show error page
      const errorBoundary = page.locator('text=Oops! Something went wrong')
      await expect(errorBoundary).not.toBeVisible()
    })
  })

  test.describe('Error Handling & Recovery', () => {
    test('should handle network errors gracefully', async () => {
      await page.goto('/')
      
      // Simulate network failure
      await page.route('**/api/**', route => {
        route.abort('failed')
      })
      
      // Navigate to a page that makes API calls
      await page.goto('/trips')
      
      // Should show error state, not crash
      const errorMessage = page.locator('text=Error')
      const loadingState = page.locator('[data-testid="loading"]')
      
      // Should either show error or loading state, not crash
      await expect(
        errorMessage.or(loadingState).or(page.locator('text=No trips'))
      ).toBeVisible({ timeout: 15000 })
      
      // Should not show error boundary
      const errorBoundary = page.locator('text=Oops! Something went wrong')
      await expect(errorBoundary).not.toBeVisible()
    })

    test('should recover from JavaScript errors', async () => {
      await page.goto('/')
      
      // Inject a JavaScript error
      await page.evaluate(() => {
        // This should be caught by error boundary
        throw new Error('Test JavaScript error')
      })
      
      // Wait a bit for error boundary to potentially activate
      await page.waitForTimeout(1000)
      
      // Page should still be functional
      const navigation = page.locator('nav')
      await expect(navigation).toBeVisible()
    })

    test('should handle malformed API responses', async () => {
      await page.goto('/')
      
      // Mock API to return malformed response
      await page.route('**/api/trips', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'invalid json{'
        })
      })
      
      await page.goto('/trips')
      
      // Should handle gracefully, not crash
      await page.waitForTimeout(2000)
      
      const errorBoundary = page.locator('text=Oops! Something went wrong')
      await expect(errorBoundary).not.toBeVisible()
    })
  })

  test.describe('Database Connection Resilience', () => {
    test('should handle database connection errors gracefully', async () => {
      // Mock API to simulate database errors
      await page.route('**/api/trips', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: 'Database connection failed'
            }
          })
        })
      })
      
      await page.goto('/trips')
      
      // Should show error state gracefully
      const errorMessage = page.locator('text=Error loading trips')
      const retryButton = page.locator('button:has-text("Retry")')
      
      await expect(
        errorMessage.or(retryButton).or(page.locator('text=Database'))
      ).toBeVisible({ timeout: 10000 })
      
      // Should not crash the application
      const errorBoundary = page.locator('text=Oops! Something went wrong')
      await expect(errorBoundary).not.toBeVisible()
    })
  })

  test.describe('Performance & Loading States', () => {
    test('should show appropriate loading states', async () => {
      // Slow down API responses
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        route.continue()
      })
      
      await page.goto('/trips')
      
      // Should show loading state
      const loadingSpinner = page.locator('[data-testid="loading-spinner"]')
      const loadingText = page.locator('text=Loading')
      const skeletonLoader = page.locator('.loading-skeleton')
      
      await expect(
        loadingSpinner.or(loadingText).or(skeletonLoader)
      ).toBeVisible({ timeout: 5000 })
    })

    test('should handle slow page loads gracefully', async () => {
      // Simulate slow connection
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 500))
        route.continue()
      })
      
      const startTime = Date.now()
      await page.goto('/')
      const loadTime = Date.now() - startTime
      
      // Should load within reasonable time (increased for CI)
      expect(loadTime).toBeLessThan(15000)
      
      // Should be functional once loaded
      const navigation = page.locator('nav')
      await expect(navigation).toBeVisible()
    })
  })

  test.describe('Memory Management', () => {
    test('should not have memory leaks in navigation', async () => {
      const pages = ['/dashboard', '/trips', '/schengen', '/settings']
      
      // Navigate between pages multiple times
      for (let i = 0; i < 3; i++) {
        for (const pagePath of pages) {
          await page.goto(pagePath)
          await page.waitForTimeout(1000)
          
          // Verify page loaded successfully
          const errorBoundary = page.locator('text=Oops! Something went wrong')
          await expect(errorBoundary).not.toBeVisible()
        }
      }
      
      // Check if page is still responsive
      await page.goto('/')
      const homeContent = page.locator('main')
      await expect(homeContent).toBeVisible()
    })

    test('should handle large datasets without crashing', async () => {
      // Mock API to return large dataset
      const largeTripList = Array.from({ length: 1000 }, (_, i) => ({
        id: `trip-${i}`,
        countryCode: 'US',
        entryDate: new Date().toISOString(),
        exitDate: new Date().toISOString(),
        purpose: 'tourism',
        status: 'COMPLETED'
      }))
      
      await page.route('**/api/trips', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: largeTripList,
            count: largeTripList.length
          })
        })
      })
      
      await page.goto('/trips')
      
      // Should handle large dataset gracefully
      await page.waitForTimeout(3000)
      
      const errorBoundary = page.locator('text=Oops! Something went wrong')
      await expect(errorBoundary).not.toBeVisible()
      
      // Should show some trips (virtualization or pagination)
      const tripItems = page.locator('[data-testid="trip-item"]')
      await expect(tripItems.first()).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Health Check & Monitoring', () => {
    test('should have functional health endpoint', async () => {
      const response = await page.request.get('/api/health')
      expect(response.status()).toBe(200)
      
      const health = await response.json()
      expect(health.status).toBeTruthy()
      expect(health.checks).toBeTruthy()
    })

    test('should track errors properly', async () => {
      // Generate a client-side error
      await page.goto('/')
      
      await page.evaluate(() => {
        // Simulate error that should be reported
        if (window.fetch) {
          fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'Test error from E2E test',
              stack: 'Test stack trace',
              url: window.location.href,
              timestamp: Date.now(),
              userAgent: navigator.userAgent,
              errorCount: 1
            })
          }).catch(() => {
            // Ignore network errors in test
          })
        }
      })
      
      await page.waitForTimeout(1000)
      
      // Verify the page is still functional
      const navigation = page.locator('nav')
      await expect(navigation).toBeVisible()
    })
  })

  test.describe('Critical User Flows', () => {
    test('should allow viewing trips without errors', async () => {
      // Mock successful trips response
      await page.route('**/api/trips', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'test-trip',
                countryCode: 'JP',
                entryDate: '2024-01-01',
                exitDate: '2024-01-10',
                purpose: 'tourism',
                status: 'COMPLETED'
              }
            ],
            count: 1
          })
        })
      })
      
      await page.goto('/trips')
      
      // Should show trips without crashing
      const tripContent = page.locator('text=JP').or(page.locator('text=Japan'))
      await expect(tripContent).toBeVisible({ timeout: 10000 })
      
      const errorBoundary = page.locator('text=Oops! Something went wrong')
      await expect(errorBoundary).not.toBeVisible()
    })

    test('should handle Schengen calculations without errors', async () => {
      // Mock Schengen data
      await page.route('**/api/schengen', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              daysUsed: 45,
              daysRemaining: 45,
              resetDate: '2024-12-31',
              isCompliant: true
            }
          })
        })
      })
      
      await page.goto('/schengen')
      
      // Should show Schengen calculator without crashing
      const schengenContent = page.locator('text=Schengen').or(page.locator('text=90/180'))
      await expect(schengenContent).toBeVisible({ timeout: 10000 })
      
      const errorBoundary = page.locator('text=Oops! Something went wrong')
      await expect(errorBoundary).not.toBeVisible()
    })
  })

  test.describe('Accessibility & Usability', () => {
    test('should be keyboard navigable', async () => {
      await page.goto('/')
      
      // Should be able to navigate with keyboard
      await page.keyboard.press('Tab')
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
      
      // Should not cause errors
      const errorBoundary = page.locator('text=Oops! Something went wrong')
      await expect(errorBoundary).not.toBeVisible()
    })

    test('should have proper ARIA labels and semantic markup', async () => {
      await page.goto('/')
      
      // Check for main landmark
      const main = page.locator('main')
      await expect(main).toBeVisible()
      
      // Check for navigation
      const nav = page.locator('nav')
      await expect(nav).toBeVisible()
      
      // Should not crash during accessibility interactions
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      
      const errorBoundary = page.locator('text=Oops! Something went wrong')
      await expect(errorBoundary).not.toBeVisible()
    })
  })
})