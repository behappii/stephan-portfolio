import { expect, test } from './fixtures';

test('главная отдаёт canonical, превью для соцсетей и разметку человека', async ({ page }) => {
	await page.goto('/');
	const origin = new URL(page.url()).origin;
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${origin}/`);
	await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${origin}/`);
	await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
		'content',
		'summary_large_image'
	);

	const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
	expect(ogImage).toMatch(/\.jpg$/);
	const img = await page.request.get(ogImage!);
	expect(img.ok()).toBe(true);
	expect(img.headers()['content-type']).toBe('image/jpeg');

	const jsonLd = JSON.parse(
		(await page.locator('script[type="application/ld+json"]').textContent())!
	);
	expect(jsonLd).toMatchObject({ '@type': 'Person', name: 'Степан', url: `${origin}/` });
	// В сиде город — заглушка «[город]», в разметку она не попадает.
	expect(jsonLd).not.toHaveProperty('address');
});

test('robots.txt закрывает админку и указывает на sitemap', async ({ request, baseURL }) => {
	const robots = await request.get('/robots.txt');
	expect(robots.headers()['content-type']).toContain('text/plain');
	const text = await robots.text();
	expect(text).toContain('Disallow: /admin');
	expect(text).toContain(`Sitemap: ${baseURL}/sitemap.xml`);

	const sitemap = await request.get('/sitemap.xml');
	expect(sitemap.headers()['content-type']).toContain('application/xml');
	expect(await sitemap.text()).toContain(`<loc>${baseURL}/</loc>`);
});
