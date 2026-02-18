import { test, expect, Page } from '@playwright/test';

test.describe('Ripplet DApp E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. Home page loads', async ({ page }) => {
    await expect(page).toHaveTitle(/Ripplet/);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText('Welcome to Ripplet')).toBeVisible();
  });

  test('2. Navigation works', async ({ page }) => {
    await page.click('a[href="/payment"]');
    await expect(page).toHaveURL('/payment');
    await expect(page.getByRole('heading', { name: 'Connect Your Wallet' })).toBeVisible();
    
    await page.click('a[href="/trustset"]');
    await expect(page).toHaveURL('/trustset');
    await expect(page.getByRole('heading', { name: 'Connect Your Wallet' })).toBeVisible();
    
    await page.click('a[href="/accountset"]');
    await expect(page).toHaveURL('/accountset');
    await expect(page.getByRole('heading', { name: 'Connect Wallet' })).toBeVisible();
    
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Welcome to Ripplet')).toBeVisible();
  });

  test('3. Language toggle', async ({ page }) => {
    const langButton = page.locator('button:has-text("EN")').first();
    await expect(langButton).toBeVisible();
    
    await langButton.click();
    
    await expect(page.getByText('English')).toBeVisible();
    await expect(page.getByText('中文')).toBeVisible();
    
    await page.click('button:has-text("中文")');
    
    await expect(page.getByText('欢迎使用 Ripplet')).toBeVisible();
    
    const langButtonZh = page.locator('button:has-text("ZH")').first();
    await langButtonZh.click();
    await page.click('button:has-text("English")');
    
    await expect(page.getByText('Welcome to Ripplet')).toBeVisible();
  });

  test('4. Network switcher', async ({ page }) => {
    const networkButton = page.locator('button:has-text("XRPL Mainnet")').first();
    await expect(networkButton).toBeVisible();
    
    await networkButton.click();
    
    const dropdown = page.locator('.absolute.right-0.mt-2');
    await expect(dropdown.getByText('XRPL Mainnet')).toBeVisible();
    await expect(dropdown.getByText('XRPL Testnet')).toBeVisible();
    
    const mainnetOption = dropdown.locator('button:has-text("XRPL Mainnet")');
    await expect(mainnetOption.locator('svg')).toBeVisible();
  });

  test('5. Wallet connect modal', async ({ page }) => {
    const connectButton = page.locator('button:has-text("Connect Wallet")').first();
    await expect(connectButton).toBeVisible();
    
    await connectButton.click();
  });

  test('6. Payment form renders', async ({ page }) => {
    await page.goto('/payment');
    
    await expect(page.getByRole('heading', { name: 'Connect Your Wallet' })).toBeVisible();
    await expect(page.getByText('Please connect your wallet to send payments')).toBeVisible();
  });

  test('7. TrustSet form renders', async ({ page }) => {
    await page.goto('/trustset');
    
    await expect(page.getByRole('heading', { name: 'Connect Your Wallet' })).toBeVisible();
    await expect(page.getByText('Connect your wallet to create or modify trust lines')).toBeVisible();
  });

  test('8. AccountSet form renders', async ({ page }) => {
    await page.goto('/accountset');
    
    await expect(page.getByRole('heading', { name: 'Connect Wallet' })).toBeVisible();
    await expect(page.getByText('Connect your wallet to modify account settings')).toBeVisible();
  });

  test('9. Sidebar active state', async ({ page }) => {
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toHaveClass(/bg-cyan-500/);
    
    await page.click('a[href="/payment"]');
    const paymentLink = page.locator('a[href="/payment"]');
    await expect(paymentLink).toHaveClass(/bg-cyan-500/);
    
    await expect(homeLink).not.toHaveClass(/bg-cyan-500/);
  });

  test('10. Responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });
});
