import { beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '../db/client';
import { stackItems } from '../db/schema';
import { seedIfEmpty } from '../db/seed';
import { createTestDb } from '../testing';
import {
	createProject,
	createStackItem,
	deleteProject,
	deleteStackItem,
	getStackItem,
	listProjects,
	listStackItems,
	updateStackItem
} from './lists';
import { getSettings, updateSettings } from './settings';
import { moveItem } from './sortable';

let db: Db;
beforeEach(() => {
	db = createTestDb();
	seedIfEmpty(db);
});

const titles = () => listStackItems(db).map((i) => i.title);
const project = { category: 'Веб', year: '2026', description: 'x', url: null, tags: [] };

describe('settings', () => {
	it('читает и обновляет единственную строку', () => {
		const s = getSettings(db);
		updateSettings(db, { ...s, city: 'Биробиджан' });
		expect(getSettings(db).city).toBe('Биробиджан');
	});
});

describe('списки', () => {
	it('новая запись встаёт в конец', () => {
		const id = createStackItem(db, { title: 'Игры', description: 'x', icon: 'design', tags: [] });
		expect(titles().at(-1)).toBe('Игры');
		expect(getStackItem(db, id)?.title).toBe('Игры');
	});

	it('обновляет и удаляет', () => {
		const [first] = listStackItems(db);
		updateStackItem(db, first.id, { title: 'Сайты', description: 'y', icon: 'web', tags: ['A'] });
		expect(getStackItem(db, first.id)?.tags).toEqual(['A']);
		deleteStackItem(db, first.id);
		expect(getStackItem(db, first.id)).toBeUndefined();
	});

	it('скрывает неопубликованные проекты по запросу', () => {
		createProject(db, { ...project, title: 'Черновик', published: false, image: null });
		expect(listProjects(db)).toHaveLength(5);
		expect(listProjects(db, { publishedOnly: true })).toHaveLength(4);
	});

	it('deleteProject возвращает имя картинки', () => {
		const id = createProject(db, { ...project, title: 'P', published: true, image: 'abc.webp' });
		expect(deleteProject(db, id)).toBe('abc.webp');
	});
});

describe('moveItem', () => {
	it('меняет местами соседей', () => {
		const [, second] = listStackItems(db);
		moveItem(db, stackItems, second.id, 'up');
		expect(titles().slice(0, 2)).toEqual(['Мобайл', 'Веб']);
	});

	it('первую вверх и последнюю вниз — без изменений', () => {
		const items = listStackItems(db);
		const before = titles();
		moveItem(db, stackItems, items[0].id, 'up');
		moveItem(db, stackItems, items.at(-1)!.id, 'down');
		expect(titles()).toEqual(before);
	});

	it('устаревший id — без изменений и без ошибок', () => {
		const before = titles();
		moveItem(db, stackItems, 9999, 'up');
		deleteStackItem(db, 9999);
		updateStackItem(db, 9999, { title: 'x', description: 'x', icon: 'web', tags: [] });
		expect(titles()).toEqual(before);
		expect(getStackItem(db, 9999)).toBeUndefined();
	});

	it('выравнивает повторяющиеся sort', () => {
		db.update(stackItems).set({ sort: 0 }).run();
		const items = listStackItems(db);
		moveItem(db, stackItems, items[1].id, 'up');
		const sorts = listStackItems(db).map((i) => i.sort);
		expect(sorts).toEqual([0, 1, 2, 3, 4]);
	});
});
