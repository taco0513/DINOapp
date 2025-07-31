import { test, expect } from '@playwright/test';

// Helper to setup authenticated session
async function setupAuthenticatedSession(page: any) {
  await page.route('/api/auth/session', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'test-user-123',
          email: 'test@example.com',
          name: 'Test User',
          image: null,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
  });

  await page.route('/api/stats', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          overview: {
            totalVisits: 5,
            totalCountries: 3,
            totalDays: 45,
          },
        },
      }),
    });
  });

  await page.route('/api/schengen', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          status: {
            usedDays: 30,
            remainingDays: 60,
            isCompliant: true,
          },
        },
      }),
    });
  });
}

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should display dashboard with user data', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show dashboard title
    await expect(page.locator('text=대시보드 - DINO')).toBeVisible();

    // Should show welcome message
    await expect(page.locator('text=안녕하세요, Test User님')).toBeVisible();

    // Should show language selector
    await expect(page.locator('select').first()).toBeVisible();

    // Should show notification icon
    await expect(page.locator('button:has(svg)')).toBeVisible();

    // Should show logout button
    await expect(page.locator('text=로그아웃')).toBeVisible();
  });

  test('should display trip statistics', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show trip statistics box
    await expect(page.locator('text=여행 기록').first()).toBeVisible();

    // Should show total trips count
    await expect(page.locator('text=5').first()).toBeVisible();
    await expect(page.locator('text=전체 여행 기록')).toBeVisible();

    // Should show add trip button
    await expect(page.locator('text=여행 추가')).toBeVisible();
  });

  test('should display Schengen calculator status', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show Schengen calculator box
    await expect(page.locator('text=셰겐 계산기').first()).toBeVisible();

    // Should show used days
    await expect(page.locator('text=30/90')).toBeVisible();
    await expect(page.locator('text=사용 일수/90')).toBeVisible();

    // Should show compliance status
    await expect(page.locator('text=규정 준수')).toBeVisible();

    // Should show calculator button
    await expect(page.locator('button:has-text("셰겐 계산기")')).toBeVisible();
  });

  test('should display country statistics', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show statistics box
    await expect(page.locator('text=통계 보기').first()).toBeVisible();

    // Should show countries count
    await expect(page.locator('text=3').nth(1)).toBeVisible();
    await expect(page.locator('text=방문 국가')).toBeVisible();

    // Should show view stats button
    await expect(page.locator('button:has-text("통계 보기")')).toBeVisible();
  });

  test('should display recent activity', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show recent activity section
    await expect(page.locator('text=최근 활동')).toBeVisible();

    // Should show activity stats
    await expect(page.locator('text=전체 여행 기록').nth(1)).toBeVisible();
    await expect(page.locator('text=방문 국가').nth(1)).toBeVisible();
    await expect(page.locator('text=전체 일수')).toBeVisible();
  });

  test('should navigate to trips page', async ({ page }) => {
    await page.goto('/dashboard');

    // Click trips button
    await page.click('button:has-text("여행 추가")');

    // Should navigate to trips page
    await expect(page).toHaveURL('/trips');
  });

  test('should navigate to Schengen calculator', async ({ page }) => {
    await page.goto('/dashboard');

    // Click Schengen calculator button
    await page.click('button:has-text("셰겐 계산기")');

    // Should navigate to Schengen page
    await expect(page).toHaveURL('/schengen');
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.goto('/dashboard');

    // Click view stats button
    await page.click('button:has-text("통계 보기")');

    // Should navigate to analytics page
    await expect(page).toHaveURL('/analytics');
  });

  test('should change language', async ({ page }) => {
    await page.goto('/dashboard');

    // Find language selector
    const languageSelector = page.locator('select').first();

    // Change to English
    await languageSelector.selectOption('en');

    // Should update text to English
    await expect(page.locator('text=Dashboard - DINO')).toBeVisible();
    await expect(page.locator('text=Hello, Test User')).toBeVisible();
    await expect(page.locator('text=Logout')).toBeVisible();
  });

  test('should handle empty data state', async ({ page }) => {
    // Override with empty data
    await page.route('/api/stats', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            overview: {
              totalVisits: 0,
              totalCountries: 0,
              totalDays: 0,
            },
          },
        }),
      });
    });

    await page.goto('/dashboard');

    // Should show zero counts
    await expect(page.locator('text=0').first()).toBeVisible();

    // Should show add first trip prompt
    await expect(page.locator('text=아직 여행 기록이 없습니다')).toBeVisible();
    await expect(page.locator('text=첫 번째 여행 추가하기')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Override with error response
    await page.route('/api/stats', async (route: any) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal Server Error',
        }),
      });
    });

    await page.goto('/dashboard');

    // Page should still render
    await expect(page.locator('text=대시보드 - DINO')).toBeVisible();

    // Should show loading or error state
    await expect(page.locator('text=...')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/dashboard');

    // Should still show main elements
    await expect(page.locator('text=대시보드 - DINO')).toBeVisible();

    // Grid should stack on mobile
    const gridContainer = page
      .locator('div')
      .filter({ hasText: '여행 기록' })
      .first()
      .locator('..');
    const computedStyle = await gridContainer.evaluate(el =>
      window.getComputedStyle(el)
    );

    // Check that elements are properly displayed on mobile
    await expect(page.locator('text=여행 추가')).toBeVisible();
  });
});
