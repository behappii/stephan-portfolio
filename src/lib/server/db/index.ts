import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { dataDir, migrationsDir } from '../config';
import { openDatabase, type Db } from './client';
import { seedIfEmpty } from './seed';

let current: Db | null = null;

export function dbFile(): string {
	return path.join(dataDir(), 'portfolio.db');
}

/** Открывает базу приложения. Вызывается из init-хука и после импорта бэкапа. */
export function initDb(): Db {
	mkdirSync(dataDir(), { recursive: true });
	current = openDatabase(dbFile(), migrationsDir());
	seedIfEmpty(current);
	return current;
}

export function getDb(): Db {
	if (!current) throw new Error('База не открыта: initDb() ещё не вызывался');
	return current;
}

export function closeDb(): void {
	current?.$client.close();
	current = null;
}
