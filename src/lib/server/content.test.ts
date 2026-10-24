import { beforeEach, describe, expect, it } from 'vitest';
import type { Db } from './db/client';
import { approachSteps, links, projects, stackItems } from './db/schema';
import { seedIfEmpty } from './db/seed';
import { countPlaceholders, getPageContent } from './content';
import { createTestDb } from './testing';

let db: Db;
beforeEach(() => {
	db = createTestDb();
	seedIfEmpty(db);
});

describe('getPageContent', () => {
	it('нумерует видимые разделы и строит меню', () => {
		const c = getPageContent(db);
		expect(c.eyebrows).toEqual({
			stack: '01 · стек',
			projects: '02 · проекты',
			approach: '03 · подход',
			contact: '04 · контакты'
		});
		expect(c.nav.map((n) => n.href)).toEqual(['#stack', '#projects', '#approach']);
	});

	it('пустой раздел скрыт, нумерация сдвигается', () => {
		db.delete(stackItems).run();
		const c = getPageContent(db);
		expect(c.eyebrows.stack).toBeUndefined();
		expect(c.eyebrows.projects).toBe('01 · проекты');
		expect(c.nav.map((n) => n.href)).toEqual(['#projects', '#approach']);
	});

	it('неопубликованные проекты не попадают на страницу', () => {
		db.update(projects).set({ published: false }).run();
		const c = getPageContent(db);
		expect(c.projects).toEqual([]);
		expect(c.eyebrows.projects).toBeUndefined();
	});

	it('ссылка GitHub ищется без учёта регистра', () => {
		expect(getPageContent(db).githubUrl).toBe('https://github.com/');
		db.update(links).set({ label: 'github' }).run();
		expect(getPageContent(db).githubUrl).toBe('https://github.com/');
		db.delete(links).run();
		expect(getPageContent(db).githubUrl).toBeNull();
	});
});

describe('countPlaceholders', () => {
	it('считает заглушки в скобках во всех текстах', () => {
		// settings: [город], [you@email.com], [год]; 4 проекта × ([Название], [год], [Одно предложение…])
		expect(countPlaceholders(db)).toBe(3 + 4 * 3);
		db.delete(projects).run();
		db.delete(approachSteps).run();
		expect(countPlaceholders(db)).toBe(3);
	});
});
