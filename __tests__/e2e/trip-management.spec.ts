import { test, expect } from '@playwright/test'

// Mock user session for E2E tests
test.beforeEach(async ({ page }) => {
  // Mock authentication
  await page.addInitScript(() => {
    window.localStorage.setItem('mockAuth', JSON.stringify({
      user: {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        image: null
      }
    }))
  })

  // Mock API responses
  await page.route('/api/trips', async (route) => {
    const method = route.request().method()
    const url = route.request().url()
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          trips: [
            {
              id: '1',
              userId: 'test-user',
              country: 'France',
              entryDate: '2024-01-01',
              exitDate: '2024-01-15',
              visaType: 'Tourist',
              maxDays: 90,
              notes: 'Test trip to France',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            }
          ]
        })
      })
    } else if (method === 'POST') {
      const body = await route.request().postDataJSON()
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          trip: {
            id: '2',
            userId: 'test-user',
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      })
    } else if (method === 'PUT') {
      const body = await route.request().postDataJSON()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          trip: {
            ...body,
            updatedAt: new Date().toISOString()
          }
        })
      })
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Trip deleted successfully'
        })
      })
    }
  })

  // Mock Schengen calculation API
  await page.route('/api/schengen/calculate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        status: {
          usedDays: 15,
          remainingDays: 75,
          nextResetDate: '2024-07-01',
          isCompliant: true,
          violations: []
        }
      })
    })
  })
})

test.describe('Trip Management E2E Tests', () => {
  test('should display trip list on home page', async ({ page }) => {
    await page.goto('/')
    
    // Wait for trips to load
    await page.waitForSelector('[data-testid="trip-list"]')
    
    // Check if trip is displayed
    await expect(page.locator('[data-testid="trip-item"]')).toHaveCount(1)
    await expect(page.locator('text=France')).toBeVisible()
    await expect(page.locator('text=2024-01-01')).toBeVisible()
    await expect(page.locator('text=2024-01-15')).toBeVisible()
  })

  test('should create a new trip', async ({ page }) => {
    await page.goto('/')
    
    // Click add trip button
    await page.click('[data-testid="add-trip-button"]')
    
    // Fill trip form
    await page.fill('[data-testid="country-input"]', 'Germany')
    await page.fill('[data-testid="entry-date-input"]', '2024-02-01')
    await page.fill('[data-testid="exit-date-input"]', '2024-02-15')
    await page.selectOption('[data-testid="visa-type-select"]', 'Tourist')
    await page.fill('[data-testid="max-days-input"]', '90')
    await page.fill('[data-testid="notes-input"]', 'Business trip to Berlin')
    
    // Submit form
    await page.click('[data-testid="submit-trip-button"]')
    
    // Verify trip was created
    await expect(page.locator('text=Trip created successfully')).toBeVisible()
    await expect(page.locator('[data-testid="trip-item"]')).toHaveCount(2)
    await expect(page.locator('text=Germany')).toBeVisible()
  })

  test('should edit an existing trip', async ({ page }) => {
    await page.goto('/')
    
    // Wait for trips to load
    await page.waitForSelector('[data-testid="trip-list"]')
    
    // Click edit button on first trip
    await page.click('[data-testid="edit-trip-1"]')
    
    // Update trip details
    await page.fill('[data-testid="notes-input"]', 'Updated: Extended stay in Paris')
    await page.fill('[data-testid="exit-date-input"]', '2024-01-20')
    
    // Submit update
    await page.click('[data-testid="update-trip-button"]')
    
    // Verify trip was updated
    await expect(page.locator('text=Trip updated successfully')).toBeVisible()
    await expect(page.locator('text=2024-01-20')).toBeVisible()
    await expect(page.locator('text=Updated: Extended stay in Paris')).toBeVisible()
  })

  test('should delete a trip', async ({ page }) => {
    await page.goto('/')
    
    // Wait for trips to load
    await page.waitForSelector('[data-testid="trip-list"]')
    
    // Click delete button on first trip
    await page.click('[data-testid="delete-trip-1"]')
    
    // Confirm deletion in dialog
    await page.click('[data-testid="confirm-delete-button"]')
    
    // Verify trip was deleted
    await expect(page.locator('text=Trip deleted successfully')).toBeVisible()
    await expect(page.locator('[data-testid="trip-item"]')).toHaveCount(0)
    await expect(page.locator('text=No trips recorded yet')).toBeVisible()
  })

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/')
    
    // Click add trip button
    await page.click('[data-testid="add-trip-button"]')
    
    // Try to submit empty form
    await page.click('[data-testid="submit-trip-button"]')
    
    // Check for validation errors
    await expect(page.locator('text=Country is required')).toBeVisible()
    await expect(page.locator('text=Entry date is required')).toBeVisible()
    
    // Fill invalid date range (exit before entry)
    await page.fill('[data-testid="country-input"]', 'Spain')
    await page.fill('[data-testid="entry-date-input"]', '2024-02-15')
    await page.fill('[data-testid="exit-date-input"]', '2024-02-01')
    
    await page.click('[data-testid="submit-trip-button"]')
    
    // Check for date validation error
    await expect(page.locator('text=Exit date must be after entry date')).toBeVisible()
  })
})

test.describe('Schengen Calculator E2E Tests', () => {
  test('should display Schengen status', async ({ page }) => {
    await page.goto('/schengen')
    
    // Wait for calculation to complete
    await page.waitForSelector('[data-testid="schengen-status"]')
    
    // Check status display
    await expect(page.locator('text=Days Used: 15')).toBeVisible()
    await expect(page.locator('text=Days Remaining: 75')).toBeVisible()
    await expect(page.locator('text=Compliant')).toBeVisible()
  })

  test('should show detailed calculation breakdown', async ({ page }) => {
    await page.goto('/schengen')
    
    // Click to expand details
    await page.click('[data-testid="show-details-button"]')
    
    // Check detailed breakdown
    await expect(page.locator('[data-testid="calculation-details"]')).toBeVisible()
    await expect(page.locator('text=180-day rolling period')).toBeVisible()
    await expect(page.locator('text=Next reset date')).toBeVisible()
  })

  test('should provide warnings for approaching limits', async ({ page }) => {
    // Mock API to return warning status
    await page.route('/api/schengen/calculate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          status: {
            usedDays: 85,
            remainingDays: 5,
            nextResetDate: '2024-07-01',
            isCompliant: true,
            violations: []
          },
          warnings: ['주의: 셰겐 지역 체류 한도에 근접했습니다. 남은 일수: 5일']
        })
      })
    })

    await page.goto('/schengen')
    
    // Wait for warning to appear
    await expect(page.locator('[data-testid="schengen-warning"]')).toBeVisible()
    await expect(page.locator('text=주의: 셰겐 지역 체류 한도에 근접했습니다')).toBeVisible()
    await expect(page.locator('text=남은 일수: 5일')).toBeVisible()
  })
})

test.describe('Mobile Responsiveness E2E Tests', () => {
  test('should display properly on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
    
    // Check responsive layout
    await expect(page.locator('[data-testid="trip-list"]')).toBeVisible()
    
    // Test mobile menu
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  })

  test('should handle touch gestures', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Wait for trips to load
    await page.waitForSelector('[data-testid="trip-list"]')
    
    // Test swipe gesture on trip item
    const tripItem = page.locator('[data-testid="trip-item"]').first()
    await tripItem.hover()
    
    // Simulate touch swipe (using mouse for E2E testing)
    const box = await tripItem.boundingBox()
    if (box) {
      await page.mouse.move(box.x + 10, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2)
      await page.mouse.up()
    }
    
    // Check if swipe action revealed options
    await expect(page.locator('[data-testid="swipe-actions"]')).toBeVisible()
  })
})

test.describe('PWA Functionality E2E Tests', () => {
  test('should work offline', async ({ page, context }) => {
    await page.goto('/')
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle')
    
    // Go offline
    await context.setOffline(true)
    
    // Refresh page
    await page.reload()
    
    // Should still work with cached content
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=DINO')).toBeVisible()
    
    // Check offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
  })

  test('should show install prompt', async ({ page }) => {
    await page.goto('/')
    
    // Simulate beforeinstallprompt event
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt')
      ;(event as any).prompt = () => Promise.resolve()
      ;(event as any).userChoice = Promise.resolve({ outcome: 'accepted' })
      window.dispatchEvent(event)
    })
    
    // Check if install button appears
    await expect(page.locator('[data-testid="install-app-button"]')).toBeVisible()
  })

  test('should sync data when back online', async ({ page, context }) => {
    await page.goto('/')
    
    // Go offline
    await context.setOffline(true)
    
    // Try to create a trip while offline
    await page.click('[data-testid="add-trip-button"]')
    await page.fill('[data-testid="country-input"]', 'Italy')
    await page.fill('[data-testid="entry-date-input"]', '2024-03-01')
    await page.fill('[data-testid="exit-date-input"]', '2024-03-15')
    await page.selectOption('[data-testid="visa-type-select"]', 'Tourist')
    await page.fill('[data-testid="max-days-input"]', '90')
    await page.click('[data-testid="submit-trip-button"]')
    
    // Should show offline message
    await expect(page.locator('text=Saved offline. Will sync when online.')).toBeVisible()
    
    // Go back online
    await context.setOffline(false)
    
    // Wait for sync indicator
    await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible()
    await expect(page.locator('text=Syncing...')).toBeVisible()
    
    // Wait for sync completion
    await expect(page.locator('text=Data synced successfully')).toBeVisible()
  })
})

test.describe('Performance E2E Tests', () => {
  test('should load within performance budgets', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // Check Core Web Vitals
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ type: 'largest-contentful-paint', buffered: true })
      })
    })
    
    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500)
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    // Mock large dataset
    await page.route('/api/trips', async (route) => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `trip-${i}`,
        userId: 'test-user',
        country: `Country ${i}`,
        entryDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-01`,
        exitDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
        visaType: 'Tourist',
        maxDays: 90,
        notes: `Trip ${i}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          trips: largeDataset
        })
      })
    })

    const startTime = Date.now()
    await page.goto('/')
    await page.waitForSelector('[data-testid="trip-list"]')
    
    const renderTime = Date.now() - startTime
    
    // Should render large dataset efficiently
    expect(renderTime).toBeLessThan(5000)
    
    // Check if virtualization is working (not all items should be in DOM)
    const visibleItems = await page.locator('[data-testid="trip-item"]').count()
    expect(visibleItems).toBeLessThan(100) // Should be virtualized
  })
})

test.describe('Accessibility E2E Tests', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Tab through the interface
    await page.keyboard.press('Tab') // Focus first element
    await page.keyboard.press('Tab') // Move to next element
    await page.keyboard.press('Tab') // Move to add button
    
    // Should be able to activate add button with Enter
    await page.keyboard.press('Enter')
    
    // Form should open
    await expect(page.locator('[data-testid="trip-form"]')).toBeVisible()
    
    // Should be able to navigate form with Tab
    await page.keyboard.press('Tab') // Country input
    await page.keyboard.type('Germany')
    
    await page.keyboard.press('Tab') // Entry date
    await page.keyboard.type('2024-02-01')
    
    await page.keyboard.press('Tab') // Exit date
    await page.keyboard.type('2024-02-15')
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    // Check for ARIA labels on interactive elements
    const addButton = page.locator('[data-testid="add-trip-button"]')
    await expect(addButton).toHaveAttribute('aria-label', 'Add new trip')
    
    const tripList = page.locator('[data-testid="trip-list"]')
    await expect(tripList).toHaveAttribute('role', 'list')
    
    // Check form accessibility
    await page.click('[data-testid="add-trip-button"]')
    
    const countryInput = page.locator('[data-testid="country-input"]')
    await expect(countryInput).toHaveAttribute('aria-label', 'Country')
    await expect(countryInput).toHaveAttribute('aria-required', 'true')
  })

  test('should work with screen readers', async ({ page }) => {
    await page.goto('/')
    
    // Check for screen reader announcements
    const main = page.locator('main')
    await expect(main).toHaveAttribute('aria-live', 'polite')
    
    // Status messages should be announced
    await page.click('[data-testid="add-trip-button"]')
    await page.fill('[data-testid="country-input"]', 'Spain')
    await page.fill('[data-testid="entry-date-input"]', '2024-02-01')
    await page.fill('[data-testid="exit-date-input"]', '2024-02-15')
    await page.selectOption('[data-testid="visa-type-select"]', 'Tourist')
    await page.fill('[data-testid="max-days-input"]', '90')
    await page.click('[data-testid="submit-trip-button"]')
    
    // Success message should be announced
    const statusMessage = page.locator('[data-testid="status-message"]')
    await expect(statusMessage).toHaveAttribute('role', 'status')
    await expect(statusMessage).toHaveAttribute('aria-live', 'polite')
  })
})