import { test, expect} from '@playwright/test';

// Use stored authentication state
test.use({
  storageState: 'tests/playwright-auth-sessions/test-user-auth.json',
});

test('Shopping List Page: visible', async ({ page }) => {
await page.goto('http://localhost:3000/shopping-list');
// await expect(page.locator('div').filter({ hasText: 'Recently Purchased (1)' }).nth(2)).toBeVisible();
});

// test('Adding an item to shopping list form', async ({ page }) => {
//   await page.goto('http://localhost:3000/shopping-list');
//   // Adding a new shopping list item
//   await expect(page.getByRole('button', { name: 'Add Item +' })).toBeVisible();
//   await page.getByRole('button', { name: 'Add Item +' }).click();
//   await page.getByRole('textbox', { name: 'Enter item name' }).click();
//   await page.getByRole('textbox', { name: 'Enter item name' }).fill('Bacon');
//   await page.getByRole('textbox', { name: 'e.g., 2 lbs' }).click();
//   await page.getByRole('textbox', { name: 'e.g., 2 lbs' }).fill('3 packs');
//   await page.locator('div').filter({ hasText: /^CategoryProduceMeatDairyPantryOther$/ }).getByRole('combobox').selectOption('Meat');
//   await page.locator('div').filter({ hasText: /^PriorityHighMediumLow$/ }).getByRole('combobox').selectOption('High');
//   await page.getByRole('button', { name: 'Add to List' }).click();
//   // Checking results
//   await expect(page.getByText('Bacon').first()).toBeVisible();
//   await page.getByRole('button', { name: '×' }).nth(2).click();
// });

// test('Checking off items in list', async ({ page }) => {
//   await page.goto('http://localhost:3000/shopping-list');
//   // Checking off items
//   await page.getByRole('checkbox').first().check();
//   await page.getByRole('checkbox').first().uncheck();
//   await page.getByRole('checkbox').nth(1).uncheck();
//   await page.getByRole('checkbox').nth(2).uncheck();
//   await page.getByRole('checkbox').nth(3).uncheck();
//   await page.getByRole('checkbox').first().check();
//   await page.getByRole('checkbox').first().uncheck();
//   await page.getByRole('checkbox').nth(1).uncheck();
//   await page.getByRole('checkbox').nth(1).check();
//   await page.getByRole('checkbox').nth(1).uncheck();
//   await page.getByRole('checkbox').nth(2).uncheck();
//   await page.getByRole('checkbox').nth(3).uncheck();

//   // Seeing updated results in dashboard
  
//   await page.getByRole('checkbox').nth(2).check();
//   await page.getByRole('checkbox').nth(1).check();
//   await expect(page.getByText('1Items to Buy')).toBeVisible();
//   await expect(page.getByText('3Items Purchased')).toBeVisible();
// });

// test('Rechecking and deleting items', async ({ page }) => {
//   await page.goto('http://localhost:3000/shopping-list');
//   // Add a recently purchased item back to the shopping list
//   await page.getByRole('checkbox').nth(3).uncheck();
//   await page.getByRole('checkbox').nth(3).check();
  
//   // Delete an item from the shopping list
//   await page.getByRole('button', { name: '×' }).nth(3).click();
//   await page.locator('div').filter({ hasText: /^DairyHigh×$/ }).getByRole('button').click();
//   await expect(page.getByText('0Items Purchased')).toBeVisible();
//   await expect(page.getByText('2Items to Buy')).toBeVisible();
// });