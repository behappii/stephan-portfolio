import { expect, test } from '@playwright/test';

test('главная показывает контент из базы', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle('behappii — веб-разработчик Степан');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Ваша идея — моя задача');
	await expect(
		page
			.getByRole('navigation', { name: 'Основная навигация' })
			.getByRole('link', { name: 'Проекты' })
	).toHaveAttribute('href', '#projects');
});

test('стек, проекты и подход выводятся из базы', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Работает везде' })).toBeVisible();
	await expect(page.getByText('01 · стек')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Избранные работы' })).toBeAttached();
	await expect(page.locator('#projects .story-card')).toHaveCount(4);
	await expect(
		page.getByRole('heading', { name: 'Сайт под ключ, исходники — ваши' })
	).toBeAttached();
	await expect(page.locator('#approach li')).toHaveCount(4);
});

test('контакты, футер и SEO', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Есть идея? Давайте соберём её' })).toBeVisible();
	await expect(page.getByText('04 · контакты')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Telegram ↗' })).toHaveAttribute(
		'href',
		'https://t.me/'
	);
	await expect(page.getByText('© [год] Степан')).toBeVisible();
	await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
		'content',
		'behappii — веб-разработчик Степан'
	);
});

test('неизвестный адрес — страница 404', async ({ page }) => {
	const res = await page.goto('/nope');
	expect(res?.status()).toBe(404);
	await expect(page.getByRole('heading', { name: 'Такой страницы нет' })).toBeVisible();
});
