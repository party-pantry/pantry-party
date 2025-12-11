import { test, expect} from '@playwright/test';

// Use stored authentication state
test.use({
  storageState: 'tests/playwright-auth-sessions/test-user-auth.json',
});

test('Recipes Page: visible', async ({ page }) => {
  await page.goto('http://localhost:3000/recipes');
});

test('Recipes Page: visible and shows recipe cards', async ({ page }) => {
  await expect(page.locator('h2', { hasText: 'Recommended' })).toBeVisible();
  await expect(page.getByPlaceholder(/Search recipes/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Filter/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Sort/i })).toBeVisible();
  await expect(page.locator('.recipe-card').first()).toBeVisible();
});

test('Searching for a recipe filters the list', async ({ page }) => {
  const initialRecipeCount = await page.locator('.recipe-card').count();
  await expect(initialRecipeCount).toBeGreaterThan(0);
  const searchInput = page.getByPlaceholder(/Search recipes/i);
  await expect(searchInput).toBeVisible();
  await searchInput.fill('Spaghetti');
  await page.waitForTimeout(500);
  const filteredRecipeCount = await page.locator('.recipe-card').count();
  await expect(filteredRecipeCount).toBeLessThanOrEqual(initialRecipeCount);
  await expect(page.locator('.recipe-card', { hasText: /Spaghetti/i }).first()).toBeVisible();
  await searchInput.clear();
  await page.waitForTimeout(500);
  const reloadedCount = await page.locator('.recipe-card').count();
  await expect(reloadedCount).toBe(initialRecipeCount);
});

test('Sorting recipes changes the order', async ({ page }) => {
  const sortButton = page.getByRole('button', { name: /Sort/i });
  await expect(sortButton).toBeVisible();
  await sortButton.click();
  const sortByName = page.getByRole('menuitem', { name: 'Name' });
  await expect(sortByName).toBeVisible();
  await sortByName.click();
  await expect(sortButton).toHaveText(/Name/);
  await sortButton.click();
  const sortByTime = page.getByRole('menuitem', { name: 'Total Time' });
  await expect(sortByTime).toBeVisible();
  await sortByTime.click();
  await sortButton.click();
  await sortByTime.click();

  await expect(sortButton).toHaveText(/Time/);
});

test('Filtering recipes by difficulty', async ({ page }) => {
  const filterButton = page.getByRole('button', { name: /Filter/i });
  await expect(filterButton).toBeVisible();
  await filterButton.click();
  const difficultyFilter = page.locator('div[role="dialog"]', { hasText: 'Difficulty' }).or(page.locator('.dropdown-menu', { hasText: 'Difficulty' }));
  await expect(difficultyFilter).toBeVisible();
  await difficultyFilter.getByRole('checkbox', { name: 'Easy' }).check();
  await page.getByRole('button', { name: 'Apply Filters' }).click();
  await filterButton.click();
  await expect(difficultyFilter.getByRole('checkbox', { name: 'Easy' })).toBeChecked();
});

test('Toggle "Recipes I Can Make" filters the list', async ({ page }) => {
  const toggleCanMake = page.getByRole('switch', { name: /Recipes I Can Make/i });
  await expect(toggleCanMake).toBeVisible();
  const initialRecipeCount = await page.locator('.recipe-card').count();
  await expect(initialRecipeCount).toBeGreaterThan(0);
  await toggleCanMake.check();
  await page.waitForTimeout(500);
  const filteredCount = await page.locator('.recipe-card').count();
  await expect(filteredCount).toBeLessThanOrEqual(initialRecipeCount);
  await toggleCanMake.uncheck();
  await page.waitForTimeout(500);
  const reloadedCount = await page.locator('.recipe-card').count();
  await expect(reloadedCount).toBe(initialRecipeCount);
});

test('Toggle "Show Favorites Only" filters the list', async ({ page }) => {
    const toggleFavorites = page.getByRole('switch', { name: /Show Favorites Only/i });
    await expect(toggleFavorites).toBeVisible();
    const initialRecipeCount = await page.locator('.recipe-card').count();
    await expect(initialRecipeCount).toBeGreaterThan(0);
    await toggleFavorites.check();
    await page.waitForTimeout(500);
    const filteredCount = await page.locator('.recipe-card').count();
    await expect(filteredCount).toBeLessThanOrEqual(initialRecipeCount);
    await toggleFavorites.uncheck();
    await page.waitForTimeout(500);
    const reloadedCount = await page.locator('.recipe-card').count();
    await expect(reloadedCount).toBe(initialRecipeCount);
});

test('Favorite a recipe toggles the star status', async ({ page }) => {
  const firstRecipeCard = page.locator('.recipe-card').first();
  await expect(firstRecipeCard).toBeVisible();
  const favoriteButton = firstRecipeCard.getByRole('button', { name: /Favorite/i });
  await expect(favoriteButton).toBeVisible();
  await favoriteButton.click();
  await favoriteButton.click();
});

test('Add a recipe modal opens and form submission works', async ({ page }) => {
  const recipeName = `Test Recipe ${Date.now()}`;
  await page.getByRole('button', { name: 'Add Recipe +' }).click();
  const modal = page.getByRole('dialog', { name: /Add New Recipe/i });
  await expect(modal).toBeVisible();
  await modal.getByLabel('Recipe Name').fill(recipeName);
  await modal.getByLabel('Description').fill('A simple test recipe description.');
  await modal.getByLabel('Prep Time (minutes)').fill('10');
  await modal.getByLabel('Cook Time (minutes)').fill('20');
  await modal.getByLabel('Difficulty').selectOption('EASY');
  await modal.getByLabel('Servings').fill('4');
  await modal.getByRole('button', { name: 'Submit' }).click();
  await expect(modal).not.toBeVisible();
  await page.waitForTimeout(1000);
  await expect(page.locator('.recipe-card', { hasText: recipeName })).toBeVisible();
});