import { test, expect} from '@playwright/test';

// test.use({
//   storageState: 'john-auth.json',
// });

test('Shopping List Page: visible', async ({ page }) => {
await page.goto('http://localhost:3000/shopping-list');
await page.getByRole('link', { name: 'Shopping List' }).click();
await expect(page.getByText('Shopping ListKeep track of what you need to buyAdd Item +3Items to Buy1Items')).toBeVisible();
});

test('Adding an item to list form', async ({ page }) => {
  await page.goto('http://localhost:3000/shopping-list');
  // Checking tabs for multiple locations (homes)
  await expect(page.getByRole('link', { name: 'Home 1' })).toBeVisible();
  await page.getByRole('link', { name: 'Home 2' }).click();
  await page.getByRole('link', { name: 'Home 3' }).click();
  await page.getByRole('link', { name: 'Home 1' }).click();
  
  // Filling out and submitting the form to add an ingredient
  await page.getByRole('button', { name: 'Add Item +' }).click();
  await page.getByRole('textbox', { name: 'Item Name' }).click();
  await page.getByRole('textbox', { name: 'Item Name' }).fill('Bread');
  await page.getByPlaceholder('Quantity').click();
  await page.getByPlaceholder('Quantity').fill('15');
  await page.getByRole('button', { name: 'Add Item', exact: true }).click();

  // Verifying result submission in table
  await expect(page.getByRole('cell', { name: 'Bread' }).nth(1)).toBeVisible();
  await expect(page.getByRole('cell', { name: '15' }).nth(1)).toBeVisible();
  await expect(page.locator('body')).toContainText('Good');
});

test('Adding a storage space form', async ({ page }) => {
  await page.goto('http://localhost:3000/my-kitchen');
  await page.getByRole('button', { name: 'Add Storage +' }).click();
  await page.getByRole('textbox', { name: 'Storage Name' }).click();
  await page.getByRole('textbox', { name: 'Storage Name' }).fill('Fridge 3');
  await page.getByRole('textbox', { name: 'Storage Type' }).click();
  await page.getByRole('textbox', { name: 'Storage Type' }).fill('Fridge');
  await page.getByRole('button', { name: 'Add Pantry' }).click();
  await expect(page.locator('div').filter({ hasText: /^Fridge 3$/ })).toBeVisible();
  // New fridge is populated
  await page.locator('div:nth-child(6) > .p-4').click();
  await page.locator('div:nth-child(6) > .p-4 > .w-full > tbody > tr:nth-child(5) > td > input').check();

});

test('Editing and Deleting an item', async ({ page }) => {
  await page.goto('http://localhost:3000/my-kitchen');
  // Edit an item in a storage location
  await page.locator('.text-gray-600').first().click();
  await page.getByPlaceholder('Quantity').click();
  await page.getByPlaceholder('Quantity').fill('15');
  await page.locator('#itemStatus').selectOption('Low Stock');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  
  // Verify results from editing
  await expect(page.locator('body')).toContainText('15');
  await expect(page.locator('body')).toContainText('Low Stock');
  // Delete an item
  await page.locator('tr:nth-child(2) > .p-3.flex > .text-gray-600.hover\\:text-red-600').first().click();
});

test('Filtering Ingredients Table', async ({ page }) => {
  await page.goto('http://localhost:3000/my-kitchen');
  // Filter is invisible and options are applicable
  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('textbox', { name: 'Search...' }).click();
  await page.getByRole('textbox', { name: 'Search...' }).fill('ba');
  await page.getByRole('slider').fill('14');
  await page.locator('div').filter({ hasText: /^Low Stock$/ }).getByRole('checkbox').check();
  await page.locator('div').filter({ hasText: /^Out of Stock$/ }).getByRole('checkbox').check();
  await page.locator('div').filter({ hasText: /^Expired$/ }).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByRole('cell', { name: 'No items found.' }).first()).toBeVisible();
  await page.locator('div').filter({ hasText: /^Expired$/ }).getByRole('checkbox').uncheck();
  await page.getByRole('slider').fill('21');
  await page.getByRole('textbox', { name: 'Search...' }).click();
  await page.getByRole('textbox', { name: 'Search...' }).fill('b');
  await page.getByRole('button', { name: 'Apply' }).click();
  // Check results of filtering
  await expect(page.getByRole('cell', { name: 'Bread' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Butter' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Filter' })).toBeVisible();
  // Reset filter
  await page.getByRole('button', { name: 'Reset' }).click();
});

