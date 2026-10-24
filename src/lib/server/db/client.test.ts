import { describe, expect, it } from 'vitest';
import { createTestDb } from '../testing';
import { SCHEMA_VERSION } from './client';

describe('openDatabase', () => {
	it('применяет миграции и выставляет user_version', () => {
		const db = createTestDb();
		const tables = db.$client
			.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`)
			.pluck()
			.all();
		expect(tables).toEqual(
			expect.arrayContaining([
				'approach_steps',
				'links',
				'projects',
				'sessions',
				'settings',
				'stack_items'
			])
		);
		expect(db.$client.pragma('user_version', { simple: true })).toBe(SCHEMA_VERSION);
	});
});
