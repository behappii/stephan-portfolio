import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('правка заголовка первого экрана видна на главной', async ({ page }) => {
	await login(page);
	await expect(page.getByText(/осталось заглушек/)).toBeVisible();
	await page.getByRole('link', { name: 'Тексты' }).first().click();
	await page.getByLabel('Заголовок', { exact: true }).fill('Сайты, которые работают —');
	await page.getByRole('button', { name: 'Сохранить' }).click();
	await expect(page.getByRole('status')).toHaveText('Сохранено');

	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Сайты, которые работают —');
});

test('ошибка валидации не теряет ввод', async ({ page }) => {
	await login(page);
	await page.goto('/admin/settings');
	await page.getByLabel('Город').fill('Биробиджан');
	await page.getByLabel('Имя').fill('');
	await page.getByRole('button', { name: 'Сохранить' }).click();
	await expect(page.getByText('Обязательное поле')).toBeVisible();
	await expect(page.getByLabel('Город')).toHaveValue('Биробиджан');
});
