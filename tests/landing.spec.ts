import { test, expect } from '@playwright/test';

// test.use({
//   storageState: 'john-auth.json',
// });

test('Landing Page: appears, has title', async ({ page }) => {
  await page.goto('http://localhost:3000//');await page.goto('http://localhost:3000/');
  // Expect a title "to contain" a substring.
  // await expect(page).toHaveTitle(/Pantry/);
});

test('renavigate home, get started button', async ({ page }) => {
  await page.goto('http://localhost:3000//');
  // // Click the party pantry logo in nav bar
  await page.getByRole('link', { name: 'Pantry Party Logo' }).click();
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page.getByText('FeaturesMultiple Location')).toBeVisible();
  await page.getByRole('button', { name: 'Get Started' }).click();
});
