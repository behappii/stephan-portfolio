import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

/** Сколько карточек проектов целиком помещается в ширину окна. */
async function fullyVisibleCards(page: Page) {
	return page.locator('#projects .carousel-card').evaluateAll(
		(cards) =>
			cards.filter((c) => {
				const r = c.getBoundingClientRect();
				return r.left >= -1 && r.right <= window.innerWidth + 1;
			}).length
	);
}

function controls(page: Page) {
	const section = page.locator('#projects');
	return {
		prev: section.getByRole('button', { name: 'Предыдущий проект' }).locator('visible=true'),
		next: section.getByRole('button', { name: 'Следующий проект' }).locator('visible=true'),
		dots: section.getByRole('button', { name: /^Позиция \d+ из \d+$/ })
	};
}

test.describe('на телефоне', () => {
	test.use({ viewport: { width: 375, height: 740 } });

	test('видна одна карточка, стрелки и точки листают ленту', async ({ page }) => {
		await page.goto('/#projects');
		const { prev, next, dots } = controls(page);
		await expect(dots).toHaveCount(4);
		await expect.poll(() => fullyVisibleCards(page)).toBe(1);

		await expect(prev).toBeDisabled();
		await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');
		await next.click();
		await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
		await expect(prev).toBeEnabled();

		await dots.nth(3).click();
		await expect(dots.nth(3)).toHaveAttribute('aria-current', 'true');
		await expect(next).toBeDisabled();
		await expect.poll(() => fullyVisibleCards(page)).toBe(1);
	});
});

test.describe('на компьютере', () => {
	test.use({ viewport: { width: 1280, height: 900 } });

	test('видно несколько карточек, на краях стрелки неактивны', async ({ page }) => {
		await page.goto('/#projects');
		const { prev, next, dots } = controls(page);
		await expect.poll(() => fullyVisibleCards(page)).toBe(3);
		await expect(dots).toHaveCount(2);

		await expect(prev).toBeDisabled();
		await next.click();
		await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
		await expect(next).toBeDisabled();
		await prev.click();
		await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');
	});
});
