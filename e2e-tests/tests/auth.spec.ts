import { test, expect } from '@playwright/test';

const UI_URL="http://localhost:5173/";

test('should allow user to login', async ({ page }) => {
  await page.goto(UI_URL);

  await page.getByRole('link', {name:'Sign In'}).click();

  await expect(page.getByRole('link', {name:'Sign In'})).toBeVisible();

  await page.locator("[name=email]").fill("test@gmail.com");

  await page.locator("[name=password]").fill("password@123");

  await page.getByRole("button", {name:"Sign In"}).click();
  
  await expect(page.getByText("Sign In Successfull")).toBeVisible();
  await expect(page.getByRole("link", {name:"My Hotels"})).toBeVisible();
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
