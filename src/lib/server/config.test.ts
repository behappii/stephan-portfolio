import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { dataDir, migrationsDir, siteOrigin } from './config';

describe('config', () => {
	const saved = { ...process.env };
	afterEach(() => {
		process.env = { ...saved };
	});

	it('по умолчанию берёт ./data и ./drizzle', () => {
		delete process.env.DATA_DIR;
		delete process.env.MIGRATIONS_DIR;
		expect(dataDir()).toBe(path.resolve('data'));
		expect(migrationsDir()).toBe(path.resolve('drizzle'));
	});

	it('читает пути из окружения', () => {
		process.env.DATA_DIR = '/srv/portfolio';
		process.env.MIGRATIONS_DIR = '/app/drizzle';
		expect(dataDir()).toBe('/srv/portfolio');
		expect(migrationsDir()).toBe('/app/drizzle');
	});

	it('адрес сайта берёт из SITE_URL, иначе из запроса', () => {
		const req = new URL('http://localhost:3000/some?x=1');
		delete process.env.SITE_URL;
		expect(siteOrigin(req)).toBe('http://localhost:3000');
		process.env.SITE_URL = 'https://behappii.ru/';
		expect(siteOrigin(req)).toBe('https://behappii.ru');
	});
});
