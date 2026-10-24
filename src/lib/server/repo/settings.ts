import { eq } from 'drizzle-orm';
import type { SettingsInput } from '../../schemas';
import type { Db } from '../db/client';
import { settings, type Settings } from '../db/schema';

export function getSettings(db: Db): Settings {
	const row = db.select().from(settings).where(eq(settings.id, 1)).get();
	if (!row) throw new Error('Таблица settings пуста');
	return row;
}

export function updateSettings(db: Db, data: SettingsInput): void {
	db.update(settings).set(data).where(eq(settings.id, 1)).run();
}
