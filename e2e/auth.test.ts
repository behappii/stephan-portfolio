import { expect, test } from './fixtures';
import { login } from './helpers';

test('без сессии /admin ведёт на вход', async ({ page }) => {
	await page.goto('/admin/settings');
	await expect(page).toHaveURL('/admin/login');
});

test('POST в админку без сессии не выполняется', async ({ request }) => {
	const html = await request.post('/admin/settings', {
		form: { name: 'Взлом' },
		headers: { origin: 'http://localhost:4173', accept: 'text/html' },
		maxRedirects: 0
	});
	expect(html.status()).toBe(303);
	expect(html.headers().location).toBe('/admin/login');

	const json = await request.post('/admin/settings', {
		form: { name: 'Взлом' },
		headers: { origin: 'http://localhost:4173', accept: 'application/json' },
		maxRedirects: 0
	});
	expect(await json.json()).toMatchObject({ type: 'redirect', location: '/admin/login' });
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

test('закодированный путь не обходит защиту админки', async ({ request }) => {
	for (const path of [
		'/%61dmin',
		'/%61dmin/settings',
		'/%61dmin/backup/export',
		'/a%64min/backup'
	]) {
		const res = await request.get(path, { maxRedirects: 0 });
		expect(res.status(), path).toBe(303);
		expect(res.headers().location, path).toBe('/admin/login');
	}
	const post = await request.post('/%61dmin/backup?/snapshot', {
		headers: { origin: 'http://localhost:4173', accept: 'application/json' },
		maxRedirects: 0
	});
	expect(await post.json()).toMatchObject({ type: 'redirect', location: '/admin/login' });
});
