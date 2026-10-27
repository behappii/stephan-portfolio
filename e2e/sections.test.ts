import { expect, test } from './fixtures';

test.describe('на компьютере', () => {
	test.use({ viewport: { width: 1280, height: 900 } });

	test('разделы без смены карточек при прокрутке', async ({ page }) => {
		await page.goto('/');
		for (const id of ['#stack', '#approach']) {
			const box = (await page.locator(id).boundingBox())!;
			expect(box.height).toBeLessThan(900 * 2);
		}
	});

	test('стек — бенто: первая карточка крупнее остальных', async ({ page }) => {
		await page.goto('/');
		const cards = page.locator('#stack .stack-card');
		await expect(cards).toHaveCount(5);
		const big = (await cards.nth(0).boundingBox())!;
		const small = (await cards.nth(1).boundingBox())!;
		expect(big.width).toBeGreaterThan(small.width * 1.15);
		expect(big.height).toBeGreaterThan(small.height * 1.5);
	});

	test('подход — зигзаг: шаги чередуются слева и справа', async ({ page }) => {
		await page.goto('/');
		const cards = page.locator('#approach .step-card');
		const centers = await cards.evaluateAll((els) =>
			els.map((el) => {
				const r = el.getBoundingClientRect();
				return r.left + r.width / 2;
			})
		);
		const mid = 1280 / 2;
		expect(centers.map((x) => x < mid)).toEqual([true, false, true, false]);
	});

	test('карточка реагирует на наведение', async ({ page }) => {
		await page.goto('/');
		const card = page.locator('#stack .stack-card').nth(1);
		await card.scrollIntoViewIfNeeded();
		const before = await card.evaluate((el) => getComputedStyle(el).transform);
		const box = (await card.boundingBox())!;
		await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2);
		await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.25);
		await expect.poll(() => card.evaluate((el) => getComputedStyle(el).transform)).not.toBe(before);
	});
});

test.describe('на телефоне', () => {
	test.use({ viewport: { width: 375, height: 740 } });

	test('подход — линия слева, карточки справа от шариков', async ({ page }) => {
		await page.goto('/');
		const steps = page.locator('#approach li');
		for (let i = 0; i < 4; i++) {
			const orb = (await steps.nth(i).locator('.va-orb').boundingBox())!;
			const card = (await steps.nth(i).locator('.step-card').boundingBox())!;
			expect(card.x).toBeGreaterThan(orb.x + orb.width - 1);
			expect(card.x + card.width).toBeLessThanOrEqual(375);
		}
	});

	test('стек — карточки столбиком', async ({ page }) => {
		await page.goto('/');
		const xs = await page
			.locator('#stack .stack-card')
			.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().left)));
		expect(new Set(xs).size).toBe(1);
	});
});
