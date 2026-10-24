import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('добавить, переставить и удалить карточку стека', async ({ page }) => {
	await login(page);
	await page.goto('/admin/stack/new');
	await page.getByLabel('Название').fill('Игры');
	await page.getByLabel('Описание').fill('Браузерные игры на Canvas.');
	await page.getByText('Дизайн', { exact: true }).click();
	await page.getByLabel('Теги').fill('Canvas, Canvas, PixiJS');
	await page.getByRole('button', { name: 'Добавить' }).click();
	await expect(page).toHaveURL('/admin/stack');

	const last = page.getByRole('listitem').last();
	await expect(last).toContainText('Игры');
	await expect(last).toContainText('Canvas, PixiJS');

	const count = await page.getByRole('listitem').count();
	await page.getByRole('button', { name: 'Поднять «Игры»' }).click();
	await expect(page.getByRole('listitem').nth(count - 2)).toContainText('Игры');

	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Игры' })).toBeAttached();

	await page.goto('/admin/stack');
	const row = page.getByRole('listitem').filter({ hasText: 'Игры' });
	await row.getByText('Удалить', { exact: true }).click();
	await row.getByRole('button', { name: 'Да, удалить' }).click();
	await expect(page.getByRole('listitem').filter({ hasText: 'Игры' })).toHaveCount(0);
});

test('устаревший id отвечает 404', async ({ page }) => {
	await login(page);
	const res = await page.goto('/admin/stack/99999');
	expect(res?.status()).toBe(404);
	expect((await page.goto('/admin/links/abc'))?.status()).toBe(404);
});

test('ссылка: отказ на javascript:', async ({ page }) => {
	await login(page);
	await page.goto('/admin/links/new');
	await page.getByLabel('Название').fill('Плохая');
	await page.getByLabel('Адрес').fill('javascript:alert(1)');
	await page.getByRole('button', { name: 'Добавить' }).click();
	await expect(page.getByText('Нужна ссылка вида https://…')).toBeVisible();
});
