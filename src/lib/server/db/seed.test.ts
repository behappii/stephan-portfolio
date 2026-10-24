import { describe, expect, it } from 'vitest';
import { createTestDb } from '../testing';
import { approachSteps, links, projects, settings, stackItems } from './schema';
import { seedIfEmpty } from './seed';

describe('seedIfEmpty', () => {
	it('заполняет пустую базу текстами из макета', () => {
		const db = createTestDb();
		expect(seedIfEmpty(db)).toBe(true);

		const s = db.select().from(settings).get();
		expect(s?.heroTitle).toBe('Ваша идея —');
		expect(s?.heroTitleAccent).toBe('моя задача');
		expect(s?.city).toBe('[город]');
		expect(db.select().from(stackItems).all()).toHaveLength(5);
		expect(db.select().from(projects).all()).toHaveLength(4);
		expect(db.select().from(approachSteps).all()).toHaveLength(4);
		expect(
			db
				.select()
				.from(links)
				.all()
				.map((l) => l.label)
		).toEqual(['GitHub', 'Telegram', 'LinkedIn']);
	});

	it('не трогает уже заполненную базу', () => {
		const db = createTestDb();
		seedIfEmpty(db);
		expect(seedIfEmpty(db)).toBe(false);
		expect(db.select().from(stackItems).all()).toHaveLength(5);
	});
});
