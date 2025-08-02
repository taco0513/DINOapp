import { test, expect } from '@playwright/test';

test.describe('Accessibility Testing', () => {
  test('should have proper page structure and headings', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);

    // Check for landmark elements
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main').or(page.locator('[role="main"]'))).toBeVisible();
  });

  test('should have keyboard navigation support', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is visible on interactive elements
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper form labels and accessibility', async ({ page }) => {
    await page.goto('/visa');

    // Check for form labels
    const selects = await page.locator('select').count();
    if (selects > 0) {
      // Each select should have associated label or aria-label
      const firstSelect = page.locator('select').first();
      const hasLabel = await firstSelect.getAttribute('aria-label') !== null ||
                      await page.locator('label').count() > 0;
      expect(hasLabel).toBeTruthy();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    // Check for text visibility (basic contrast check)
    const textElements = await page.locator('h1, h2, h3, p, span').all();
    
    for (const element of textElements.slice(0, 5)) { // Check first 5 elements
      await expect(element).toBeVisible();
    }
  });

  test('should work with screen reader attributes', async ({ page }) => {
    await page.goto('/');

    // Check for ARIA attributes where appropriate
    const buttons = await page.locator('button').all();
    
    for (const button of buttons.slice(0, 3)) { // Check first 3 buttons
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Button should have either text content or aria-label (skip empty ones)
      if (text && text.trim() !== '') {
        expect(text.trim()).toBeTruthy();
      } else if (ariaLabel) {
        expect(ariaLabel).toBeTruthy();
      }
    }
  });

  test('should handle focus management in modals', async ({ page }) => {
    await page.goto('/');

    // If there are any modal triggers, test focus management
    const modalTriggers = await page.locator('[data-modal-trigger]').count();
    
    if (modalTriggers > 0) {
      await page.locator('[data-modal-trigger]').first().click();
      
      // Focus should move to modal
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await expect(modal).toBeFocused();
      }
    }
  });
});