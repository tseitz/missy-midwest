import { test, expect } from '@playwright/test';

test('home page loads and shows the brand wordmark', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('link', { name: /missy midwest/i }).first()).toBeVisible();
});
