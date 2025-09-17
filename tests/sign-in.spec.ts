import { test, expect} from '@playwright/test';

// test.use({
//   storageState: 'john-auth.json',
// });

// Note: Have not implemeneted test users/ authentication yet, so all of these tests only check for the pop-up forms
//       for sign-in, sign-up, and logout.
//       (i.e. Acceptance testing checks if forms can be filled out.)
test('Sign-in', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Pantry Party Logo' }).click();
  await page.locator('#login-dropdown').click();
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('Welcome Back To The Party!Sign In')).toBeVisible();
  await page.getByRole('textbox', { name: 'Username/Email' }).click();
  await page.getByRole('textbox', { name: 'Username/Email' }).fill('user@foo.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('changeme');
  await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByText('The Fun Way To Stock Your PantryEasily track and manage your pantry items')).toBeVisible();
  await expect(page.getByText('FeaturesMultiple Location')).toBeVisible();
});

test('Sign-up', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Pantry Party Logo' }).click();
  await page.locator('#login-dropdown').click();
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await expect(page.getByText('Welcome To The Party!Sign Up')).toBeVisible();
  await expect(page.locator('form')).toBeVisible();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('test-user');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('user@foo.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('changeme');
  await page.getByRole('dialog').getByRole('button', { name: 'Sign Up' }).click();
  await expect(page.getByText('The Fun Way To Stock Your PantryEasily track and manage your pantry items')).toBeVisible();
  await expect(page.getByText('FeaturesMultiple Location')).toBeVisible();
});

test('Logout', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Pantry Party Logo' }).click();
  await page.locator('#login-dropdown').click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page.getByText('Are You Sure You Want To Sign Out?NoYes, Sign Out')).toBeVisible();
  await page.getByRole('button', { name: 'Yes, Sign Out' }).click();
  await page.getByRole('button', { name: 'No' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
});