import { describe, expect, it } from 'vitest';
import {
	linkSchema,
	parseForm,
	parseTags,
	projectSchema,
	settingsSchema,
	stackItemSchema
} from './schemas';

function form(values: Record<string, string>): FormData {
	const f = new FormData();
	for (const [k, v] of Object.entries(values)) f.set(k, v);
	return f;
}

describe('parseTags', () => {
	it('чистит пробелы, пустые и дубли без учёта регистра', () => {
		expect(parseTags(' SvelteKit, , sveltekit ,Docker,')).toEqual(['SvelteKit', 'Docker']);
	});
	it('пустая строка даёт пустой массив', () => {
		expect(parseTags('')).toEqual([]);
	});
});

describe('parseForm', () => {
	it('возвращает данные при валидном вводе', () => {
		const r = parseForm(
			stackItemSchema,
			form({ title: ' Веб ', description: 'Сайты', icon: 'web', tags: 'SvelteKit, Next.js' })
		);
		expect(r).toEqual({
			ok: true,
			data: { title: 'Веб', description: 'Сайты', icon: 'web', tags: ['SvelteKit', 'Next.js'] }
		});
	});

	it('возвращает первую ошибку на поле и введённые значения', () => {
		const r = parseForm(stackItemSchema, form({ title: '', description: 'x', icon: 'rocket' }));
		expect(r.ok).toBe(false);
		if (r.ok) return;
		expect(r.errors.title).toBe('Обязательное поле');
		expect(r.errors.icon).toBeTruthy();
		expect(r.values.description).toBe('x');
	});

	it('проект: пустой url — null, без галочки — не опубликован', () => {
		const r = parseForm(
			projectSchema,
			form({ title: 'A', category: 'Веб', year: '2026', description: 'B', url: '', tags: '' })
		);
		expect(r.ok && r.data.url).toBe(null);
		expect(r.ok && r.data.published).toBe(false);
	});

	it('ссылка: только http и https', () => {
		expect(parseForm(linkSchema, form({ label: 'X', url: 'javascript:alert(1)' })).ok).toBe(false);
		expect(parseForm(linkSchema, form({ label: 'X', url: 'https://t.me/x' })).ok).toBe(true);
	});

	it('email принимает адрес или заглушку в скобках', () => {
		const base = Object.fromEntries(
			Object.keys(settingsSchema.shape).map((k) => [k, 'текст'])
		) as Record<string, string>;
		expect(parseForm(settingsSchema, form({ ...base, email: '[you@email.com]' })).ok).toBe(true);
		expect(parseForm(settingsSchema, form({ ...base, email: 'me@behappii.ru' })).ok).toBe(true);
		expect(parseForm(settingsSchema, form({ ...base, email: 'not-an-email' })).ok).toBe(false);
	});
});
