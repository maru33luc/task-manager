import { test, expect, Page } from '@playwright/test';

async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/);
}

test.describe('Tasks (requires running backend)', () => {
  test.skip(
    () => !process.env['E2E_EMAIL'],
    'Set E2E_EMAIL and E2E_PASSWORD environment variables to run these tests',
  );

  test('should display dashboard after login', async ({ page }) => {
    await loginAs(page, process.env['E2E_EMAIL']!, process.env['E2E_PASSWORD']!);
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  });

  test('should navigate to tasks page', async ({ page }) => {
    await loginAs(page, process.env['E2E_EMAIL']!, process.env['E2E_PASSWORD']!);
    await page.getByRole('link', { name: /tasks/i }).click();
    await expect(page).toHaveURL(/tasks/);
    await expect(page.getByRole('heading', { name: /my tasks/i })).toBeVisible();
  });

  test('should open task creation form', async ({ page }) => {
    await loginAs(page, process.env['E2E_EMAIL']!, process.env['E2E_PASSWORD']!);
    await page.goto('/tasks');
    await page.getByRole('button', { name: /new task/i }).click();
    await expect(page.getByRole('heading', { name: /new task/i })).toBeVisible();
    await expect(page.getByLabel(/title/i)).toBeVisible();
  });

  test('should show validation error on empty task form', async ({ page }) => {
    await loginAs(page, process.env['E2E_EMAIL']!, process.env['E2E_PASSWORD']!);
    await page.goto('/tasks');
    await page.getByRole('button', { name: /new task/i }).click();
    await page.getByRole('button', { name: /create task/i }).click();
    await expect(page.getByText(/title is required/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await loginAs(page, process.env['E2E_EMAIL']!, process.env['E2E_PASSWORD']!);
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/auth\/login/);
  });
});
