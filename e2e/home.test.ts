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
