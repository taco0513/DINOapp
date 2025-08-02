import { test, expect } from '@playwright/test';

test.describe('Visa Checker Functionality', () => {
  test('should load visa checker page', async ({ page }) => {
    await page.goto('/visa');

    // Check page loads
    await expect(page.locator('h1')).toContainText('비자 요구사항 체커');
    
    // Check form elements exist
    await expect(page.locator('select#passport-country')).toBeVisible(); // passport country
    await expect(page.locator('select#destination')).toBeVisible(); // destination country
    
    // Check action button
    await expect(page.locator('button:has-text("비자 요구사항 확인")')).toBeVisible();
  });

  test('should perform visa check', async ({ page }) => {
    await page.goto('/visa');

    // Fill out the form
    await page.selectOption('select#passport-country', 'KR'); // Korea
    await page.selectOption('select#destination', 'US'); // United States
    await page.selectOption('select#purpose', 'tourism'); // Tourism

    // Submit form
    await page.click('button:has-text("비자 요구사항 확인")');

    // Wait for results or loading state
    await page.waitForTimeout(1000);

    // Check if results are displayed or button shows processing state
    const processingButton = page.locator('button:has-text("확인 중")');
    const resetButton = page.locator('button:has-text("다시 확인")');
    
    // Either processing state or results should be visible
    await expect(processingButton.or(resetButton)).toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('/visa');

    // Try to submit without filling form (button should be disabled)
    const submitButton = page.locator('button:has-text("비자 요구사항 확인")');
    await expect(submitButton).toBeDisabled();

    // Check if form is still visible
    await expect(page.locator('select#passport-country')).toBeVisible();
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/visa');

    // Check mobile layout
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
    
    // Form should be usable on mobile
    await page.selectOption('select#passport-country', 'KR');
    await expect(page.locator('select#passport-country')).toHaveValue('KR');
  });
});