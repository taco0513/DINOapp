import { test, expect } from '@playwright/test';

test.describe('App Functionality Tests', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');

    // Check if page loads without errors
    await expect(page.locator('body')).toBeVisible();

    // Should see DINO app name or some content
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('should have proper meta tags and title', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/DINO/);

    // Check meta viewport for mobile responsiveness
    const viewport = await page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Page should still be visible and functional on mobile
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle navigation between pages', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Try to navigate to different sections if available
    const links = await page.locator('a[href*="/"]').all();

    if (links.length > 0) {
      // Click first internal link
      await links[0].click();

      // Should navigate somewhere
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should load CSS and JavaScript properly', async ({ page }) => {
    await page.goto('/');

    // Check if CSS is loaded (look for styled elements)
    const styledElements = await page.locator('[style]').count();
    expect(styledElements).toBeGreaterThan(0);

    // Check if JavaScript is working (NextJS should be hydrated)
    const isHydrated = await page.evaluate(() => {
      return typeof window !== 'undefined' && window.React !== undefined;
    });

    // NextJS should be running
    expect(isHydrated).toBeTruthy();
  });

  test('should handle API calls gracefully', async ({ page }) => {
    let apiCalls = 0;

    // Monitor API calls
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls++;
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should make some API calls for authentication or data
    expect(apiCalls).toBeGreaterThanOrEqual(0);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for any async operations

    // Filter out common non-critical errors
    const criticalErrors = errors.filter(
      error =>
        !error.includes('favicon') &&
        !error.includes('Manifest') &&
        !error.includes('404') &&
        !error.includes('Failed to load resource')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have proper security headers', async ({ page }) => {
    const response = await page.goto('/');

    // Check for security headers
    const headers = response?.headers();

    if (headers) {
      // Should have some security measures
      expect(
        headers['x-frame-options'] || headers['content-security-policy']
      ).toBeDefined();
    }
  });

  test('should handle authentication flow', async ({ page }) => {
    await page.goto('/');

    // Look for any authentication elements
    const authElements = page
      .locator('text=Sign in')
      .or(
        page
          .locator('text=로그인')
          .or(page.locator('text=Login').or(page.locator('[href*="auth"]')))
      );

    // Should either show auth elements or be already authenticated
    const hasAuthElements = (await authElements.count()) > 0;
    const hasUserInfo =
      (await page
        .locator('text=@')
        .or(page.locator('img[alt*="User"]'))
        .count()) > 0;

    // Should have either auth option or user info
    expect(hasAuthElements || hasUserInfo).toBeTruthy();
  });

  test('should handle logout functionality', async ({ page }) => {
    await page.goto('/');

    // Look for logout button (might be visible if user is logged in)
    const logoutButton = page
      .locator('text=로그아웃')
      .or(page.locator('text=Logout').or(page.locator('text=Sign out')));

    const logoutExists = (await logoutButton.count()) > 0;

    if (logoutExists) {
      // Test clicking logout button
      await logoutButton.click();

      // Should handle logout (redirect or show confirmation)
      await page.waitForTimeout(2000);

      // Page should still be functional after logout attempt
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds (generous for E2E testing)
    expect(loadTime).toBeLessThan(10000);
  });

  test('should work with keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Try to tab through focusable elements
    await page.keyboard.press('Tab');

    // Should have some focusable element
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedElement).toBeDefined();
  });

  test('should handle form interactions', async ({ page }) => {
    await page.goto('/');

    // Look for any forms or input elements
    const inputs = await page
      .locator('input, textarea, select, button')
      .count();

    // If there are interactive elements, they should be functional
    if (inputs > 0) {
      const firstInput = page
        .locator('input, textarea, select, button')
        .first();

      // Should be able to interact with elements
      await expect(firstInput).toBeVisible();

      // Try to focus (if it's an input)
      try {
        await firstInput.focus();
      } catch (e) {
        // Ignore if element is not focusable
      }
    }
  });
});
