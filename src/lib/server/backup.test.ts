import Database from 'better-sqlite3';
import { createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { beforeEach, describe, expect, it } from 'vitest';
import yazl from 'yazl';
import { createSession, validateSession } from './auth';
import {
	BackupError,
	createAutoBackup,
	importBackup,
	listBackups,
	MAX_BACKUPS,
	writeBackupArchive
} from './backup';
import { migrationsDir } from './config';
import { openDatabase, SCHEMA_VERSION, type Db } from './db/client';
import { projects, settings } from './db/schema';
import { seedIfEmpty } from './db/seed';

let dataDir: string;
let db: Db;

const file = () => path.join(dataDir, 'portfolio.db');
const open = () => (db = openDatabase(file(), migrationsDir()));
const ctx = (keepSessionToken: string | null = null) => ({
	db,
	close: () => db.$client.close(),
	open,
	keepSessionToken
});
const city = () => db.select().from(settings).get()?.city;

beforeEach(async () => {
	dataDir = await mkdtemp(path.join(os.tmpdir(), 'backup-'));
	open();
	seedIfEmpty(db);
	await mkdir(path.join(dataDir, 'uploads'));
	await writeFile(path.join(dataDir, 'uploads', 'shot-1.webp'), 'webp-bytes');
	db.update(projects).set({ image: 'shot-1.webp' }).run();
});

type Entry = { name: string; data: string | Buffer; mode?: number };

async function zip(out: string, entries: Entry[]) {
	const z = new yazl.ZipFile();
	for (const e of entries) z.addBuffer(Buffer.from(e.data), e.name, { mode: e.mode });
	z.end();
	await pipeline(z.outputStream, createWriteStream(out));
}

async function sqliteBuffer(userVersion: number): Promise<Buffer> {
	const tmp = path.join(dataDir, `v${userVersion}.db`);
	const raw = new Database(tmp);
	raw.exec('CREATE TABLE settings (id INTEGER PRIMARY KEY)');
	raw.pragma(`user_version = ${userVersion}`);
	raw.close();
	return readFile(tmp);
}

const manifest = JSON.stringify({
	format: 1,
	schemaVersion: SCHEMA_VERSION,
	createdAt: '2026-10-25'
});

describe('экспорт и импорт', () => {
	it('после импорта данные и картинки совпадают с экспортом', async () => {
		const archive = path.join(dataDir, 'export.zip');
		await writeBackupArchive(db, dataDir, archive);

		db.update(settings).set({ city: 'Изменено' }).run();
		await rm(path.join(dataDir, 'uploads', 'shot-1.webp'));

		await importBackup(archive, dataDir, ctx());
		expect(city()).toBe('[город]');
		expect(await readFile(path.join(dataDir, 'uploads', 'shot-1.webp'), 'utf8')).toBe('webp-bytes');
	});

	it('перед импортом делает автобэкап, после — оставляет только текущую сессию', async () => {
		const archive = path.join(dataDir, 'export.zip');
		const mine = createSession(db).token;
		await writeBackupArchive(db, dataDir, archive);
		const other = createSession(db).token;

		await importBackup(archive, dataDir, ctx(mine));
		expect(await listBackups(dataDir)).toHaveLength(1);
		expect(validateSession(db, mine)).toBe(true);
		expect(validateSession(db, other)).toBe(false);
	});

	it('восстанавливает самый старый автобэкап, когда их уже 10', async () => {
		db.update(settings).set({ city: 'Самый старый' }).run();
		const oldest = await createAutoBackup(db, dataDir);
		db.update(settings).set({ city: 'Новее' }).run();
		for (let i = 1; i < MAX_BACKUPS; i++) await createAutoBackup(db, dataDir);
		expect(await listBackups(dataDir)).toHaveLength(MAX_BACKUPS);

		await importBackup(path.join(dataDir, 'backups', oldest), dataDir, ctx());
		expect(city()).toBe('Самый старый');
		expect(await listBackups(dataDir)).toHaveLength(MAX_BACKUPS);
	});
});

describe('отказ импорта, текущие данные не меняются', () => {
	async function expectRejected(entries: Entry[]) {
		const archive = path.join(dataDir, 'bad.zip');
		await zip(archive, entries);
		await expect(importBackup(archive, dataDir, ctx())).rejects.toThrow(BackupError);
		expect(city()).toBe('[город]');
		expect(await readdir(path.join(dataDir, 'uploads'))).toEqual(['shot-1.webp']);
	}

	it('не zip', async () => {
		const archive = path.join(dataDir, 'bad.zip');
		await writeFile(archive, 'not a zip');
		await expect(importBackup(archive, dataDir, ctx())).rejects.toThrow(BackupError);
	});

	it('испорченная база', async () => {
		await expectRejected([
			{ name: 'manifest.json', data: manifest },
			{ name: 'portfolio.db', data: 'not a database' }
		]);
	});

	it('схема новее приложения', async () => {
		await expectRejected([
			{ name: 'manifest.json', data: manifest },
			{ name: 'portfolio.db', data: await sqliteBuffer(SCHEMA_VERSION + 1) }
		]);
	});

	it('путь с ..', async () => {
		const archive = path.join(dataDir, 'bad.zip');
		await zip(archive, [{ name: 'xx/evil.webp', data: 'x' }]);
		const buf = await readFile(archive);
		await writeFile(
			archive,
			Buffer.from(buf.toString('latin1').replaceAll('xx/evil.webp', '../evil.webp'), 'latin1')
		);
		await expect(importBackup(archive, dataDir, ctx())).rejects.toThrow(BackupError);
	});

	it('симлинк', async () => {
		await expectRejected([
			{ name: 'manifest.json', data: manifest },
			{ name: 'uploads/link.webp', data: '/etc/passwd', mode: 0o120777 }
		]);
	});

	it('лишний файл', async () => {
		await expectRejected([
			{ name: 'manifest.json', data: manifest },
			{ name: 'run.sh', data: 'echo' }
		]);
	});

	it('проект ссылается на картинку, которой нет в архиве', async () => {
		// Архив с настоящей базой, но без папки uploads/.
		const stripped = path.join(dataDir, 'stripped.zip');
		const snapshot = path.join(dataDir, 'snap.db');
		db.$client.exec(`VACUUM INTO '${snapshot}'`);
		await zip(stripped, [
			{ name: 'manifest.json', data: manifest },
			{ name: 'portfolio.db', data: await readFile(snapshot) }
		]);
		await expect(importBackup(stripped, dataDir, ctx())).rejects.toThrow('нет картинок');
		expect(city()).toBe('[город]');
	});
});

describe('автобэкапы', () => {
	it('хранит не больше 10', async () => {
		for (let i = 0; i < 12; i++) await createAutoBackup(db, dataDir);
		expect(await listBackups(dataDir)).toHaveLength(MAX_BACKUPS);
	});
});
