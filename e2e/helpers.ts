import { expect, type Page } from '@playwright/test';

export const E2E_PASSWORD = 'e2e-пароль-для-тестов';

export async function login(page: Page): Promise<void> {
	await page.goto('/admin/login');
	await page.getByLabel('Пароль').fill(E2E_PASSWORD);
	await page.getByRole('button', { name: 'Войти' }).click();
	await expect(page).toHaveURL('/admin');
}
