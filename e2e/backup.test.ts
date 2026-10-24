import { expect, test } from './fixtures';
import { readFile } from 'node:fs/promises';
import { login } from './helpers';

test('экспорт, правка, импорт возвращает прежний текст', async ({ page }) => {
	await login(page);
	await page.goto('/admin/backup');
	const download = page.waitForEvent('download');
	await page.getByRole('link', { name: 'Скачать архив' }).click();
	const archive = await readFile(await (await download).path());

	await page.goto('/admin/settings');
	const before = await page.getByLabel('Город').inputValue();
	await page.getByLabel('Город').fill('Временный город');
	await page.getByRole('button', { name: 'Сохранить' }).click();
	await expect(page.getByRole('status')).toHaveText('Сохранено');

	await page.goto('/admin/backup');
	await page
		.getByLabel('Архив')
		.setInputFiles({ name: 'backup.zip', mimeType: 'application/zip', buffer: archive });
	await page.getByRole('button', { name: 'Импортировать' }).click();
	await expect(page.getByRole('status')).toHaveText('Данные восстановлены из архива');
	await expect(page.getByText(/МБ/).first()).toBeVisible();

	await page.goto('/admin/settings');
	await expect(page.getByLabel('Город')).toHaveValue(before);
});

test('не-архив отклоняется', async ({ page }) => {
	await login(page);
	await page.goto('/admin/backup');
	await page
		.getByLabel('Архив')
		.setInputFiles({ name: 'x.zip', mimeType: 'application/zip', buffer: Buffer.from('nope') });
	await page.getByRole('button', { name: 'Импортировать' }).click();
	await expect(page.getByRole('alert')).toHaveText('Файл не похож на zip-архив');
});
