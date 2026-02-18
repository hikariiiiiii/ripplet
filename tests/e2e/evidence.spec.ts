import { test } from '@playwright/test';

test('Capture evidence screenshots', async ({ page }) => {
  // Home page
  await page.goto('/');
  await page.screenshot({ path: '.sisyphus/evidence/task-23-home.png', fullPage: true });
  
  // Payment page
  await page.goto('/payment');
  await page.screenshot({ path: '.sisyphus/evidence/task-23-payment.png', fullPage: true });
  
  // TrustSet page
  await page.goto('/trustset');
  await page.screenshot({ path: '.sisyphus/evidence/task-23-trustset.png', fullPage: true });
  
  // AccountSet page
  await page.goto('/accountset');
  await page.screenshot({ path: '.sisyphus/evidence/task-23-accountset.png', fullPage: true });
  
  // Network switcher dropdown
  await page.goto('/');
  await page.locator('button:has-text("XRPL Mainnet")').first().click();
  await page.screenshot({ path: '.sisyphus/evidence/task-23-network-switcher.png' });
  
  // Language toggle dropdown
  await page.goto('/');
  await page.locator('button:has-text("EN")').first().click();
  await page.screenshot({ path: '.sisyphus/evidence/task-23-language-toggle.png' });
});
