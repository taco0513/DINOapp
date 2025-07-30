import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for tests
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

  test('dashboard page should not have accessibility violations', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for content to load
    await page.waitForSelector('h1:has-text("대시보드")', { timeout: 10000 })

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('skip link should be functional', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for page to load
    await page.waitForSelector('h1')
    
    // Tab to skip link (should be first focusable element)
    await page.keyboard.press('Tab')
    
    // Check if skip link is focused and visible
    const skipLink = page.locator('a:has-text("메인 콘텐츠로 건너뛰기")')
    await expect(skipLink).toBeFocused()
    await expect(skipLink).toBeVisible()
    
    // Press Enter to activate skip link
    await page.keyboard.press('Enter')
    
    // Check if main content is focused
    const mainContent = page.locator('#main-content')
    await expect(mainContent).toBeFocused()
  })

  test('keyboard navigation should work properly', async ({ page }) => {
    await page.goto('/trips')
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("여행 기록")')
    
    // Test tab navigation through interactive elements
    const interactiveElements = [
      'a:has-text("메인 콘텐츠로 건너뛰기")', // Skip link
      'button:has-text("여행 추가")', // Add trip button
      'button:has-text("전체")', // Filter buttons
    ]
    
    for (let i = 0; i < interactiveElements.length; i++) {
      await page.keyboard.press('Tab')
      const element = page.locator(interactiveElements[i]).first()
      if (await element.count() > 0) {
        await expect(element).toBeFocused()
      }
    }
  })

  test('forms should have proper labels and error messages', async ({ page }) => {
    await page.goto('/trips')
    
    // Wait for add button and click it
    await page.waitForSelector('button:has-text("여행 추가")')
    await page.click('button:has-text("여행 추가")')
    
    // Wait for form to appear
    await page.waitForSelector('form')
    
    // Check form accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('form')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
    
    // Test that form inputs have labels
    const inputs = page.locator('input, select')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const name = await input.getAttribute('name')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')
      
      // Input should have some form of labeling
      const hasLabel = id && await page.locator(`label[for="${id}"]`).count() > 0
      const hasAriaLabel = ariaLabel !== null
      const hasAriaLabelledBy = ariaLabelledBy !== null
      
      expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy()
    }
  })

  test('color contrast should be sufficient', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for content to load
    await page.waitForSelector('h1')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('images should have alt text', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for content to load
    await page.waitForSelector('h1')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('headings should have proper hierarchy', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for content to load
    await page.waitForSelector('h1')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('focus indicators should be visible', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for content to load
    await page.waitForSelector('h1')
    
    // Test focus on various interactive elements
    const buttons = page.locator('button').first()
    if (await buttons.count() > 0) {
      await buttons.focus()
      
      // Check if element has focus styles
      const styles = await buttons.evaluate((el) => {
        return window.getComputedStyle(el)
      })
      
      // Focus should be visible (outline or other focus indicator)
      expect(styles.outline).not.toBe('none')
    }
  })

  test('screen reader announcements should work', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for content to load
    await page.waitForSelector('h1')

    // Check for ARIA live regions for dynamic content
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-live-region'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('mobile accessibility should work', async ({ page, isMobile }) => {
    // Only run on mobile context
    test.skip(!isMobile, 'Mobile-specific test')
    
    await page.goto('/dashboard')
    
    // Wait for content to load
    await page.waitForSelector('h1')
    
    // Check mobile-specific accessibility
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
    
    // Check touch targets are at least 44px
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      const box = await button.boundingBox()
      
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44)
        expect(box.width).toBeGreaterThanOrEqual(44)
      }
    }
  })
})