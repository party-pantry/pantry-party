import { test, expect} from '@playwright/test';

// Use stored authentication state
test.use({
  storageState: 'tests/playwright-auth-sessions/test-user-auth.json',
});

// test('Recipes Page: visible', async ({ page }) => {
//   await page.goto('http://localhost:3000/recipes'); 
//   // Nav link works with visible page
//   await page.getByRole('link', { name: 'Recipes' }).click();
//   // await expect(page.locator('div').filter({ hasText: /^Add Recipe \+$/ })).toBeVisible();
//   await expect(page.getByText('FilterSort')).toBeVisible();
//   const recipeCard = page.getByTestId('recipe-card').first();
//   await expect(recipeCard).toBeVisible();
// });

// test('Recipe cards, buttons visible', async ({ page }) => {
//   await page.goto('http://localhost:3000/recipes');
//   // Recipe cards visible with buttons
//   const firstRecipe = page.getByTestId('recipe-card').first();
//   await expect(firstRecipe).toBeVisible();

//   await page.getByRole('button', { name: 'View More Details' }).nth(1).click();
//   await expect(page.getByText('Total Time')).toBeVisible();
//   await expect(page.getByText('Ingredients Match')).toBeVisible();
//   await expect(page.getByText('Rating')).toBeVisible();
// });

// test('Test specific recipe page', async ({ page }) => {
//   await page.goto('http://localhost:3000/recipes');
//   // Go to a specific recipe page
//   const viewRecipeButton = page.getByRole('button', { name: 'View More Details' }).nth(1);
//   await expect(viewRecipeButton).toBeVisible();
//   await viewRecipeButton.click();

//   await page.getByRole('button', { name: /Add Missing Ingredients/i }).click();
//   await page.getByRole('button', { name: /Start Cooking/i }).click();
  
//   await expect(page.getByText(/Insturctions/i)).toBeVisible();
//   await expect(page.getByText(/Ingredients/i)).toBeVisible();
//   await expect(page.getByText(/Nutrition Info/i)).toBeVisible();
// });

