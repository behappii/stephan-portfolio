import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import { login } from './helpers';

test('загрузка скриншота проекта видна на главной', async ({ page }) => {
	const png = await sharp({
		create: { width: 1200, height: 800, channels: 3, background: '#6D28D9' }
	})
		.png()
		.toBuffer();

	await login(page);
	await page.goto('/admin/projects');
	await page.getByRole('link', { name: 'Изменить' }).first().click();
	await expect(page).toHaveURL(/\/admin\/projects\/\d+$/);
	await page.getByLabel('Название').fill('Портфолио behappii');
	await page
		.locator('#field-image')
		.setInputFiles({ name: 'shot.png', mimeType: 'image/png', buffer: png });
	await page.getByRole('button', { name: 'Сохранить' }).click();
	await expect(page.getByRole('status')).toHaveText('Сохранено');

	await page.goto('/');
	const img = page.getByRole('img', { name: 'Скриншот проекта «Портфолио behappii»' });
	await expect(img).toBeAttached();
	const src = await img.getAttribute('src');
	expect(src).toMatch(/^\/uploads\/[a-z0-9-]+\.webp$/);
	const res = await page.request.get(src!);
	expect(res.headers()['content-type']).toBe('image/webp');
});

test('не-картинка отклоняется с ошибкой у поля', async ({ page }) => {
	await login(page);
	await page.goto('/admin/projects/new');
	await page.getByLabel('Название').fill('Тест');
	await page.getByLabel('Платформа').fill('Веб');
	await page.getByLabel('Год').fill('2026');
	await page.getByLabel('Описание').fill('Проверка.');
	await page.locator('#field-image').setInputFiles({
		name: 'x.png',
		mimeType: 'image/png',
		buffer: Buffer.from('not an image')
	});
	await page.getByRole('button', { name: 'Добавить' }).click();
	await expect(page.getByText('Файл не похож на картинку')).toBeVisible();
	await expect(page.getByLabel('Название')).toHaveValue('Тест');
});

test('снятый с публикации проект пропадает с главной', async ({ page }) => {
	await login(page);
	await page.goto('/admin/projects/new');
	await page.getByLabel('Название').fill('Секретный');
	await page.getByLabel('Платформа').fill('Веб');
	await page.getByLabel('Год').fill('2026');
	await page.getByLabel('Описание').fill('Черновик.');
	await page.getByLabel('Опубликован').uncheck();
	await page.getByRole('button', { name: 'Добавить' }).click();
	await expect(page).toHaveURL('/admin/projects');
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Секретный' })).toHaveCount(0);
});
