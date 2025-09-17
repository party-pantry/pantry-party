import { test, expect} from '@playwright/test';

// test.use({
//   storageState: 'john-auth.json',
// });

test('Recipes Page: visible', async ({ page }) => {
  await page.goto('http://localhost:3000/recipes'); 
  // Nav link works with visible page
  await page.getByRole('link', { name: 'Recipes' }).click();
  await expect(page.getByText('Recipe SuggestionsFind recipes based on ingredients you already have!🍳Tomato')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recipe Suggestions' })).toBeVisible();
});

test('Recipe cards, buttons visible', async ({ page }) => {
  await page.goto('http://localhost:3000/my-recipes');
  // Recipe cards visible with buttons
  await expect(page.getByText('🍳Tomato Scrambled EggsEasyA')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Missing to Shopping List' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Add Missing to Shopping List' }).first().click();
  // Browsing options visible
  await expect(page.getByText('Can\'t find what you\'re looking for?Try adding more ingredients to your kitchen')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Browse All Recipes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add More Ingredients' })).toBeVisible();
  await page.getByRole('button', { name: 'Browse All Recipes' }).click();
  await page.getByRole('button', { name: 'View Recipe' }).first().click();
});

