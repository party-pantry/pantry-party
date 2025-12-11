import { test, expect} from '@playwright/test';

// Use stored authentication state
test.use({
  storageState: 'tests/playwright-auth-sessions/test-user-auth.json',
});

test('Shopping List Page: visible', async ({ page }) => {
  await page.goto('http://localhost:3000/shopping-list');
});

test('Add an item into the shopping list form', async ({ page }) => {
  await page.goto('http://localhost:3000/shopping-list');
  await page.getByRole('button', { name: 'Add Item +' }).click();
  await page.getByLabel('Item Name').fill('Bananas');
  await page.getByLabel('Quantity').fill('3');
  await page.getByLabel('Price ($)').fill('2.50');
  await page.getByLabel('Category').selectOption('Produce');
  await page.getByLabel('Priority').selectOption('High');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Bananas')).toBeVisible();
});

test('Checking off an item moves it to Purchased section', async ({ page }) => {
  await page.goto('http://localhost:3000/shopping-list');
  const itemRow = page.getByText('Bananas');
  await expect(itemRow).toBeVisible();
  await page.getByRole('button', { name: 'Multi-select' }).click();
  await itemRow.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Mark as Bought' }).click();
  await page.getByRole('button', { name: /Show Purchased/ }).click();
  await expect(page.getByText('Bananas')).toBeVisible();
});

test('Rechecking off an item moves it back to the Shopping List', async ({ page }) => {
  await page.goto('http://localhost:3000/shopping-list');
  await page.getByRole('button', { name: /Show Purchased/ }).click();
  const purchasedItem = page.getByText('Bananas');
  await expect(purchasedItem).toBeVisible();
  await purchasedItem.getByRole('checkbox').check();
  await expect(purchasedItem).not.toBeVisible();
  await expect(page.getByText('Bananas')).toBeVisible();
});

test('Delete items in Shopping List and Recently Purchased', async ({ page }) => {
  await page.goto('http://localhost:3000/shopping-list');
  const item = page.getByText('Bananas');
  await expect(item).toBeVisible();
  await item.getByRole('button', { name: /Remove|Delete/ }).click();
  await expect(page.getByText('Bananas')).not.toBeVisible();
  await page.getByRole('button', { name: 'Add Item +' }).click();
  await page.getByLabel('Item Name').fill('Milk');
  await page.getByLabel('Quantity').fill('1');
  await page.getByLabel('Price ($)').fill('3');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Milk')).toBeVisible();
  await page.getByRole('button', { name: 'Multi-select' }).click();
  await page.getByText('Milk').getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Mark as Bought' }).click();
  await page.getByRole('button', { name: /Show Purchased/ }).click();
  const purchasedMilk = page.getByText('Milk');
  await expect(purchasedMilk).toBeVisible();
  await purchasedMilk.getByRole('button', { name: /Remove|Delete/ }).click();
  await expect(page.getByText('Milk')).not.toBeVisible();
});

test('Add item from suggestions into shopping list', async ({ page }) => {
  await page.goto('http://localhost:3000/shopping-list');
  const suggestionsSection = page.getByText(/Suggestions/i);
  await expect(suggestionsSection).toBeVisible();
  const firstSuggestion = page.locator('.suggestion-card').first();
  const suggestedName = await firstSuggestion.locator('.suggestion-name').innerText();
  await firstSuggestion.getByLabel(/Quantity/i).fill('2');
  await firstSuggestion.getByRole('button', { name: /Add/i }).click();
  await expect(page.getByText(suggestedName)).toBeVisible();
});
