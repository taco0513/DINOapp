import { test, expect } from '@playwright/test';

/**
 * Critical User Journey E2E Tests for DINO App
 * Tests the most important user flows for the travel management system
 */

test.describe('Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('User can access the application and view dashboard', async ({
    page,
  }) => {
    // Check if the page loads correctly
    await expect(page).toHaveTitle(/DINO/);

    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();

    // Check for main content area
    await expect(page.locator('main')).toBeVisible();
  });

  test('User can navigate to Schengen calculator', async ({ page }) => {
    // Look for Schengen calculator link or button
    const schengenLink = page.locator('a', { hasText: /schengen/i }).first();

    if (await schengenLink.isVisible()) {
      await schengenLink.click();

      // Verify navigation to Schengen page
      await expect(page).toHaveURL(/.*schengen.*/);

      // Check for calculator elements
      await expect(
        page.locator('form, .calculator, [data-testid*="schengen"]')
      ).toBeVisible();
    } else {
      // Navigate to /schengen directly if no link found
      await page.goto('/schengen');
      await expect(page.locator('h1, h2, h3')).toContainText(/schengen/i);
    }
  });

  test('User can navigate to trips management', async ({ page }) => {
    // Look for trips/travel management link
    const tripsLink = page.locator('a', { hasText: /trips?|travel/i }).first();

    if (await tripsLink.isVisible()) {
      await tripsLink.click();

      // Verify navigation to trips page
      await expect(page).toHaveURL(/.*trips.*/);

      // Check for trip management interface
      await expect(
        page.locator('form, .trip, [data-testid*="trip"]')
      ).toBeVisible();
    } else {
      // Navigate to /trips directly if no link found
      await page.goto('/trips');
      await expect(page.locator('h1, h2, h3')).toContainText(/trips?|travel/i);
    }
  });

  test('Application is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if page still loads and main elements are visible
    await expect(page.locator('main')).toBeVisible();

    // Check for mobile-friendly navigation (hamburger menu, etc.)
    const mobileNav = page.locator(
      '[data-testid="mobile-nav"], .mobile-menu, button[aria-label*="menu"]'
    );
    if (await mobileNav.isVisible()) {
      await mobileNav.click();
      // Check if navigation menu opens
      await expect(page.locator('nav, .menu, [role="menu"]')).toBeVisible();
    }
  });

  test('Application handles errors gracefully', async ({ page }) => {
    // Try to navigate to a non-existent page
    const response = await page.goto('/non-existent-page');

    // Should either redirect to 404 page or home page
    if (response?.status() === 404) {
      await expect(page.locator('h1, h2, h3')).toContainText(/404|not found/i);
    } else {
      // If redirected, should be on a valid page
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('Core functionality works without authentication', async ({ page }) => {
    // Test that basic features work for unauthenticated users
    await page.goto('/schengen');

    // Should be able to view Schengen calculator
    await expect(page.locator('h1, h2, h3')).toBeVisible();

    // Check if any form inputs are available
    const inputs = page.locator('input, select, button');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThan(0);
  });

  test('Application performance is acceptable', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now();

    const response = await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Response should be successful
    expect(response?.status()).toBe(200);

    // Check for loading states or content
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });

  test('Search functionality works if available', async ({ page }) => {
    // Look for search input
    const searchInput = page
      .locator(
        'input[type="search"], input[placeholder*="search"], [data-testid*="search"]'
      )
      .first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('France');
      await searchInput.press('Enter');

      // Should either show results or navigate to search page
      await page.waitForTimeout(1000);

      // Check if search produced any results or feedback
      const hasResults = await page
        .locator('.search-results, .results, [data-testid*="result"]')
        .isVisible();
      const hasNoResults = await page
        .locator('.no-results, .empty')
        .isVisible();
      const hasError = await page.locator('.error').isVisible();

      // At least one of these should be true after search
      expect(hasResults || hasNoResults || hasError).toBe(true);
    }
  });

  test('Forms provide user feedback', async ({ page }) => {
    // Navigate to a page likely to have forms
    await page.goto('/trips');

    // Look for form elements
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      // Try to submit empty form to check validation
      const submitButton = form
        .locator('button[type="submit"], input[type="submit"]')
        .first();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Should show some form of feedback (validation errors, loading state, etc.)
        await page.waitForTimeout(1000);

        const hasFeedback = await page
          .locator(
            '.error, .success, .warning, .loading, [aria-invalid="true"], .field-error'
          )
          .isVisible();

        // Form should provide some feedback
        expect(hasFeedback).toBe(true);
      }
    }
  });

  test('Accessibility basics are in place', async ({ page }) => {
    // Check for basic accessibility elements
    await expect(page.locator('main')).toBeVisible();

    // Should have a proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Should have proper focus management
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
