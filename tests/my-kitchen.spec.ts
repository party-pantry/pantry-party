import { test, expect} from '@playwright/test';

// Use stored authentication state
test.use({
  storageState: 'tests/playwright-auth-sessions/test-user-auth.json',
});

test('My Kitchen Page: visible', async ({ page }) => {
  await page.goto('http://localhost:3000/my-kitchen');
});

test('Add and delete a Storage space', async ({ page }) => {
  await page.goto('http://localhost:3000/my-kitchen');
  await page.getByRole('button', { name: 'Add Storage +' }).click();
  await page.getByLabel(/Name/i).fill('Freezer X');
  await page.getByLabel(/Type/i).selectOption('Freezer');
  await page.getByRole('button', { name: /Add/i }).click();
  await expect(page.getByText('Freezer X')).toBeVisible();

  const storageHeader = page.locator(`text=Freezer X`).first();
  await storageHeader.getByRole('button', { name: /Edit|Delete|Options/i }).click();
  await page.getByRole('button', { name: /Delete Storage/i }).click();
  await page.getByRole('button', { name: /Confirm|Delete/i }).click();
  await expect(page.getByText('Freezer X')).not.toBeVisible();
});

test('Add and delete a Home location', async ({ page }) => {
  await page.goto('http://localhost:3000/my-kitchen');
  await page.getByRole('button', { name: /Add Home/i }).click();
  await page.getByLabel(/House Name/i).fill('Beach House');
  await page.getByLabel(/Address/i).fill('123 Ocean');
  await page.getByRole('button', { name: /Add/i }).click();
  await expect(page.getByRole('tab', { name: 'Beach House' })).toBeVisible();
  await page.getByRole('tab', { name: 'Beach House' }).click();
  await page.getByRole('button', { name: /Delete Home/i }).click();
  await page.getByRole('button', { name: /Confirm|Delete/i }).click();
  await expect(page.getByRole('tab', { name: 'Beach House' })).not.toBeVisible();
});

test('Edit and delete an item inside a storage space', async ({ page }) => {
  await page.goto('http://localhost:3000/my-kitchen');
  const firstStorage = page.locator('.storage-container').first();
  await page.getByRole('button', { name: 'Add Item +' }).click();
  await page.getByLabel(/Name/i).fill('Tomatoes');
  await page.getByLabel(/Quantity/i).fill('4');
  await page.getByLabel(/Unit/i).selectOption('pcs');
  await page.getByLabel(/Status/i).selectOption('Good');
  await page.getByRole('button', { name: /Add/i }).click();
  await expect(page.getByText('Tomatoes')).toBeVisible();

  const itemRow = page.locator('tr', { hasText: 'Tomatoes' });
  await itemRow.getByRole('button', { name: /Edit/i }).click();
  await page.getByLabel(/Quantity/i).fill('8');
  await page.getByRole('button', { name: /Update/i }).click();
  await expect(itemRow.getByText(/8/)).toBeVisible();
  await itemRow.getByRole('button', { name: /Delete/i }).click();
  await page.getByRole('button', { name: /Confirm|Delete/i }).click();
  await expect(page.getByText('Tomatoes')).not.toBeVisible();
});

test('Filter and Search items in the inventory', async ({ page }) => {
  await page.goto('http://localhost:3000/my-kitchen');
  await page.getByRole('button', { name: 'Add Item +' }).click();
  await page.getByLabel(/Name/i).fill('Apple');
  await page.getByLabel(/Quantity/i).fill('10');
  await page.getByLabel(/Status/i).selectOption('Good');
  await page.getByRole('button', { name: /Add/i }).click();

  await page.getByRole('button', { name: 'Add Item +' }).click();
  await page.getByLabel(/Name/i).fill('Carrots');
  await page.getByLabel(/Quantity/i).fill('1');
  await page.getByLabel(/Status/i).selectOption('Low Stock');
  await page.getByRole('button', { name: /Add/i }).click();

  await page.getByPlaceholder('Search items...').fill('Apple');
  await expect(page.getByText('Apple')).toBeVisible();
  await expect(page.getByText('Carrots')).not.toBeVisible();
  await page.getByPlaceholder('Search items...').fill('');
  await page.getByRole('button', { name: /Filter/i }).click();
  await page.getByLabel('Low Stock').check();
  await page.getByRole('button', { name: /Apply/i }).click();
  await expect(page.getByText('Carrots')).toBeVisible();
  await expect(page.getByText('Apple')).not.toBeVisible();
  await page.getByRole('button', { name: /Filter/i }).click();
  await page.getByRole('button', { name: /Clear/i }).click();
});
