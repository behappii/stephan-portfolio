import path from 'node:path';

/** Папка с базой, картинками и бэкапами. */
export function dataDir(): string {
	return path.resolve(process.env.DATA_DIR ?? 'data');
}

/** Папка с SQL-миграциями drizzle-kit. */
export function migrationsDir(): string {
	return path.resolve(process.env.MIGRATIONS_DIR ?? 'drizzle');
}
