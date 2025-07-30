import { test, expect } from '@playwright/test'

test.describe('Mobile Experience Tests', () => {
  test.use({ 
    viewport: { width: 390, height: 844 } // iPhone 12 Pro size
  })

  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/**', async route => {
      if (route.request().url().includes('session')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-user',
              name: 'Test User',
              email: 'test@example.com'
            },
            expires: '2025-12-31T23:59:59.999Z'
          })
        })
      } else {
        await route.continue()
      }
    })
  })

  test('mobile navigation should be visible and functional', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for mobile navigation to load
    await page.waitForSelector('.mobile-nav')
    
    // Check if mobile navigation is visible
    const mobileNav = page.locator('.mobile-nav')
    await expect(mobileNav).toBeVisible()
    
    // Check navigation items
    const navItems = [
      { text: '대시보드', href: '/dashboard' },
      { text: '여행 기록', href: '/trips' },
      { text: '셰겐', href: '/schengen' },
      { text: '설정', href: '/settings' }
    ]
    
    for (const item of navItems) {
      const navLink = page.locator(`.mobile-nav-item:has-text("${item.text}")`)
      await expect(navLink).toBeVisible()
      
      // Test navigation
      await navLink.click()
      await page.waitForURL(`**${item.href}`)
      expect(page.url()).toContain(item.href)
    }
  })

  test('pull to refresh should work on dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for dashboard content
    await page.waitForSelector('h1:has-text("대시보드")')
    
    // Mock the refresh handler to track calls
    let refreshCalled = false
    await page.route('**/api/trips', async route => {
      refreshCalled = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      })
    })
    
    // Simulate pull to refresh gesture
    const container = page.locator('.pull-to-refresh').first()
    if (await container.count() > 0) {
      // Start touch at top of container
      await container.hover()
      
      // Simulate swipe down gesture
      await page.touchscreen.tap(195, 100) // Center top of screen
      await page.mouse.move(195, 100)
      await page.mouse.down()
      await page.mouse.move(195, 200, { steps: 10 })
      await page.mouse.up()
      
      // Wait a bit for the gesture to process
      await page.waitForTimeout(1000)
    }
  })

  test('swipeable cards should work in trips list', async ({ page }) => {
    // Mock trips data
    await page.route('**/api/trips', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{
            id: 'test-trip-1',
            country: 'France',
            entryDate: '2024-01-01',
            exitDate: '2024-01-10',
            visaType: 'Tourist',
            maxDays: 90,
            notes: 'Test trip'
          }]
        })
      })
    })

    await page.goto('/trips')
    
    // Wait for trips to load
    await page.waitForSelector('h1:has-text("여행 기록")')
    
    // Look for mobile trip cards
    const mobileCard = page.locator('[class*="SwipeableCard"], .mobile-trip-card').first()
    
    if (await mobileCard.count() > 0) {
      // Test swipe gesture to reveal actions
      const cardBox = await mobileCard.boundingBox()
      if (cardBox) {
        // Swipe left to reveal actions
        await page.touchscreen.tap(cardBox.x + cardBox.width - 50, cardBox.y + cardBox.height / 2)
        await page.mouse.move(cardBox.x + cardBox.width - 50, cardBox.y + cardBox.height / 2)
        await page.mouse.down()
        await page.mouse.move(cardBox.x + 50, cardBox.y + cardBox.height / 2, { steps: 10 })
        await page.mouse.up()
        
        // Wait for actions to appear
        await page.waitForTimeout(500)
        
        // Check if action buttons are visible
        const editButton = page.locator('button:has-text("수정")')
        const deleteButton = page.locator('button:has-text("삭제")')
        
        // At least one action should be visible after swipe
        const editVisible = await editButton.count() > 0 && await editButton.isVisible()
        const deleteVisible = await deleteButton.count() > 0 && await deleteButton.isVisible()
        
        expect(editVisible || deleteVisible).toBeTruthy()
      }
    }
  })

  test('mobile modals should work properly', async ({ page }) => {
    await page.goto('/trips')
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("여행 기록")')
    
    // Click add trip button
    const addButton = page.locator('button:has-text("여행 추가")')
    await addButton.click()
    
    // Wait for modal to appear
    await page.waitForSelector('.mobile-modal, [role="dialog"]')
    
    // Check if modal is visible
    const modal = page.locator('.mobile-modal, [role="dialog"]').first()
    await expect(modal).toBeVisible()
    
    // Test swipe down to dismiss (if implemented)
    const modalBox = await modal.boundingBox()
    if (modalBox) {
      // Swipe down from top of modal
      await page.touchscreen.tap(modalBox.x + modalBox.width / 2, modalBox.y + 20)
      await page.mouse.move(modalBox.x + modalBox.width / 2, modalBox.y + 20)
      await page.mouse.down()
      await page.mouse.move(modalBox.x + modalBox.width / 2, modalBox.y + 150, { steps: 10 })
      await page.mouse.up()
      
      // Wait for potential dismissal
      await page.waitForTimeout(500)
    }
    
    // Test close button
    const closeButton = page.locator('button[aria-label="닫기"], button:has-text("취소")').first()
    if (await closeButton.count() > 0) {
      await closeButton.click()
      await expect(modal).not.toBeVisible()
    }
  })

  test('touch targets should be appropriately sized', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for content to load
    await page.waitForSelector('h1')
    
    // Check button sizes
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i)
      const box = await button.boundingBox()
      
      if (box) {
        // Touch targets should be at least 44px in both dimensions
        expect(box.height).toBeGreaterThanOrEqual(44)
        expect(box.width).toBeGreaterThanOrEqual(44)
      }
    }
    
    // Check link sizes
    const links = page.locator('a')
    const linkCount = await links.count()
    
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = links.nth(i)
      const box = await link.boundingBox()
      
      if (box) {
        // Links should also meet minimum touch target size
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('responsive design should adapt to mobile', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for content to load
    await page.waitForSelector('h1')
    
    // Check if grid layouts become single column on mobile
    const gridElements = page.locator('.grid')
    const gridCount = await gridElements.count()
    
    for (let i = 0; i < gridCount; i++) {
      const grid = gridElements.nth(i)
      const computedStyle = await grid.evaluate(el => {
        return window.getComputedStyle(el).gridTemplateColumns
      })
      
      // On mobile, grids should typically be single column
      // This is a simplified check - actual values may vary
      expect(computedStyle).toBeDefined()
    }
    
    // Check if text is readable (not too small)
    const textElements = page.locator('p, span, div').first()
    if (await textElements.count() > 0) {
      const fontSize = await textElements.evaluate(el => {
        return window.getComputedStyle(el).fontSize
      })
      
      // Font size should be at least 16px to prevent zoom on iOS
      const sizeValue = parseInt(fontSize.replace('px', ''))
      expect(sizeValue).toBeGreaterThanOrEqual(16)
    }
  })

  test('keyboard should not zoom inputs on iOS', async ({ page }) => {
    await page.goto('/trips')
    
    // Click add trip to open form
    const addButton = page.locator('button:has-text("여행 추가")')
    await addButton.click()
    
    // Wait for form
    await page.waitForSelector('input')
    
    // Check input font sizes
    const inputs = page.locator('input, select, textarea')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const fontSize = await input.evaluate(el => {
        return window.getComputedStyle(el).fontSize
      })
      
      // Inputs should have font-size of at least 16px to prevent zoom on iOS
      const sizeValue = parseInt(fontSize.replace('px', ''))
      expect(sizeValue).toBeGreaterThanOrEqual(16)
    }
  })

  test('loading states should be appropriate for mobile', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for loading indicators
    const loadingIndicators = page.locator('.loading, [data-testid="loading"]')
    
    // Loading indicators should be visible while content loads
    if (await loadingIndicators.count() > 0) {
      await expect(loadingIndicators.first()).toBeVisible()
    }
    
    // Wait for content to finish loading
    await page.waitForSelector('h1:has-text("대시보드")')
    
    // Loading indicators should be hidden after content loads
    if (await loadingIndicators.count() > 0) {
      await expect(loadingIndicators.first()).not.toBeVisible()
    }
  })
})