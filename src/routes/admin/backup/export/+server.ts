import { randomUUID } from 'node:crypto';
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { writeBackupArchive } from '#lib/server/backup.ts';
import { dataDir } from '#lib/server/config.ts';
import { getDb } from '#lib/server/db/index.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const file = path.join(dataDir(), 'tmp', `export-${randomUUID()}.zip`);
	try {
		await writeBackupArchive(getDb(), dataDir(), file);
		const body = await readFile(file);
		const date = new Date().toISOString().slice(0, 10);
		return new Response(body, {
			headers: {
				'content-type': 'application/zip',
				'content-disposition': `attachment; filename="portfolio-backup-${date}.zip"`
			}
		});
	} finally {
		await rm(file, { force: true });
	}
};
