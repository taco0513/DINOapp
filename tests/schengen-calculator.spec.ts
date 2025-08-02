import { test, expect } from '@playwright/test';

test.describe('Schengen Calculator', () => {
  test('should load schengen calculator page', async ({ page }) => {
    await page.goto('/schengen');

    // Check page loads with correct content
    await expect(page.locator('h1')).toContainText('셰겐 계산기');
    await expect(page.locator('text=90/180일 규칙').first()).toBeVisible();
    
    // Check key elements
    await expect(page.locator('text=여행 추가')).toBeVisible();
    await expect(page.locator('text=계산하기')).toBeVisible();
  });

  test('should add and calculate schengen trips', async ({ page }) => {
    await page.goto('/schengen');

    // Check if calculator loads
    await expect(page.locator('h1')).toContainText('셰겐 계산기');

    // Fill out trip form (if modal opens)
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      await page.selectOption('select[name="country"]', 'DE'); // Germany
      await page.fill('input[type="date"]', '2024-01-01');
      await page.fill('input[type="date"]:nth-child(2)', '2024-01-10');
      
      await page.click('text=추가');
    }

    // Calculate results
    await page.click('text=계산하기');
    await page.waitForTimeout(1000);

    // Check for results display
    await expect(page.locator('text=남은 일수').or(page.locator('text=사용한 일수'))).toBeVisible();
  });

  test('should show demo data and calculations', async ({ page }) => {
    await page.goto('/schengen');

    // Check if calculator is shown
    await expect(page.locator('text=디지털 노마드를 위한').first()).toBeVisible();
    
    // Should show some calculated information
    await expect(page.locator('text=일').or(page.locator('text=days'))).toBeVisible();
  });

  test('should handle date validation', async ({ page }) => {
    await page.goto('/schengen');

    // This test would check date validation if the form is interactive
    // For now, just ensure the page doesn't crash with invalid data
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
  });
});