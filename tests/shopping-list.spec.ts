import { test, expect} from '@playwright/test';

// test.use({
//   storageState: 'john-auth.json',
// });

test('Shopping List Page: visible', async ({ page }) => {
await page.goto('http://localhost:3000/shopping-list');
await expect(page.getByText('Shopping ListKeep track of what you need to buyAdd Item +3Items to Buy1Items')).toBeVisible();
});

test('Adding an item to shopping list form', async ({ page }) => {
  await page.goto('http://localhost:3000/shopping-list');
  // Adding a new shopping list item
  await expect(page.getByRole('button', { name: 'Add Item +' })).toBeVisible();
  await page.getByRole('button', { name: 'Add Item +' }).click();
  await page.getByRole('textbox', { name: 'Enter item name' }).click();
  await page.getByRole('textbox', { name: 'Enter item name' }).fill('Bacon');
  await page.getByRole('textbox', { name: 'e.g., 2 lbs' }).click();
  await page.getByRole('textbox', { name: 'e.g., 2 lbs' }).fill('3 packs');
  await page.locator('div').filter({ hasText: /^CategoryProduceMeatDairyPantryOther$/ }).getByRole('combobox').selectOption('Meat');
  await page.locator('div').filter({ hasText: /^PriorityHighMediumLow$/ }).getByRole('combobox').selectOption('High');
  await page.getByRole('button', { name: 'Add to List' }).click();
  // Checking results
  await expect(page.getByText('Bacon').first()).toBeVisible();
});

// test('Checking off items in list', async ({ page }) => {
//   await page.goto('http://localhost:3000/shopping-list');
//   await expect(page.locator('body')).toContainText('Items to Buy (3)');
//   await expect(page.locator('body')).toContainText('3');
//   await expect(page.getByText('Milk1 gallon • Added Sep 9, 2025DairyHigh×')).toBeVisible();
//   // Checking off items
//   await page.locator('div').filter({ hasText: /^Milk1 gallon • Added Sep 9, 2025DairyHigh×$/ }).getByRole('checkbox').click();
//   await expect(page.getByText('Chicken Breast2 lbs • Added Sep 9, 2025MeatHigh×')).toBeVisible();
//   await page.locator('div').filter({ hasText: /^Chicken Breast2 lbs • Added Sep 9, 2025MeatHigh×$/ }).getByRole('checkbox').click();
//   // Seeing updated results in dashboard
//   await expect(page.locator('body')).toContainText('1');
//   await expect(page.locator('body')).toContainText('Items to Buy (1)');
//   await expect(page.locator('div').filter({ hasText: /^Recently Purchased \(3\)$/ })).toBeVisible();
//   await expect(page.locator('body')).toContainText('Recently Purchased (3)');
//   await expect(page.getByText('Milk1 gallon×')).toBeVisible();
//   await expect(page.getByText('Chicken Breast2 lbs×')).toBeVisible();
// });

// test('Rechecking and deleting items', async ({ page }) => {
//   await page.goto('http://localhost:3000/shopping-list');
//   await expect(page.locator('body')).toContainText('Recently Purchased (1)');
//   // Add a recently purchased item back to the shopping list
//   await page.getByText('Bananas').click();
//   await page.getByRole('checkbox').nth(3).uncheck();
//   await expect(page.locator('body')).toContainText('Items to Buy (4)');
//   // Delete an item from the shopping list
//   await expect(page.locator('body')).toContainText('4');
//   await expect(page.locator('body')).toContainText('Recently Purchased (0)');
//   await page.locator('div').filter({ hasText: /^Bread2 loaves • Added Sep 9, 2025PantryMedium×$/ }).getByRole('checkbox').click();
//   await page.locator('div').filter({ hasText: /^DairyHigh×$/ }).getByRole('button').click();
//   await page.locator('div').filter({ hasText: /^MeatHigh×$/ }).getByRole('button').click();
//   await page.getByRole('button', { name: '×' }).nth(1).click();
// });