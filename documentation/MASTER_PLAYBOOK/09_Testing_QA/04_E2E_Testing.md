# E2E 테스트 완전 가이드

## End-to-End 테스트 전략

SuperClaude AI 워크플로우를 활용하여 실제 사용자 시나리오를 검증하는 포괄적인 E2E 테스트 구현 가이드입니다.

### E2E 테스트의 특징

```yaml
e2e_test_characteristics:
  user_perspective:
    description: "실제 사용자 관점에서 시스템 전체를 테스트"
    scope: ["User journeys", "Business workflows", "Cross-browser compatibility"]
    
  real_environment:
    description: "실제 운영 환경과 유사한 환경에서 테스트"
    components: ["Frontend", "Backend", "Database", "External services"]
    
  automation_benefits:
    description: "반복적인 회귀 테스트 자동화"
    advantages: ["Consistent testing", "24/7 monitoring", "Fast feedback"]
    
  maintenance_challenges:
    description: "높은 유지보수 비용과 복잡성"
    considerations: ["Flaky tests", "Slow execution", "Environment dependencies"]
```

### SuperClaude를 활용한 E2E 테스트 개발

```bash
# 1. Playwright E2E 테스트 구현
/implement "사용자 여정 E2E 테스트" --playwright --cross-browser --mobile

# 2. 시각적 회귀 테스트
/implement "시각적 테스트" --screenshot-comparison --responsive --accessibility

# 3. 성능 E2E 테스트
/implement "성능 테스트" --lighthouse --core-web-vitals --load-testing

# 4. API E2E 테스트
/implement "API 워크플로우 테스트" --rest-api --graphql --authentication
```

## Playwright 기반 E2E 테스트

### 기본 설정 및 구조

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright']
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Global test settings
    actionTimeout: 10000,
    navigationTimeout: 30000
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Specific test suites
    {
      name: 'auth-tests',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'critical-path',
      testMatch: /critical\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      retries: 3,
    }
  ],

  // Test environment setup
  webServer: {
    command: 'npm run start:test',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 페이지 객체 모델 (POM) 구현

```typescript
// tests/e2e/pages/BasePage.ts
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, url: string) {
    this.page = page;
    this.url = url;
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getElementText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return await locator.textContent() || '';
  }

  async clickWithRetry(locator: Locator, maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await locator.click({ timeout: 5000 });
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }
}

// tests/e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signupLink: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly showPasswordButton: Locator;

  constructor(page: Page) {
    super(page, '/login');
    
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
    this.signupLink = page.locator('[data-testid="signup-link"]');
    this.rememberMeCheckbox = page.locator('[data-testid="remember-me-checkbox"]');
    this.showPasswordButton = page.locator('[data-testid="show-password-button"]');
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    
    await this.loginButton.click();
  }

  async getLoginButtonText(): Promise<string> {
    return await this.getElementText(this.loginButton);
  }

  async isLoginButtonDisabled(): Promise<boolean> {
    return await this.loginButton.isDisabled();
  }

  async getErrorMessageText(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return await this.getElementText(this.errorMessage);
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.showPasswordButton.click();
  }

  async isPasswordVisible(): Promise<boolean> {
    const inputType = await this.passwordInput.getAttribute('type');
    return inputType === 'text';
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async clickSignupLink(): Promise<void> {
    await this.signupLink.click();
  }

  async waitForRedirectToDashboard(): Promise<void> {
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
  }
}

// tests/e2e/pages/DashboardPage.ts
export class DashboardPage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly navigationMenu: Locator;
  readonly profileLink: Locator;
  readonly settingsLink: Locator;
  readonly notificationBell: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page, '/dashboard');
    
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    this.navigationMenu = page.locator('[data-testid="navigation-menu"]');
    this.profileLink = page.locator('[data-testid="profile-link"]');
    this.settingsLink = page.locator('[data-testid="settings-link"]');
    this.notificationBell = page.locator('[data-testid="notification-bell"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.getElementText(this.welcomeMessage);
  }

  async openUserMenu(): Promise<void> {
    await this.userMenu.click();
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.logoutButton.click();
  }

  async navigateToProfile(): Promise<void> {
    await this.openUserMenu();
    await this.profileLink.click();
  }

  async navigateToSettings(): Promise<void> {
    await this.openUserMenu();
    await this.settingsLink.click();
  }

  async searchFor(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async getNotificationCount(): Promise<number> {
    const badge = this.notificationBell.locator('.notification-badge');
    if (await badge.isVisible()) {
      const text = await badge.textContent();
      return parseInt(text || '0');
    }
    return 0;
  }

  async waitForDashboardToLoad(): Promise<void> {
    await this.waitForElement(this.welcomeMessage);
    await this.waitForElement(this.navigationMenu);
  }
}
```

### 사용자 여정 테스트

```typescript
// tests/e2e/user-journey/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SignupPage } from '../pages/SignupPage';
import { TestDataManager } from '../utils/TestDataManager';

test.describe('사용자 인증 여정', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let signupPage: SignupPage;
  let testDataManager: TestDataManager;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    signupPage = new SignupPage(page);
    testDataManager = new TestDataManager();
  });

  test.describe('회원가입 프로세스', () => {
    test('새로운 사용자가 회원가입을 완료할 수 있다', async ({ page }) => {
      const userData = testDataManager.generateUser();

      // 1. 회원가입 페이지로 이동
      await signupPage.goto();
      await expect(page).toHaveTitle(/회원가입/);

      // 2. 회원가입 폼 작성
      await signupPage.fillSignupForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password
      });

      // 3. 이용약관 동의
      await signupPage.acceptTermsAndConditions();
      await signupPage.acceptPrivacyPolicy();

      // 4. 회원가입 버튼 클릭
      await signupPage.submitSignup();

      // 5. 성공 메시지 확인
      await expect(signupPage.successMessage).toBeVisible();
      await expect(signupPage.successMessage).toContainText('이메일 인증을 확인해주세요');

      // 6. 이메일 인증 링크 클릭 시뮬레이션
      const verificationToken = await testDataManager.getVerificationToken(userData.email);
      await page.goto(`/verify-email?token=${verificationToken}`);

      // 7. 인증 완료 확인
      await expect(page.locator('[data-testid="verification-success"]')).toBeVisible();
      await expect(page).toHaveURL('**/login');
    });

    test('중복된 이메일로 회원가입 시 오류 메시지를 표시한다', async ({ page }) => {
      const existingUser = await testDataManager.createUser();

      await signupPage.goto();
      await signupPage.fillSignupForm({
        firstName: 'New',
        lastName: 'User',
        email: existingUser.email, // 기존 사용자의 이메일 사용
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      });

      await signupPage.acceptTermsAndConditions();
      await signupPage.submitSignup();

      await expect(signupPage.errorMessage).toBeVisible();
      await expect(signupPage.errorMessage).toContainText('이미 사용 중인 이메일입니다');
    });

    test('비밀번호 확인이 일치하지 않을 때 오류를 표시한다', async () => {
      const userData = testDataManager.generateUser();

      await signupPage.goto();
      await signupPage.fillSignupForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: 'DifferentPassword123!'
      });

      await signupPage.submitSignup();

      await expect(signupPage.passwordMismatchError).toBeVisible();
      await expect(signupPage.passwordMismatchError).toContainText('비밀번호가 일치하지 않습니다');
    });
  });

  test.describe('로그인 프로세스', () => {
    test('유효한 자격증명으로 로그인할 수 있다', async ({ page }) => {
      const user = await testDataManager.createActiveUser();

      // 1. 로그인 페이지로 이동
      await loginPage.goto();
      await expect(page).toHaveTitle(/로그인/);

      // 2. 로그인 폼 작성
      await loginPage.login(user.email, user.password);

      // 3. 대시보드로 리다이렉트 확인
      await loginPage.waitForRedirectToDashboard();
      await expect(page).toHaveURL('**/dashboard');

      // 4. 대시보드 콘텐츠 확인
      await dashboardPage.waitForDashboardToLoad();
      const welcomeMessage = await dashboardPage.getWelcomeMessage();
      expect(welcomeMessage).toContain(user.firstName);
    });

    test('잘못된 자격증명으로 로그인 시 오류 메시지를 표시한다', async () => {
      await loginPage.goto();
      await loginPage.login('invalid@example.com', 'wrongpassword');

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText('이메일 또는 비밀번호가 올바르지 않습니다');
    });

    test('비활성화된 계정으로 로그인 시 적절한 메시지를 표시한다', async () => {
      const inactiveUser = await testDataManager.createInactiveUser();

      await loginPage.goto();
      await loginPage.login(inactiveUser.email, inactiveUser.password);

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText('이메일 인증을 완료해주세요');
    });

    test('Remember Me 체크박스가 올바르게 작동한다', async ({ page, context }) => {
      const user = await testDataManager.createActiveUser();

      await loginPage.goto();
      await loginPage.login(user.email, user.password, true); // Remember me 체크

      await loginPage.waitForRedirectToDashboard();

      // 쿠키 확인
      const cookies = await context.cookies();
      const rememberMeCookie = cookies.find(cookie => cookie.name === 'remember_me');
      expect(rememberMeCookie).toBeDefined();
      expect(rememberMeCookie?.expires).toBeGreaterThan(Date.now() / 1000 + 86400); // 하루 이상
    });
  });

  test.describe('로그아웃 프로세스', () => {
    test('로그인된 사용자가 로그아웃할 수 있다', async ({ page, context }) => {
      const user = await testDataManager.createActiveUser();

      // 로그인
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await loginPage.waitForRedirectToDashboard();

      // 로그아웃
      await dashboardPage.logout();

      // 로그인 페이지로 리다이렉트 확인
      await expect(page).toHaveURL('**/login');

      // 세션 쿠키 삭제 확인
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(cookie => cookie.name === 'session_token');
      expect(sessionCookie).toBeUndefined();
    });

    test('로그아웃 후 보호된 페이지에 접근하면 로그인 페이지로 리다이렉트된다', async ({ page }) => {
      const user = await testDataManager.createActiveUser();

      // 로그인
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await loginPage.waitForRedirectToDashboard();

      // 로그아웃
      await dashboardPage.logout();

      // 보호된 페이지 직접 접근 시도
      await page.goto('/dashboard');
      await expect(page).toHaveURL('**/login');

      await page.goto('/profile');
      await expect(page).toHaveURL('**/login');
    });
  });

  test.describe('비밀번호 재설정', () => {
    test('비밀번호 재설정 요청을 할 수 있다', async ({ page }) => {
      const user = await testDataManager.createActiveUser();

      await loginPage.goto();
      await loginPage.clickForgotPassword();

      await expect(page).toHaveURL('**/forgot-password');

      const forgotPasswordPage = new ForgotPasswordPage(page);
      await forgotPasswordPage.requestPasswordReset(user.email);

      await expect(forgotPasswordPage.successMessage).toBeVisible();
      await expect(forgotPasswordPage.successMessage).toContainText('비밀번호 재설정 링크를 이메일로 발송했습니다');
    });

    test('비밀번호 재설정 링크로 비밀번호를 변경할 수 있다', async ({ page }) => {
      const user = await testDataManager.createActiveUser();
      const resetToken = await testDataManager.generatePasswordResetToken(user.email);

      await page.goto(`/reset-password?token=${resetToken}`);

      const resetPasswordPage = new ResetPasswordPage(page);
      const newPassword = 'NewSecurePassword123!';
      
      await resetPasswordPage.resetPassword(newPassword, newPassword);

      await expect(resetPasswordPage.successMessage).toBeVisible();
      await expect(page).toHaveURL('**/login');

      // 새 비밀번호로 로그인 테스트
      await loginPage.login(user.email, newPassword);
      await loginPage.waitForRedirectToDashboard();
    });
  });
});
```

### 전자상거래 사용자 여정 테스트

```typescript
// tests/e2e/user-journey/ecommerce.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductListPage } from '../pages/ProductListPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage';
import { TestDataManager } from '../utils/TestDataManager';

test.describe('전자상거래 구매 여정', () => {
  let homePage: HomePage;
  let productListPage: ProductListPage;
  let productDetailPage: ProductDetailPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let orderConfirmationPage: OrderConfirmationPage;
  let testDataManager: TestDataManager;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    productListPage = new ProductListPage(page);
    productDetailPage = new ProductDetailPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    orderConfirmationPage = new OrderConfirmationPage(page);
    testDataManager = new TestDataManager();

    // 테스트 사용자 로그인
    const user = await testDataManager.createActiveUser();
    await testDataManager.loginUser(page, user);
  });

  test('사용자가 상품을 검색하고 구매할 수 있다', async ({ page }) => {
    // 1. 홈페이지에서 상품 검색
    await homePage.goto();
    await homePage.searchForProduct('노트북');

    // 2. 검색 결과 확인
    await expect(page).toHaveURL(/.*search.*query=노트북/);
    await productListPage.waitForProductsToLoad();
    
    const productCount = await productListPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);

    // 3. 첫 번째 상품 선택
    const firstProduct = await productListPage.getFirstProduct();
    const productName = await firstProduct.getName();
    const productPrice = await firstProduct.getPrice();
    
    await firstProduct.click();

    // 4. 상품 상세 페이지 확인
    await productDetailPage.waitForPageLoad();
    await expect(productDetailPage.productTitle).toContainText(productName);
    await expect(productDetailPage.productPrice).toContainText(productPrice);

    // 5. 상품을 장바구니에 추가
    await productDetailPage.selectQuantity(2);
    await productDetailPage.addToCart();

    // 6. 장바구니 팝업 확인
    await expect(productDetailPage.cartNotification).toBeVisible();
    await expect(productDetailPage.cartNotification).toContainText('장바구니에 추가되었습니다');

    // 7. 장바구니로 이동
    await productDetailPage.goToCart();
    await cartPage.waitForPageLoad();

    // 8. 장바구니 내용 확인
    const cartItems = await cartPage.getCartItems();
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0].name).toBe(productName);
    expect(cartItems[0].quantity).toBe(2);

    const totalPrice = await cartPage.getTotalPrice();
    expect(totalPrice).toBe(parseFloat(productPrice.replace(/[^\d.]/g, '')) * 2);

    // 9. 결제 진행
    await cartPage.proceedToCheckout();
    await checkoutPage.waitForPageLoad();

    // 10. 배송 정보 입력
    await checkoutPage.fillShippingInformation({
      fullName: '홍길동',
      address: '서울시 강남구 테헤란로 123',
      city: '서울',
      postalCode: '12345',
      phone: '010-1234-5678'
    });

    // 11. 결제 정보 입력
    await checkoutPage.fillPaymentInformation({
      cardNumber: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
      cardholderName: '홍길동'
    });

    // 12. 주문 확인
    const orderSummary = await checkoutPage.getOrderSummary();
    expect(orderSummary.itemCount).toBe(2);
    expect(orderSummary.subtotal).toBe(totalPrice);

    // 13. 주문 완료
    await checkoutPage.completeOrder();
    await orderConfirmationPage.waitForPageLoad();

    // 14. 주문 완료 확인
    await expect(orderConfirmationPage.successMessage).toBeVisible();
    await expect(orderConfirmationPage.successMessage).toContainText('주문이 완료되었습니다');

    const orderNumber = await orderConfirmationPage.getOrderNumber();
    expect(orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);

    // 15. 주문 상세 정보 확인
    const orderDetails = await orderConfirmationPage.getOrderDetails();
    expect(orderDetails.itemCount).toBe(2);
    expect(orderDetails.total).toBe(totalPrice + orderDetails.shipping + orderDetails.tax);
  });

  test('사용자가 장바구니에서 상품 수량을 변경할 수 있다', async ({ page }) => {
    // 사전 조건: 장바구니에 상품 추가
    const product = await testDataManager.addProductToCart();
    await cartPage.goto();

    // 1. 수량 증가
    await cartPage.increaseQuantity(product.id);
    await cartPage.waitForQuantityUpdate();

    let updatedQuantity = await cartPage.getItemQuantity(product.id);
    expect(updatedQuantity).toBe(product.quantity + 1);

    let updatedTotal = await cartPage.getTotalPrice();
    expect(updatedTotal).toBe(product.price * (product.quantity + 1));

    // 2. 수량 감소
    await cartPage.decreaseQuantity(product.id);
    await cartPage.waitForQuantityUpdate();

    updatedQuantity = await cartPage.getItemQuantity(product.id);
    expect(updatedQuantity).toBe(product.quantity);

    updatedTotal = await cartPage.getTotalPrice();
    expect(updatedTotal).toBe(product.price * product.quantity);
  });

  test('사용자가 장바구니에서 상품을 제거할 수 있다', async ({ page }) => {
    // 사전 조건: 장바구니에 여러 상품 추가
    const products = await testDataManager.addMultipleProductsToCart(3);
    await cartPage.goto();

    const initialItemCount = await cartPage.getItemCount();
    expect(initialItemCount).toBe(3);

    // 첫 번째 상품 제거
    await cartPage.removeItem(products[0].id);
    await cartPage.waitForItemRemoval();

    const updatedItemCount = await cartPage.getItemCount();
    expect(updatedItemCount).toBe(2);

    // 제거된 상품이 목록에 없는지 확인
    const isItemPresent = await cartPage.isItemPresent(products[0].id);
    expect(isItemPresent).toBe(false);
  });

  test('할인 쿠폰을 적용할 수 있다', async ({ page }) => {
    // 사전 조건
    const coupon = await testDataManager.createValidCoupon('SAVE20', 20); // 20% 할인
    const product = await testDataManager.addProductToCart();
    await cartPage.goto();

    const originalTotal = await cartPage.getTotalPrice();

    // 쿠폰 적용
    await cartPage.applyCoupon(coupon.code);
    await cartPage.waitForCouponApplication();

    // 할인 확인
    const discountAmount = await cartPage.getDiscountAmount();
    const finalTotal = await cartPage.getTotalPrice();

    expect(discountAmount).toBe(originalTotal * 0.2);
    expect(finalTotal).toBe(originalTotal - discountAmount);

    // 쿠폰 정보 표시 확인
    await expect(cartPage.appliedCoupon).toBeVisible();
    await expect(cartPage.appliedCoupon).toContainText(coupon.code);
  });

  test('재고 부족 상품은 구매할 수 없다', async ({ page }) => {
    // 사전 조건: 재고가 1개인 상품 생성
    const product = await testDataManager.createProductWithLimitedStock(1);
    
    await productDetailPage.goto(`/products/${product.id}`);
    await productDetailPage.waitForPageLoad();

    // 수량을 2개로 설정 시도
    await productDetailPage.selectQuantity(2);
    await productDetailPage.addToCart();

    // 재고 부족 메시지 확인
    await expect(productDetailPage.stockError).toBeVisible();
    await expect(productDetailPage.stockError).toContainText('재고가 부족합니다');

    // 장바구니에 추가되지 않음 확인
    const cartCount = await page.locator('[data-testid="cart-count"]').textContent();
    expect(cartCount).toBe('0');
  });

  test('게스트 사용자도 구매할 수 있다', async ({ page, context }) => {
    // 로그아웃하여 게스트 상태로 변경
    await context.clearCookies();
    
    // 상품을 장바구니에 추가
    await homePage.goto();
    await homePage.searchForProduct('책');
    await productListPage.getFirstProduct().then(product => product.click());
    await productDetailPage.addToCart();
    await productDetailPage.goToCart();

    // 결제 진행
    await cartPage.proceedToCheckout();

    // 게스트 결제 선택
    await checkoutPage.selectGuestCheckout();

    // 게스트 정보 입력
    await checkoutPage.fillGuestInformation({
      email: 'guest@example.com',
      fullName: '게스트 사용자',
      phone: '010-9876-5432'
    });

    // 배송 및 결제 정보 입력
    await checkoutPage.fillShippingInformation({
      fullName: '게스트 사용자',
      address: '부산시 해운대구 센텀로 456',
      city: '부산',
      postalCode: '48058',
      phone: '010-9876-5432'
    });

    await checkoutPage.fillPaymentInformation({
      cardNumber: '5555555555554444',
      expiryMonth: '03',
      expiryYear: '2026',
      cvv: '456',
      cardholderName: '게스트 사용자'
    });

    // 주문 완료
    await checkoutPage.completeOrder();
    await orderConfirmationPage.waitForPageLoad();

    // 게스트 주문 완료 확인
    await expect(orderConfirmationPage.successMessage).toBeVisible();
    const orderNumber = await orderConfirmationPage.getOrderNumber();
    expect(orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
  });
});
```

### 시각적 회귀 테스트

```typescript
// tests/e2e/visual/visual-regression.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductListPage } from '../pages/ProductListPage';

test.describe('시각적 회귀 테스트', () => {
  test('홈페이지 레이아웃이 변경되지 않았다', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForPageLoad();

    // 전체 페이지 스크린샷
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled'
    });

    // 헤더 영역만 스크린샷
    await expect(homePage.header).toHaveScreenshot('homepage-header.png');

    // 메인 컨텐츠 영역
    await expect(homePage.mainContent).toHaveScreenshot('homepage-main.png');
  });

  test('반응형 디자인이 올바르게 작동한다', async ({ page, browserName }) => {
    const homePage = new HomePage(page);
    
    // 다양한 뷰포트 크기에서 테스트
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1366, height: 768, name: 'desktop-medium' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await homePage.goto();
      await homePage.waitForPageLoad();

      await expect(page).toHaveScreenshot(`homepage-${viewport.name}-${browserName}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('다크 모드 테마가 올바르게 적용된다', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // 라이트 모드 스크린샷
    await expect(page).toHaveScreenshot('homepage-light-theme.png', {
      fullPage: true,
      animations: 'disabled'
    });

    // 다크 모드 전환
    await homePage.toggleDarkMode();
    await page.waitForTimeout(500); // 테마 전환 애니메이션 대기

    // 다크 모드 스크린샷
    await expect(page).toHaveScreenshot('homepage-dark-theme.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('상품 카드 레이아웃이 일관되다', async ({ page }) => {
    const productListPage = new ProductListPage(page);
    await productListPage.goto('/category/electronics');
    await productListPage.waitForProductsToLoad();

    // 첫 번째 상품 카드
    const firstProduct = productListPage.getProductCard(0);
    await expect(firstProduct).toHaveScreenshot('product-card-electronics.png');

    // 그리드 레이아웃 전체
    await expect(productListPage.productGrid).toHaveScreenshot('product-grid-electronics.png');
  });

  test('로딩 상태가 올바르게 표시된다', async ({ page }) => {
    // 네트워크 속도 제한하여 로딩 상태 캡처
    await page.route('**/api/products**', async route => {
      await page.waitForTimeout(2000); // 2초 지연
      await route.continue();
    });

    const productListPage = new ProductListPage(page);
    await productListPage.goto('/products');

    // 로딩 스피너 스크린샷
    await expect(productListPage.loadingSpinner).toHaveScreenshot('loading-spinner.png');
  });

  test('폼 유효성 검사 메시지가 올바르게 표시된다', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // 빈 폼 제출
    await loginPage.loginButton.click();

    // 유효성 검사 메시지들
    await expect(loginPage.emailInput).toHaveScreenshot('email-validation-error.png');
    await expect(loginPage.passwordInput).toHaveScreenshot('password-validation-error.png');

    // 잘못된 이메일 형식
    await loginPage.emailInput.fill('invalid-email');
    await loginPage.loginButton.click();
    
    await expect(loginPage.emailInput).toHaveScreenshot('email-format-error.png');
  });
});
```

### 성능 E2E 테스트

```typescript
// tests/e2e/performance/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('성능 테스트', () => {
  test('홈페이지 로딩 성능이 기준을 만족한다', async ({ page }) => {
    // Performance API를 사용하여 메트릭 수집
    await page.goto('/');

    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        // 네비게이션 타이밍
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        
        // 페인트 타이밍
        firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        
        // 리소스 타이밍
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      };
    });

    // 성능 기준 검증
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1500); // 1.5초 이내
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000); // 2초 이내
    expect(performanceMetrics.totalLoadTime).toBeLessThan(3000); // 3초 이내

    console.log('Performance Metrics:', performanceMetrics);
  });

  test('큰 이미지 로딩이 페이지 성능에 영향을 주지 않는다', async ({ page }) => {
    // 이미지 로딩 시작 시간 기록
    const startTime = Date.now();
    
    await page.goto('/gallery');
    
    // 첫 번째 이미지가 로드될 때까지 대기
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 이미지가 많은 페이지도 5초 이내에 로드되어야 함
    expect(loadTime).toBeLessThan(5000);
    
    // Lazy loading 확인
    const visibleImages = await page.locator('img[loading="lazy"]').count();
    expect(visibleImages).toBeGreaterThan(0);
  });

  test('검색 결과 페이지네이션이 빠르게 작동한다', async ({ page }) => {
    await page.goto('/search?q=laptop');
    
    // 첫 페이지 로딩 시간
    await page.waitForLoadState('networkidle');
    
    // 페이지 변경 시간 측정
    const startTime = Date.now();
    
    await page.click('[data-testid="page-2"]');
    await page.waitForLoadState('networkidle');
    
    const paginationTime = Date.now() - startTime;
    
    // 페이지네이션은 1초 이내에 완료되어야 함
    expect(paginationTime).toBeLessThan(1000);
  });

  test('장바구니 업데이트가 즉시 반영된다', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // 상품 페이지로 이동
    await page.goto('/products/laptop-123');
    
    // 장바구니 추가 시간 측정
    const startTime = Date.now();
    
    await page.click('[data-testid="add-to-cart"]');
    
    // 장바구니 카운터 업데이트 대기
    await page.waitForFunction(() => {
      const counter = document.querySelector('[data-testid="cart-count"]');
      return counter && counter.textContent !== '0';
    });
    
    const updateTime = Date.now() - startTime;
    
    // 장바구니 업데이트는 500ms 이내에 완료되어야 함
    expect(updateTime).toBeLessThan(500);
  });
});
```

### 접근성 테스트

```typescript
// tests/e2e/accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('접근성 테스트', () => {
  test('홈페이지가 WCAG 2.1 AA 기준을 만족한다', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('로그인 폼이 스크린 리더 친화적이다', async ({ page }) => {
    await page.goto('/login');
    
    // 폼 라벨 확인
    const emailInput = page.locator('[data-testid="email-input"]');
    const passwordInput = page.locator('[data-testid="password-input"]');
    
    await expect(emailInput).toHaveAttribute('aria-label', '이메일 주소');
    await expect(passwordInput).toHaveAttribute('aria-label', '비밀번호');
    
    // 오류 메시지 aria-describedby 확인
    await page.click('[data-testid="login-button"]');
    
    await expect(emailInput).toHaveAttribute('aria-describedby');
    await expect(passwordInput).toHaveAttribute('aria-describedby');
    
    // 접근성 스캔
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('키보드 네비게이션이 올바르게 작동한다', async ({ page }) => {
    await page.goto('/');
    
    // Tab 키로 네비게이션
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
    
    // Skip to main content 링크 확인
    await page.keyboard.press('Tab');
    const skipLink = page.locator('[data-testid="skip-to-main"]');
    await expect(skipLink).toBeFocused();
    
    await page.keyboard.press('Enter');
    const mainContent = page.locator('main');
    await expect(mainContent).toBeFocused();
  });

  test('색상 대비가 충분하다', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('동적 콘텐츠 변경이 스크린 리더에 알려진다', async ({ page }) => {
    await page.goto('/cart');
    
    // 수량 변경 시 aria-live 영역 확인
    await page.click('[data-testid="increase-quantity"]');
    
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toContainText('수량이 업데이트되었습니다');
  });
});
```

이 E2E 테스트 가이드는 SuperClaude AI 워크플로우를 활용하여 실제 사용자 시나리오를 포괄적으로 검증하는 방법을 제시합니다. 다음 파일에서는 품질 관리에 대해 다루겠습니다.