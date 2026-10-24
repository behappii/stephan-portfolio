import { migrationsDir } from './config';
import { openDatabase, type Db } from './db/client';

/** Пустая база в памяти с применёнными миграциями. */
export function createTestDb(): Db {
	return openDatabase(':memory:', migrationsDir());
}
