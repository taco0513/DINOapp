import { test, expect } from '@playwright/test';

test.describe('DINO v2.0 Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    await page.goto('/');

    // Test navigation to key pages
    const pages = [
      { text: '대시보드', url: '/dashboard', title: '대시보드' },
      { text: '비자 체커', url: '/visa', title: '비자 요구사항 체커' },
      { text: '셰겐 계산기', url: '/schengen', title: '셰겐 계산기' },
      { text: '여행 분석', url: '/analytics', title: '여행 분석' },
    ];

    for (const pageInfo of pages) {
      await page.goto('/');
      
      // Navigate to page (handle dropdowns)
      if (pageInfo.text === '비자 체커') {
        await page.locator('[aria-label="비자 서비스 메뉴 열기"]').hover();
        await page.locator('a[href="/visa"][aria-label*="비자 체커"]').click();
      } else if (pageInfo.text === '여행 분석') {
        await page.locator('[aria-label="여행 관리 메뉴 열기"]').hover();
        await page.locator('a[href="/analytics"][aria-label*="여행 분석"]').click();
      } else {
        await page.locator(`a[href="${pageInfo.url}"]`).first().click();
      }

      // Verify navigation
      await expect(page).toHaveURL(pageInfo.url);
    }
  });

  test('should handle mega menu interactions', async ({ page }) => {
    await page.goto('/');

    // Test visa services dropdown
    await page.locator('[aria-label="비자 서비스 메뉴 열기"]').hover();
    await expect(page.locator('a[href="/visa"]')).toBeVisible();
    await expect(page.locator('a[href="/visa-tracker"]')).toBeVisible();
    await expect(page.locator('a[href="/visa-assistant"]')).toBeVisible();

    // Test travel tools dropdown
    await page.locator('[aria-label="여행 관리 메뉴 열기"]').hover();
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
    await expect(page.locator('a[href="/schengen"]')).toBeVisible();
  });

  test('should maintain navigation state', async ({ page }) => {
    await page.goto('/');

    // Navigate to a page
    await page.locator('[aria-label="비자 서비스 메뉴 열기"]').hover();
    await page.locator('a[href="/visa"]').click();

    // Check that navigation is still visible and functional
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=홈')).toBeVisible();
    
    // Navigate back to home
    await page.locator('a[href="/"]').first().click();
    await expect(page).toHaveURL('/');
  });
});