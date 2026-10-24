import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('без сессии /admin ведёт на вход', async ({ page }) => {
	await page.goto('/admin/settings');
	await expect(page).toHaveURL('/admin/login');
});

test('POST в админку без сессии не выполняется', async ({ request }) => {
	const res = await request.post('/admin/settings', {
		form: { name: 'Взлом' },
		headers: { origin: 'http://localhost:4173' },
		maxRedirects: 0
	});
	expect(res.status()).toBe(303);
	expect(res.headers().location).toBe('/admin/login');
});

test('неверный пароль показывает ошибку', async ({ page }) => {
	await page.goto('/admin/login');
	await page.getByLabel('Пароль').fill('не тот');
	await page.getByRole('button', { name: 'Войти' }).click();
	await expect(page.getByRole('alert')).toHaveText('Неверный пароль');
});

test('вход и выход', async ({ page }) => {
	await login(page);
	await page.getByRole('button', { name: 'Выйти' }).click();
	await expect(page).toHaveURL('/admin/login');
	await page.goto('/admin');
	await expect(page).toHaveURL('/admin/login');
});
