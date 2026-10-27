import path from 'node:path';

/** Папка с базой, картинками и бэкапами. */
export function dataDir(): string {
	return path.resolve(process.env.DATA_DIR ?? 'data');
}

/** Папка с SQL-миграциями drizzle-kit. */
export function migrationsDir(): string {
	return path.resolve(process.env.MIGRATIONS_DIR ?? 'drizzle');
}

/**
 * Адрес сайта для canonical, sitemap и robots.txt. SITE_URL задаётся на сервере,
 * чтобы у адресов с www и без него был один канонический; иначе берётся адрес запроса.
 */
export function siteOrigin(requestUrl: URL): string {
	const site = process.env.SITE_URL?.trim();
	return site ? new URL(site).origin : requestUrl.origin;
}
