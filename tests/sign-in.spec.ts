import { test, expect} from '@playwright/test';

// Note: Have not implemeneted test users/ authentication yet, so all of these tests only check for the pop-up forms
//       for sign-in, sign-up, and logout.
//       (i.e. Acceptance testing checks if forms can be filled out.)
test('Sign-in', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.locator('#login-dropdown').click();
  await page.getByLabel('', { exact: true }).getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Username or Email' }).click();
  await page.getByRole('textbox', { name: 'Username or Email' }).fill('email@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('changeme');
  await Promise.all([
    page.waitForURL('http://localhost:3000/my-kitchen'),
    await page.getByRole('button', { name: 'Sign in', exact: true }).click(),
  ]);
  await expect(page.getByRole('button', { name: 'Test User' })).toBeVisible();
});


test('Sign-up', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Pantry Party Logo' }).click();
  await page.locator('#login-dropdown').click();
  await page.getByLabel('', { exact: true }).getByRole('button', { name: 'Sign Up' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('test@foo.com');
  await page.getByRole('textbox', { name: 'Username' }).fill('yolot');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('test@foo.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).click();
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('1234');
  await page.getByRole('textbox', { name: 'Confirm Password' }).click();
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('1234');
  await page.locator('.lucide.lucide-eye').first().click();
  await page.locator('.lucide.lucide-eye').click();
  await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toBeVisible();
  await page.getByRole('button', { name: 'Create My Account' }).click();
  await page.getByRole('textbox', { name: 'Password', exact: true }).click();
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('123456');
  await page.getByRole('textbox', { name: 'Confirm Password' }).click();
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('123456');
  await page.getByRole('button', { name: 'Create My Account' }).click();
  // Sign-in, since account already exists in db
  await page.getByRole('button', { name: 'Close' }).click();
  await page.locator('#login-dropdown').click();
  await page.getByLabel('', { exact: true }).getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Username or Email' }).click();
  await page.getByRole('textbox', { name: 'Username or Email' }).fill('test@foo.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123456');
  // Wait for My-Kitchen page to load after sign-in
  await Promise.all([
    page.waitForURL('http://localhost:3000/my-kitchen'), // adjust to your expected URL
    await page.getByRole('button', { name: 'Sign in', exact: true }).click(),
  ]);
  await expect(page.getByRole('button', { name: 'yolot' })).toBeVisible();
});

test('Logout', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.locator('#login-dropdown').click();
  await page.getByLabel('', { exact: true }).getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Username or Email' }).click();
  await page.getByRole('textbox', { name: 'Username or Email' }).fill('test@foo.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123456');
  await Promise.all([
    page.waitForURL('http://localhost:3000/my-kitchen'), // adjust to your expected URL
    await page.getByRole('button', { name: 'Sign in', exact: true }).click(),
  ]);
  await expect(page.getByRole('button', { name: 'yolot' })).toBeVisible();
  await page.getByRole('button', { name: 'yolot' }).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await page.getByRole('button', { name: 'No' }).click();
  await page.getByRole('button', { name: 'yolot' }).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'yolot' }).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await page.getByRole('dialog').press('Escape');
  await page.getByRole('button', { name: 'yolot' }).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await page.getByRole('button', { name: 'Yes, Sign Out' }).click();
  await expect(page.locator('#home')).toBeVisible();
});