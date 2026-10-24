import { error, type Action } from '@sveltejs/kit';
import type { Db } from './db/client';
import { getDb } from './db/index';
import { moveItem, type SortableTable } from './repo/sortable';

export function parseId(param: string): number | 'new' {
	if (param === 'new') return 'new';
	const id = Number(param);
	if (!Number.isInteger(id) || id <= 0) error(404, 'Не найдено');
	return id;
}

const formId = (form: FormData): number => Number(form.get('id'));

export function sortableActions(
	table: SortableTable,
	remove: (db: Db, id: number) => void | Promise<void>
): { move: Action; delete: Action } {
	return {
		move: async ({ request }) => {
			const form = await request.formData();
			moveItem(getDb(), table, formId(form), form.get('direction') === 'up' ? 'up' : 'down');
		},
		delete: async ({ request }) => {
			await remove(getDb(), formId(await request.formData()));
		}
	};
}
