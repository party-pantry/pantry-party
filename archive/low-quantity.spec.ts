import { test, expect} from '@playwright/test';

// test.use({
//   storageState: 'john-auth.json',
// });

test('Low-Quantity Page: visible', async ({ page }) => {
  await page.goto('http://localhost:3000/low-quantity');
  await page.getByRole('link', { name: 'Low-quantity' }).click();
  await expect(page.locator('div').filter({ hasText: 'ItemsQuantityAmount of' })).toBeVisible();
});

test('Table and items visible', async ({ page }) => {
  await page.goto('http://localhost:3000/low-quantity');
  await expect(page.locator('thead').getByRole('cell').filter({ hasText: /^$/ })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Items' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Quantity' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Amount of Stocks' })).toBeVisible();
  await page.getByRole('row', { name: 'Egg 0 Out of Stock' }).getByRole('checkbox').check();
  await page.getByRole('row', { name: 'Milk 2 Low Stock' }).getByRole('checkbox').check();
});
