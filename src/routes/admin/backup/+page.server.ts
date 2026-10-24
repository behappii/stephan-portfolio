import { fail } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
	BACKUP_NAME,
	BackupError,
	createAutoBackup,
	importBackup,
	listBackups
} from '#lib/server/backup.ts';
import { dataDir } from '#lib/server/config.ts';
import { closeDb, getDb, initDb } from '#lib/server/db/index.ts';
import type { Actions, PageServerLoad } from './$types';

const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;

export const load: PageServerLoad = async () => ({ backups: await listBackups(dataDir()) });

async function runImport(archive: string, sessionToken: string | null) {
	try {
		await importBackup(archive, dataDir(), {
			db: getDb(),
			close: closeDb,
			open: initDb,
			keepSessionToken: sessionToken
		});
		return { message: 'Данные восстановлены из архива' };
	} catch (e) {
		if (e instanceof BackupError) return fail(400, { error: e.message });
		throw e;
	}
}

export const actions: Actions = {
	snapshot: async () => {
		await createAutoBackup(getDb(), dataDir());
		return { message: 'Бэкап создан' };
	},

	import: async ({ request, locals }) => {
		const file = (await request.formData()).get('archive');
		if (!(file instanceof File) || file.size === 0)
			return fail(400, { error: 'Выберите zip-архив' });
		if (file.size > MAX_ARCHIVE_BYTES) return fail(400, { error: 'Архив больше 100 МБ' });

		const tmp = path.join(dataDir(), 'tmp', `upload-${randomUUID()}.zip`);
		await mkdir(path.dirname(tmp), { recursive: true });
		await writeFile(tmp, Buffer.from(await file.arrayBuffer()));
		try {
			return await runImport(tmp, locals.sessionToken);
		} finally {
			await rm(tmp, { force: true });
		}
	},

	restore: async ({ request, locals }) => {
		const name = String((await request.formData()).get('name') ?? '');
		if (!BACKUP_NAME.test(name)) return fail(400, { error: 'Нет такого бэкапа' });
		return runImport(path.join(dataDir(), 'backups', name), locals.sessionToken);
	}
};
