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
