import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show sign in page when accessing protected routes', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');

    // Should redirect to sign in
    await expect(page).toHaveURL(/\/auth\/signin/);
    await expect(page.locator('h2')).toContainText('로그인');
  });

  test('should load sign in page correctly', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check sign in page elements
    await expect(page.locator('h2')).toContainText('로그인');
    await expect(page.locator('text=Google로 로그인')).toBeVisible();
    await expect(page.locator('text=DINO').first()).toBeVisible();
    
    // Check privacy policy links
    await expect(page.locator('text=서비스 약관')).toBeVisible();
    await expect(page.locator('text=개인정보 처리방침')).toBeVisible();
  });

  test('should show Google OAuth button', async ({ page }) => {
    await page.goto('/auth/signin');

    const googleButton = page.locator('button:has-text("Google로 로그인")');
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
    
    // Check Google icon is present
    await expect(page.locator('button:has-text("Google로 로그인") svg')).toBeVisible();
  });

  test('should handle authentication loading state', async ({ page }) => {
    await page.goto('/auth/signin');

    // Click Google sign in button
    await page.click('button:has-text("Google로 로그인")');
    
    // Should show loading state (briefly)
    await expect(page.locator('text=로그인 중').or(page.locator('button:disabled'))).toBeVisible();
  });

  test('should navigate back to home from sign in', async ({ page }) => {
    await page.goto('/auth/signin');

    // Click back to home link
    await page.click('text=홈으로 돌아가기');
    
    // Should navigate to home
    await expect(page).toHaveURL('/');
  });
});