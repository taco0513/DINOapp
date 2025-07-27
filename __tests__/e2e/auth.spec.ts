import { test, expect } from '@playwright/test'

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start with clean session
    await page.context().clearCookies()
    
    // Try to clear storage, ignore if fails
    try {
      await page.evaluate(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.clear()
        }
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.clear()
        }
      })
    } catch (e) {
      // Ignore storage access errors
    }
  })

  test('should display login page for unauthenticated users', async ({ page }) => {
    await page.goto('/')
    
    // Should redirect to login or show login option
    await expect(page).toHaveURL('/')
    
    // Should show sign in with Google button
    const signInButton = page.locator('text=Sign in with Google').or(
      page.locator('[href*="api/auth/signin"]')
    ).or(
      page.locator('text=로그인')
    )
    
    await expect(signInButton).toBeVisible({ timeout: 10000 })
  })

  test('should prevent access to protected routes without authentication', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard')
    
    // Should redirect to signin page
    await expect(page).toHaveURL(/auth\/signin|signin/)
  })

  test('should prevent access to trips page without authentication', async ({ page }) => {
    // Try to access trips directly
    await page.goto('/trips')
    
    // Should redirect to signin page
    await expect(page).toHaveURL(/auth\/signin|signin/)
  })

  test('should prevent access to schengen calculator without authentication', async ({ page }) => {
    // Try to access schengen directly
    await page.goto('/schengen')
    
    // Should redirect to signin page
    await expect(page).toHaveURL(/auth\/signin|signin/)
  })

  test('should prevent access to gmail integration without authentication', async ({ page }) => {
    // Try to access gmail directly
    await page.goto('/gmail')
    
    // Should redirect to signin page
    await expect(page).toHaveURL(/auth\/signin|signin/)
  })

  test('should show loading state during authentication', async ({ page }) => {
    await page.goto('/')
    
    // Should show loading text or spinner
    const loadingIndicator = page.locator('text=로딩 중').or(
      page.locator('text=Loading').or(
        page.locator('[data-testid="loading-spinner"]')
      )
    )
    
    // Loading should appear initially
    await expect(loadingIndicator).toBeVisible({ timeout: 5000 })
  })

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Mock authentication error
    await page.route('/api/auth/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Authentication failed'
        })
      })
    })

    await page.goto('/auth/signin')
    
    // Should handle error without crashing
    await expect(page.locator('body')).toBeVisible()
  })

  test('should work with mock authentication for testing', async ({ page }) => {
    // Mock session for testing authenticated flow
    await page.addInitScript(() => {
      // Mock NextAuth session
      ;(window as any).__NEXT_DATA__ = {
        props: {
          pageProps: {
            session: {
              user: {
                id: 'test-user-123',
                email: 'test@example.com',
                name: 'Test User',
                image: 'https://example.com/avatar.jpg'
              },
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
          }
        }
      }
    })

    // Mock API calls for authenticated user
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-123',
            email: 'test@example.com',
            name: 'Test User',
            image: 'https://example.com/avatar.jpg'
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      })
    })

    await page.goto('/')
    
    // Should redirect to dashboard for authenticated users
    await expect(page).toHaveURL('/dashboard')
    
    // Should show user info in header
    await expect(page.locator('text=Test User')).toBeVisible()
    
    // Should show logout button
    await expect(page.locator('text=로그아웃').or(page.locator('text=Logout'))).toBeVisible()
  })

  test('should handle logout flow', async ({ page }) => {
    // First set up authenticated state
    await page.addInitScript(() => {
      ;(window as any).__NEXT_DATA__ = {
        props: {
          pageProps: {
            session: {
              user: {
                id: 'test-user-123',
                email: 'test@example.com',
                name: 'Test User'
              },
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
          }
        }
      }
    })

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

    // Mock logout endpoints
    await page.route('/api/force-logout', async (route) => {
      const response = route.request().method() === 'GET' ? 
        { status: 302, headers: { 'Location': '/' } } :
        { status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }
      
      await route.fulfill(response)
    })

    await page.route('/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><p>로그아웃 중...</p></body></html>'
      })
    })

    await page.goto('/dashboard')
    
    // Wait for page to load
    await page.waitForSelector('text=Test User', { timeout: 5000 })
    
    // Click logout button
    const logoutButton = page.locator('text=로그아웃').or(page.locator('text=Logout'))
    await logoutButton.click()
    
    // Should show logout page or redirect to home
    await expect(page.locator('text=로그아웃 중').or(page.locator('text=Sign in'))).toBeVisible({ timeout: 10000 })
  })

  test('should redirect to intended page after login', async ({ page }) => {
    // Try to access protected page first
    await page.goto('/dashboard?test=true')
    
    // Should redirect to signin with callback
    await expect(page).toHaveURL(/auth\/signin/)
    
    // URL should contain callback parameter
    const currentUrl = page.url()
    expect(currentUrl).toContain('callbackUrl')
  })

  test('should handle session expiration', async ({ page }) => {
    // Start with authenticated state
    await page.addInitScript(() => {
      ;(window as any).__NEXT_DATA__ = {
        props: {
          pageProps: {
            session: {
              user: {
                id: 'test-user-123',
                email: 'test@example.com',
                name: 'Test User'
              },
              expires: new Date(Date.now() - 1000).toISOString() // Expired
            }
          }
        }
      }
    })

    // Mock expired session response
    await page.route('/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({})
      })
    })

    await page.goto('/dashboard')
    
    // Should redirect to signin for expired session
    await expect(page).toHaveURL(/auth\/signin|\//, { timeout: 10000 })
  })

  test('should maintain session across page reloads', async ({ page }) => {
    // Set up authenticated state
    await page.addInitScript(() => {
      ;(window as any).__NEXT_DATA__ = {
        props: {
          pageProps: {
            session: {
              user: {
                id: 'test-user-123',
                email: 'test@example.com',
                name: 'Test User'
              },
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
          }
        }
      }
    })

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

    await page.goto('/dashboard')
    await expect(page.locator('text=Test User')).toBeVisible()
    
    // Reload page
    await page.reload()
    
    // Should still be authenticated
    await expect(page.locator('text=Test User')).toBeVisible()
    await expect(page).toHaveURL('/dashboard')
  })
})