import { getTableName } from 'drizzle-orm';
import type { Db } from '../db/client';
import type { approachSteps, links, projects, stackItems } from '../db/schema';

export type SortableTable =
	typeof stackItems | typeof projects | typeof approachSteps | typeof links;

export function nextSort(db: Db, table: SortableTable): number {
	const name = getTableName(table);
	return db.$client
		.prepare(`SELECT COALESCE(MAX(sort), -1) + 1 FROM "${name}"`)
		.pluck()
		.get() as number;
}

/** Меняет запись местами с соседом и заново нумерует sort с нуля. */
export function moveItem(db: Db, table: SortableTable, id: number, direction: 'up' | 'down'): void {
	const name = getTableName(table);
	const sqlite = db.$client;
	sqlite.transaction(() => {
		const ids = sqlite
			.prepare(`SELECT id FROM "${name}" ORDER BY sort, id`)
			.pluck()
			.all() as number[];
		const i = ids.indexOf(id);
		const j = direction === 'up' ? i - 1 : i + 1;
		if (i < 0 || j < 0 || j >= ids.length) return;
		[ids[i], ids[j]] = [ids[j], ids[i]];
		const update = sqlite.prepare(`UPDATE "${name}" SET sort = ? WHERE id = ?`);
		ids.forEach((rowId, index) => update.run(index, rowId));
	})();
}
