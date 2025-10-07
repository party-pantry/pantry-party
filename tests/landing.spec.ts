import { test, expect } from '@playwright/test';


test('Landing Page: appears, has title', async ({ page }) => {
  await page.goto('http://localhost:3000//');await page.goto('http://localhost:3000/');
});

test('renavigate home, get started button', async ({ page }) => {
  await page.goto('http://localhost:3000//');
  // // Click the party pantry logo in nav bar
  await page.getByRole('link', { name: 'Pantry Party Logo' }).click();
  await expect(page.getByText('FeaturesMultiple Location')).toBeVisible();
  await expect(page.locator('#home').getByRole('button', { name: 'Sign In' })).toBeVisible();
  await expect(page.locator('#home').getByRole('button', { name: 'Sign Up' })).toBeVisible();
  await page.locator('#home').getByRole('button', { name: 'Sign In' }).click();
  // await page.getByRole('button', { name: 'Get Started' }).click();
  // await expect(page.getByText('FeaturesMultiple Location')).toBeVisible();
  // await page.getByRole('button', { name: 'Get Started' }).click();
});
