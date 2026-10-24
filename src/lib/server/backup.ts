import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { createWriteStream, existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { eq } from 'drizzle-orm';
import yauzl from 'yauzl';
import yazl from 'yazl';
import { hashToken } from './auth';
import { SCHEMA_VERSION, type Db } from './db/client';
import { sessions } from './db/schema';
import { IMAGE_NAME } from './uploads';

export class BackupError extends Error {}

export const MAX_BACKUPS = 10;
export const BACKUP_NAME = /^portfolio-backup-[0-9TZ-]+-[a-f0-9]{6}\.zip$/;
const MAX_UNPACKED_BYTES = 500 * 1024 * 1024;
const FORMAT = 1;

export interface ImportContext {
	db: Db;
	close: () => void;
	open: () => Db;
	keepSessionToken: string | null;
}

const paths = (dataDir: string) => ({
	db: path.join(dataDir, 'portfolio.db'),
	uploads: path.join(dataDir, 'uploads'),
	backups: path.join(dataDir, 'backups'),
	tmp: path.join(dataDir, 'tmp')
});

async function tempDir(dataDir: string, prefix: string): Promise<string> {
	const dir = path.join(paths(dataDir).tmp, `${prefix}-${randomUUID()}`);
	await mkdir(dir, { recursive: true });
	return dir;
}

export async function writeBackupArchive(db: Db, dataDir: string, outFile: string): Promise<void> {
	const work = await tempDir(dataDir, 'export');
	try {
		const snapshot = path.join(work, 'portfolio.db');
		db.$client.exec(`VACUUM INTO '${snapshot.replaceAll("'", "''")}'`);

		const zip = new yazl.ZipFile();
		zip.addBuffer(
			Buffer.from(
				JSON.stringify({
					format: FORMAT,
					schemaVersion: SCHEMA_VERSION,
					createdAt: new Date().toISOString()
				})
			),
			'manifest.json'
		);
		zip.addFile(snapshot, 'portfolio.db');
		zip.addEmptyDirectory('uploads');
		const uploads = paths(dataDir).uploads;
		const files = existsSync(uploads) ? await readdir(uploads) : [];
		for (const name of files.filter((n) => IMAGE_NAME.test(n))) {
			zip.addFile(path.join(uploads, name), `uploads/${name}`);
		}
		zip.end();
		await mkdir(path.dirname(outFile), { recursive: true });
		await pipeline(zip.outputStream, createWriteStream(outFile));
	} finally {
		await rm(work, { recursive: true, force: true });
	}
}

export async function createAutoBackup(db: Db, dataDir: string): Promise<string> {
	const stamp = new Date().toISOString().replace(/[:.]/g, '-');
	const name = `portfolio-backup-${stamp}-${randomUUID().slice(0, 6)}.zip`;
	await writeBackupArchive(db, dataDir, path.join(paths(dataDir).backups, name));
	const all = await listBackups(dataDir);
	for (const old of all.slice(MAX_BACKUPS)) {
		await rm(path.join(paths(dataDir).backups, old.name), { force: true });
	}
	return name;
}

export async function listBackups(
	dataDir: string
): Promise<{ name: string; size: number; createdAt: Date }[]> {
	const dir = paths(dataDir).backups;
	if (!existsSync(dir)) return [];
	const names = (await readdir(dir))
		.filter((n) => BACKUP_NAME.test(n))
		.sort()
		.reverse();
	return Promise.all(
		names.map(async (name) => {
			const s = await stat(path.join(dir, name));
			return { name, size: s.size, createdAt: s.mtime };
		})
	);
}

function allowedEntry(name: string): boolean {
	return (
		name === 'manifest.json' ||
		name === 'portfolio.db' ||
		name === 'uploads/' ||
		/^uploads\/[a-z0-9-]+\.webp$/.test(name)
	);
}

function extract(archive: string, dest: string): Promise<void> {
	return new Promise((resolve, reject) => {
		yauzl.open(archive, { lazyEntries: true }, (err, zip) => {
			if (err || !zip) return reject(new BackupError('Файл не похож на zip-архив'));
			let unpacked = 0;
			const fail = (message: string) => {
				zip.close();
				reject(new BackupError(message));
			};
			zip.on('error', () => fail('Архив повреждён'));
			zip.on('end', () => resolve());
			zip.on('entry', (entry: yauzl.Entry) => {
				const name = entry.fileName;
				const isSymlink = ((entry.externalFileAttributes >>> 16) & 0o170000) === 0o120000;
				if (isSymlink) return fail(`В архиве ссылка: ${name}`);
				if (!allowedEntry(name)) return fail(`Лишний файл в архиве: ${name}`);
				if (name.endsWith('/')) {
					mkdir(path.join(dest, name), { recursive: true }).then(() => zip.readEntry(), reject);
					return;
				}
				unpacked += entry.uncompressedSize;
				if (unpacked > MAX_UNPACKED_BYTES) return fail('Архив слишком большой после распаковки');
				zip.openReadStream(entry, async (streamErr, stream) => {
					if (streamErr || !stream) return fail('Архив повреждён');
					try {
						const target = path.join(dest, name);
						await mkdir(path.dirname(target), { recursive: true });
						await pipeline(stream, createWriteStream(target));
						zip.readEntry();
					} catch {
						fail('Не удалось распаковать архив');
					}
				});
			});
			zip.readEntry();
		});
	});
}

async function validate(dir: string): Promise<void> {
	let manifest: { format?: unknown; schemaVersion?: unknown };
	try {
		manifest = JSON.parse(await readFile(path.join(dir, 'manifest.json'), 'utf8'));
	} catch {
		throw new BackupError('В архиве нет manifest.json');
	}
	if (manifest.format !== FORMAT) throw new BackupError('Неизвестный формат архива');

	let raw: Database.Database;
	try {
		raw = new Database(path.join(dir, 'portfolio.db'), { readonly: true, fileMustExist: true });
	} catch {
		throw new BackupError('В архиве нет базы portfolio.db');
	}
	try {
		let integrity: unknown;
		try {
			integrity = raw.pragma('integrity_check', { simple: true });
		} catch {
			throw new BackupError('portfolio.db — не база SQLite');
		}
		if (integrity !== 'ok') throw new BackupError('База в архиве повреждена');
		const version = raw.pragma('user_version', { simple: true }) as number;
		if (version > SCHEMA_VERSION) {
			throw new BackupError('Архив сделан более новой версией сайта — сначала обновите сайт');
		}
		const hasTable = (name: string) =>
			!!raw.prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?`).get(name);
		if (!hasTable('settings')) throw new BackupError('В базе нет таблицы settings');

		if (hasTable('projects')) {
			const images = raw
				.prepare(`SELECT image FROM projects WHERE image IS NOT NULL`)
				.pluck()
				.all() as string[];
			const missing = images.filter((img) => !existsSync(path.join(dir, 'uploads', img)));
			if (missing.length) throw new BackupError(`В архиве нет картинок: ${missing.join(', ')}`);
		}
	} finally {
		raw.close();
	}
}

async function moveIfExists(from: string, to: string): Promise<void> {
	if (existsSync(from)) await rename(from, to);
}

const DB_SUFFIXES = ['', '-wal', '-shm'];

export async function importBackup(
	archive: string,
	dataDir: string,
	ctx: ImportContext
): Promise<void> {
	const p = paths(dataDir);
	const work = await tempDir(dataDir, 'import');
	const incoming = path.join(work, 'incoming');
	const rollback = path.join(work, 'rollback');
	try {
		await mkdir(incoming);
		await extract(archive, incoming);
		await validate(incoming);
		await mkdir(path.join(incoming, 'uploads'), { recursive: true });

		await createAutoBackup(ctx.db, dataDir);

		const kept = ctx.keepSessionToken
			? ctx.db
					.select()
					.from(sessions)
					.where(eq(sessions.id, hashToken(ctx.keepSessionToken)))
					.get()
			: undefined;

		ctx.close();
		await mkdir(rollback);
		for (const suffix of DB_SUFFIXES) {
			await moveIfExists(p.db + suffix, path.join(rollback, `portfolio.db${suffix}`));
		}
		await moveIfExists(p.uploads, path.join(rollback, 'uploads'));

		let db: Db;
		try {
			await rename(path.join(incoming, 'portfolio.db'), p.db);
			await rename(path.join(incoming, 'uploads'), p.uploads);
			db = ctx.open();
		} catch (e) {
			await rm(p.db, { force: true });
			await rm(p.uploads, { recursive: true, force: true });
			for (const suffix of DB_SUFFIXES) {
				await moveIfExists(path.join(rollback, `portfolio.db${suffix}`), p.db + suffix);
			}
			await moveIfExists(path.join(rollback, 'uploads'), p.uploads);
			ctx.open();
			throw new BackupError(`Не удалось открыть базу из архива: ${(e as Error).message}`);
		}

		db.delete(sessions).run();
		if (kept) db.insert(sessions).values(kept).run();
	} finally {
		await rm(work, { recursive: true, force: true });
	}
}
