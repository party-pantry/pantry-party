import { test, expect} from '@playwright/test';

// Use stored authentication state
test.use({
  storageState: 'tests/playwright-auth-sessions/test-user-auth.json',
});

test('Recipes Page: visible', async ({ page }) => {
  await page.goto('http://localhost:3000/recipes'); 
  // Nav link works with visible page
  await page.getByRole('link', { name: 'Recipes' }).click();
  await expect(page.locator('div').filter({ hasText: /^Add Recipe \+$/ })).toBeVisible();
  await expect(page.getByText('FilterSort')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: 'Tomato Scrambled EggsEasyA' }).nth(1)).toBeVisible();
});

test('Recipe cards, buttons visible', async ({ page }) => {
  await page.goto('http://localhost:3000/recipes');
  // Recipe cards visible with buttons
  await expect(page.getByText('Chicken Breast SaladEasyHealthy and protein-rich salad with grilled chicken and')).toBeVisible();
  await page.getByRole('button', { name: 'Start Cooking' }).nth(1).click();
  await page.getByRole('button', { name: 'Add Missing Ingredients' }).nth(1).click();
  await expect(page.getByText('25 minutes')).toBeVisible();
  await expect(page.getByText('Ingredients You Have: chicken breast, tomato, lettuce, salt, olive oil')).toBeVisible();
  await expect(page.getByRole('paragraph').filter({ hasText: 'Match: 71%' })).toBeVisible();
});

test('Test specific recipe page', async ({ page }) => {
  await page.goto('http://localhost:3000/recipes');
  // Go to a specific recipe page
  await page.getByRole('button', { name: 'View Recipe' }).nth(1).click();
  // await page.goto('http://localhost:3000/recipe/2/chicken-breast-salad');
  await expect(page.getByText('Chicken Breast SaladEasyMatch')).toBeVisible();
  await page.getByRole('button', { name: 'Add Missing Ingredients to' }).click();
  await page.getByRole('button', { name: 'Start Cooking' }).click();
  await page.locator('.lucide.lucide-plus').click();
  await expect(page.getByText('Instructions1Season chicken')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Nutrition Info$/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ingredients' })).toBeVisible();
});

