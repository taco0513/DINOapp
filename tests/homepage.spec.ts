import { test, expect } from '@playwright/test';

test.describe('DINO v2.0 Homepage', () => {
  test('should load homepage with correct title and navigation', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/DINO v2.0/);

    // Check main heading
    await expect(page.locator('h1')).toContainText('DINO v2.0');

    // Check navigation menu exists
    await expect(page.locator('nav')).toBeVisible();

    // Check key navigation items
    await expect(page.locator('text=홈')).toBeVisible();
    await expect(page.locator('text=비자 서비스')).toBeVisible();
    await expect(page.locator('text=여행 관리')).toBeVisible();

    // Check hero section
    await expect(page.locator('text=스마트한 여행 계획')).toBeVisible();
    await expect(page.locator('text=디지털 노마드')).toBeVisible();
  });

  test('should navigate to visa checker', async ({ page }) => {
    await page.goto('/');

    // Hover over visa services to show dropdown
    await page.locator('text=비자 서비스').hover();

    // Wait for dropdown and click visa checker
    await page.locator('text=비자 체커').click();

    // Should navigate to visa page
    await expect(page).toHaveURL('/visa');
    await expect(page.locator('h1')).toContainText('비자');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto('/');

    // Check mobile navigation
    await expect(page.locator('nav')).toBeVisible();
    
    // Check content is visible and properly formatted
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=DINO v2.0')).toBeVisible();
  });
});