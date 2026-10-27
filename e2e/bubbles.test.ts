import { expect, test } from './fixtures';

// С «уменьшить движение» пузырьки стоят на месте, по ним проще попасть.
test.use({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });

test('пузырёк в первом экране лопается по клику и появляется снова', async ({ page }) => {
	await page.goto('/');
	// Ищем пузырёк, который ничем не закрыт, и кликаем в его центр.
	const target = await page.evaluate(() => {
		const bubbles = [...document.querySelectorAll<HTMLElement>('.hero .rise')];
		for (const [i, el] of bubbles.entries()) {
			const r = el.getBoundingClientRect();
			const x = r.left + r.width / 2;
			const y = r.top + r.height / 2;
			if (y < 0 || y > innerHeight) continue;
			if (el.contains(document.elementFromPoint(x, y))) return { i, x, y };
		}
		return null;
	});
	expect(target).not.toBeNull();
	const bubble = page.locator('.hero .rise').nth(target!.i);

	await page.mouse.click(target!.x, target!.y);
	await expect(bubble.locator('.bubble')).toHaveClass(/popping/);
	await expect(bubble.locator('.bubble')).not.toHaveClass(/popping/, { timeout: 3000 });
	await expect(page.locator('.hero .rise')).toHaveCount(16);
});

test('кнопки первого экрана по-прежнему нажимаются', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Смотреть проекты' }).click();
	await expect(page).toHaveURL(/#projects$/);
});
