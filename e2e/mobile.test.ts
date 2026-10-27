import { expect, test } from './fixtures';

test.use({ viewport: { width: 375, height: 740 } });

test('шапка на телефоне помещается в одну строку', async ({ page }) => {
	await page.goto('/');
	const nav = page.getByRole('navigation', { name: 'Основная навигация' });
	const brand = await nav.getByRole('link', { name: 'behappii — наверх' }).boundingBox();
	const burger = await nav.getByRole('button', { name: 'Открыть меню' }).boundingBox();
	expect(brand && burger).toBeTruthy();
	// Бургер стоит справа от логотипа на той же строке.
	expect(Math.abs(brand!.y + brand!.height / 2 - (burger!.y + burger!.height / 2))).toBeLessThan(4);
	await expect(nav.getByRole('link', { name: 'Проекты' })).toBeHidden();
});

test('меню на телефоне открывается, закрывается и ведёт к разделу', async ({ page }) => {
	await page.goto('/');
	const menu = page.getByRole('dialog', { name: 'Меню' });

	await page.getByRole('button', { name: 'Открыть меню' }).click();
	await expect(menu).toBeVisible();
	await expect(menu.getByRole('link', { name: 'Связаться' })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();

	await page.getByRole('button', { name: 'Открыть меню' }).click();
	await menu.getByRole('button', { name: 'Закрыть меню' }).click();
	await expect(menu).toBeHidden();

	await page.getByRole('button', { name: 'Открыть меню' }).click();
	await menu.getByRole('link', { name: 'Проекты' }).click();
	await expect(menu).toBeHidden();
	await expect(page).toHaveURL(/#projects$/);
});

test('картинка первого экрана на телефоне не наезжает сама на себя', async ({ page }) => {
	await page.goto('/');
	const art = page.locator('.art');
	const browserTag = await art.getByText('SvelteKit · Next.js').boundingBox();
	const phoneTag = await art.getByText('React Native · Flutter').boundingBox();
	const artBox = await art.boundingBox();
	await expect(art.getByText('Tauri')).toBeHidden();
	expect(browserTag && phoneTag && artBox).toBeTruthy();
	const overlap =
		browserTag!.x < phoneTag!.x + phoneTag!.width &&
		phoneTag!.x < browserTag!.x + browserTag!.width &&
		browserTag!.y < phoneTag!.y + phoneTag!.height &&
		phoneTag!.y < browserTag!.y + browserTag!.height;
	expect(overlap).toBe(false);
	// Подписи не выходят за картинку и не лезут на следующий раздел.
	expect(phoneTag!.y + phoneTag!.height).toBeLessThanOrEqual(artBox!.y + artBox!.height + 1);
	expect(artBox!.x + artBox!.width).toBeLessThanOrEqual(375);
});

test('на компьютере шапка без бургера', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');
	const nav = page.getByRole('navigation', { name: 'Основная навигация' });
	await expect(nav.getByRole('link', { name: 'Проекты' })).toBeVisible();
	await expect(nav.getByRole('button', { name: 'Открыть меню' })).toBeHidden();
	await expect(page.locator('.art').getByText('Tauri')).toBeVisible();
});
