import { test, expect} from '@playwright/test';

// test.use({
//   storageState: 'john-auth.json',
// });

test('Pop-up Page: visible', async ({ page }) => {
  await page.goto('http://localhost:3000/pop-up'); 
  await page.getByRole('link', { name: 'Popup' }).click();
  await expect(page.locator('div').filter({ hasText: 'Add Item' })).toBeVisible();
});

test('Button visible and form inputs', async ({ page }) => {
  await page.goto('http://localhost:3000/pop-up');
  await expect(page.getByRole('button', { name: 'Add Item' })).toBeVisible();
  // Adding an item (pop-up form)
  await page.getByRole('button', { name: 'Add Item' }).click();
  await expect(page.getByText('Add ItemName of item:Quantity')).toBeVisible();
  await page.getByRole('textbox', { name: 'Enter name of item(s)' }).click();
  await page.getByRole('textbox', { name: 'Enter name of item(s)' }).fill('Rice');
  await page.getByPlaceholder('Enter number of items').click();
  await page.getByPlaceholder('Enter number of items').fill('2');
  await page.getByPlaceholder('Enter price per item').click();
  await page.getByPlaceholder('Enter price per item').fill('3.88');
  await page.getByRole('textbox', { name: 'Enter storage location' }).click();
  await page.getByRole('textbox', { name: 'Enter storage location' }).fill('Pantry');
  await expect(page.getByText('CancelConfirm')).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.locator('div').filter({ hasText: 'Add Item' })).toBeVisible();
  await page.getByRole('button', { name: 'Add Item' }).click();
  // Cancelling an item (pop-up form)
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('div').filter({ hasText: 'Add Item' })).toBeVisible();
});