import { test as setup, expect } from '@playwright/test';

// Authentication test
setup('Authenticate user sign-in', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.locator('#login-dropdown').click();
  await page.getByLabel('', { exact: true }).getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Username or Email' }).click();
  await page.getByRole('textbox', { name: 'Username or Email' }).fill('email@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('changeme');
  await Promise.all([
    page.waitForURL('http://localhost:3000/my-kitchen'),
    await page.getByRole('button', { name: 'Sign in', exact: true }).click(),
  ]);
  await expect(page.getByRole('button', { name: 'Test User' })).toBeVisible();

  // Save signed-in state to file
  await page.context().storageState({ path: 'tests/playwright-auth-sessions/test-user-auth.json' });
});