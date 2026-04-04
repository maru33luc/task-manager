import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page by default', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('link', { name: /register/i }).click();
    await expect(page).toHaveURL(/auth\/register/);
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
  });

  test('should show validation errors on register', async ({ page }) => {
    await page.goto('/auth/register');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByLabel(/email/i).fill('notanemail');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/enter a valid email/i)).toBeVisible();
  });
});
