import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

/** Тесты не ходят в Google Fonts: внешняя сеть делает их медленными и нестабильными. */
export const test = base.extend({
	page: async ({ page }, use) => {
		await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
		await use(page);
	}
});
