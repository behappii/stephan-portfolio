import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

/** Повышается вместе с каждой новой миграцией. Пишется в PRAGMA user_version и manifest.json бэкапа. */
export const SCHEMA_VERSION = 1;

export type Db = BetterSQLite3Database & { $client: Database.Database };

export function openDatabase(file: string, migrationsFolder: string): Db {
	const sqlite = new Database(file);
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');
	const db = drizzle({ client: sqlite });
	migrate(db, { migrationsFolder });
	sqlite.pragma(`user_version = ${SCHEMA_VERSION}`);
	return db;
}
