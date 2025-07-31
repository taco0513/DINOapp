import { test, expect } from '@playwright/test';

// Helper to setup authenticated session with trips data
async function setupAuthenticatedSessionWithTrips(page: any) {
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

  await page.route('/api/trips', async (route: any) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          trips: [
            {
              id: '1',
              userId: 'test-user-123',
              country: 'France',
              entryDate: '2024-01-01',
              exitDate: '2024-01-15',
              visaType: 'Tourist',
              maxDays: 90,
              passportCountry: 'US',
              notes: 'Paris vacation',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
            {
              id: '2',
              userId: 'test-user-123',
              country: 'Germany',
              entryDate: '2024-02-01',
              exitDate: '2024-02-10',
              visaType: 'Business',
              maxDays: 90,
              passportCountry: 'US',
              notes: 'Berlin conference',
              createdAt: '2024-02-01T00:00:00.000Z',
              updatedAt: '2024-02-01T00:00:00.000Z',
            },
          ],
        }),
      });
    } else if (method === 'POST') {
      const body = await route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          trip: {
            id: '3',
            userId: 'test-user-123',
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });
    }
  });
}

test.describe('Trips Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSessionWithTrips(page);
  });

  test('should display trips list', async ({ page }) => {
    await page.goto('/trips');

    // Should show page title
    await expect(page.locator('h1:has-text("나의 여행 기록")')).toBeVisible();

    // Should show add trip button
    await expect(page.locator('button:has-text("새 여행 추가")')).toBeVisible();

    // Should show existing trips
    await expect(page.locator('text=France')).toBeVisible();
    await expect(page.locator('text=Germany')).toBeVisible();

    // Should show trip details
    await expect(page.locator('text=Paris vacation')).toBeVisible();
    await expect(page.locator('text=Berlin conference')).toBeVisible();
  });

  test('should show trip cards with details', async ({ page }) => {
    await page.goto('/trips');

    // Check first trip card
    const firstTripCard = page
      .locator('div')
      .filter({ hasText: 'France' })
      .first();
    await expect(firstTripCard).toBeVisible();

    // Should show dates
    await expect(firstTripCard.locator('text=2024년 1월 1일')).toBeVisible();
    await expect(firstTripCard.locator('text=2024년 1월 15일')).toBeVisible();

    // Should show visa type
    await expect(firstTripCard.locator('text=Tourist')).toBeVisible();

    // Should show days count
    await expect(firstTripCard.locator('text=15일')).toBeVisible();
  });

  test('should open trip form when clicking add button', async ({ page }) => {
    await page.goto('/trips');

    // Click add trip button
    await page.click('button:has-text("새 여행 추가")');

    // Should show form
    await expect(page.locator('text=새 여행 추가').nth(1)).toBeVisible();

    // Should show form fields
    await expect(page.locator('label:has-text("국가")')).toBeVisible();
    await expect(page.locator('label:has-text("입국일")')).toBeVisible();
    await expect(page.locator('label:has-text("출국일")')).toBeVisible();
    await expect(page.locator('label:has-text("비자 유형")')).toBeVisible();
  });

  test('should create a new trip', async ({ page }) => {
    await page.goto('/trips');

    // Click add trip button
    await page.click('button:has-text("새 여행 추가")');

    // Fill form
    await page.selectOption('select[name="country"]', 'Spain');
    await page.fill('input[name="entryDate"]', '2024-03-01');
    await page.fill('input[name="exitDate"]', '2024-03-15');
    await page.selectOption('select[name="visaType"]', 'Tourist');
    await page.fill('textarea[name="notes"]', 'Barcelona trip');

    // Submit form
    await page.click('button:has-text("저장")');

    // Should close form and show success message
    await expect(page.locator('text=여행이 추가되었습니다')).toBeVisible();

    // Should show new trip in list
    await expect(page.locator('text=Spain')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/trips');

    // Click add trip button
    await page.click('button:has-text("새 여행 추가")');

    // Try to submit empty form
    await page.click('button:has-text("저장")');

    // Should show validation errors
    await expect(page.locator('text=국가를 선택하세요')).toBeVisible();
    await expect(page.locator('text=입국일을 입력하세요')).toBeVisible();
  });

  test('should validate date range', async ({ page }) => {
    await page.goto('/trips');

    // Click add trip button
    await page.click('button:has-text("새 여행 추가")');

    // Fill form with invalid date range
    await page.selectOption('select[name="country"]', 'Italy');
    await page.fill('input[name="entryDate"]', '2024-03-15');
    await page.fill('input[name="exitDate"]', '2024-03-01'); // Exit before entry

    // Try to submit
    await page.click('button:has-text("저장")');

    // Should show validation error
    await expect(
      page.locator('text=출국일은 입국일 이후여야 합니다')
    ).toBeVisible();
  });

  test('should cancel form', async ({ page }) => {
    await page.goto('/trips');

    // Click add trip button
    await page.click('button:has-text("새 여행 추가")');

    // Form should be visible
    await expect(page.locator('text=새 여행 추가').nth(1)).toBeVisible();

    // Click cancel button
    await page.click('button:has-text("취소")');

    // Form should be hidden
    await expect(page.locator('text=새 여행 추가').nth(1)).not.toBeVisible();
  });

  test('should handle empty trips state', async ({ page }) => {
    // Override with empty trips
    await page.route('/api/trips', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          trips: [],
        }),
      });
    });

    await page.goto('/trips');

    // Should show empty state message
    await expect(page.locator('text=아직 여행 기록이 없습니다')).toBeVisible();
    await expect(
      page.locator('text=첫 번째 여행을 추가해보세요')
    ).toBeVisible();
  });

  test('should handle API errors', async ({ page }) => {
    // Override with error response
    await page.route('/api/trips', async (route: any) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal Server Error',
        }),
      });
    });

    await page.goto('/trips');

    // Should show error message
    await expect(
      page.locator('text=여행 기록을 불러오는 중 오류가 발생했습니다')
    ).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/trips');

    // Should show main elements
    await expect(page.locator('h1:has-text("나의 여행 기록")')).toBeVisible();

    // Trip cards should stack vertically
    const tripCards = page.locator('div').filter({ hasText: 'France' });
    await expect(tripCards.first()).toBeVisible();

    // Add button should be visible
    await expect(page.locator('button:has-text("새 여행 추가")')).toBeVisible();
  });

  test('should handle Schengen countries specially', async ({ page }) => {
    await page.goto('/trips');

    // Add new trip
    await page.click('button:has-text("새 여행 추가")');

    // Select Schengen country
    await page.selectOption('select[name="country"]', 'France');

    // Should show Schengen notice
    await expect(page.locator('text=셰겐 지역 국가입니다')).toBeVisible();

    // Max days should default to 90
    const maxDaysInput = page.locator('input[name="maxDays"]');
    await expect(maxDaysInput).toHaveValue('90');
  });
});
