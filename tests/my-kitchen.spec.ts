import { test, expect} from '@playwright/test';

// Use stored authentication state
test.use({
  storageState: 'tests/playwright-auth-sessions/test-user-auth.json',
});

test('My Kitchen Page: visible', async ({ page }) => {
  await page.goto('http://localhost:3000/my-kitchen');
  await expect(page.getByRole('link', { name: 'My Kitchen' })).toBeVisible();
  // await expect(page.getByText('FilterAdd Item +Kitchen')).toBeVisible();
});

test('Adding an ingredient form', async ({ page }) => {
  await page.goto('http://localhost:3000/my-kitchen');
  // Filling out and submitting the form to add an ingredient
  await page.goto('http://localhost:3000/my-kitchen/');
  // await expect(page.getByRole('button', { name: 'Main House' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search...' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Filter' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Item +' })).toBeVisible();
  await page.getByRole('button', { name: 'Add Item +' }).click();
  await page.locator('#storageName').selectOption('3');
  await page.getByRole('textbox', { name: 'Item Name' }).click();
  await page.getByRole('textbox', { name: 'Item Name' }).fill('popsicles');
  await page.getByPlaceholder('Quantity').click();
  await page.getByPlaceholder('Quantity').click();
  await page.getByPlaceholder('Quantity').click();
  await page.getByPlaceholder('Quantity').dblclick();
  await page.getByPlaceholder('Quantity').click();
  await page.getByPlaceholder('Quantity').fill('12');
  await page.locator('#itemUnits').selectOption('BOX');
  await page.getByRole('button', { name: 'Add Item', exact: true }).click();
  
  // Verifying result submission in table
  await page.goto('http://localhost:3000/my-kitchen');
  await expect(page.getByRole('heading', { name: 'Freezer Chest' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'popsicles' })).toBeVisible();

});

test('Filtering Ingredients Table', async ({ page }) => {
  await page.goto('http://localhost:3000/my-kitchen');
  // Filter is invisible and options are applicable
  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('slider').fill('12');
  await page.locator('div').filter({ hasText: /^Low Stock$/ }).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.locator('div').filter({ hasText: /^Out of Stock$/ }).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.locator('div').filter({ hasText: /^Expired$/ }).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Apply' }).click();
  
  // Reset filter
  await page.getByRole('button', { name: 'Reset' }).click();
});

// NEED TO DO:
// Adding/deleting a storage space
// Adding/deleting a new location
// Editing/Deleting an ingredient from a storage space
// More filtering and searching

// test('Adding a storage space form', async ({ page }) => {
//   await page.goto('http://localhost:3000/my-kitchen');
//   await page.getByRole('button', { name: 'Add Storage +' }).click();
//   await page.locator('#storageType').selectOption('PANTRY');
//   await page.getByRole('textbox', { name: 'Storage Name' }).click();
//   await page.getByRole('textbox', { name: 'Storage Name' }).fill('');
//   await page.locator('#storageType').selectOption('FRIDGE');
//   await page.getByRole('textbox', { name: 'Storage Name' }).click();
//   await page.getByRole('textbox', { name: 'Storage Name' }).fill('Mini-fridge');
//   await page.getByRole('button', { name: 'Add Pantry' }).click();

//   // New fridge is populated
//   await page.goto('http://localhost:3000/my-kitchen');
//   await expect(page.getByRole('heading', { name: 'Mini-fridge' })).toBeVisible();

// });

// test('Editing and Deleting an item', async ({ page }) => {
//   await page.goto('http://localhost:3000/my-kitchen');
//   // Edit an item in a storage location
  
//   await page.goto('http://localhost:3000/my-kitchen');
//   await page.getByRole('row', { name: 'lettuce 6 bundle(s) 10/1/2025' }).getByRole('button').first().click();
//   await page.getByRole('textbox', { name: 'Item Name' }).click();
//   await page.getByRole('textbox', { name: 'Item Name' }).click();
//   await page.getByRole('textbox', { name: 'Item Name' }).press('ArrowRight');
//   await page.getByRole('textbox', { name: 'Item Name' }).press('ArrowRight');
//   await page.getByRole('textbox', { name: 'Item Name' }).press('ArrowRight');
//   await page.getByRole('textbox', { name: 'Item Name' }).fill('lettuce');
//   await page.getByPlaceholder('Quantity').click();
//   await page.getByPlaceholder('Quantity').fill('2');
//   await page.getByRole('button', { name: 'Save Changes' }).click();
//   await page.getByRole('button', { name: 'Close' }).click();
  
//   // Verify results from editing
//   await expect(page.locator('body')).toContainText('15');
//   await expect(page.locator('body')).toContainText('Low Stock');
//   // Delete an item
//   await page.locator('tr:nth-child(2) > .p-3.flex > .text-gray-600.hover\\:text-red-600').first().click();
// });




// test('Adding another location', async ({ page }) => {
//   await page.goto('http://localhost:3000/my-kitchen');
//   // Checking tabs for multiple locations (homes)
//   await page.locator('.lucide.lucide-circle-plus').click();
//   await page.getByRole('textbox', { name: 'House Name' }).click();
//   await page.getByRole('textbox', { name: 'House Name' }).fill('House 2');
//   await page.getByRole('button', { name: 'Add House' }).click();
//   await expect(page.getByRole('button', { name: 'House 2' })).toBeVisible();
//   await page.goto('http://localhost:3000/my-kitchen');
//   await page.getByRole('button', { name: 'House 2' }).click();
// });