import { test, expect } from '@playwright/test';

test('home page loads and shows the brand wordmark', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('link', { name: /missy midwest/i }).first()).toBeVisible();
});

test('shop page loads and shows the section heading', async ({ page }) => {
	await page.goto('/shop');
	await expect(page.getByRole('heading', { name: /rep the brand/i })).toBeVisible();
});

test('cart drawer opens from the header', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /open cart/i }).click();
	await expect(page.getByText(/your cart is empty/i)).toBeVisible();
});

test('contact page renders the booking form', async ({ page }) => {
	await page.goto('/contact');
	await expect(page.getByRole('heading', { name: 'Contact', exact: true })).toBeVisible();
	await expect(page.getByLabel('Name')).toBeVisible();
	await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
});
