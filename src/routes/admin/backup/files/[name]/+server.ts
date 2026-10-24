import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { BACKUP_NAME } from '#lib/server/backup.ts';
import { dataDir } from '#lib/server/config.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	if (!BACKUP_NAME.test(params.name)) error(404, 'Не найдено');
	try {
		const body = await readFile(path.join(dataDir(), 'backups', params.name));
		return new Response(body, {
			headers: {
				'content-type': 'application/zip',
				'content-disposition': `attachment; filename="${params.name}"`
			}
		});
	} catch {
		error(404, 'Не найдено');
	}
};
