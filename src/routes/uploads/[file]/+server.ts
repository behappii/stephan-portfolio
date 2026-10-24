import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { IMAGE_NAME, uploadsDir } from '#lib/server/uploads.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	if (!IMAGE_NAME.test(params.file)) error(404, 'Не найдено');
	try {
		const body = await readFile(path.join(uploadsDir(), params.file));
		return new Response(body, {
			headers: {
				'content-type': 'image/webp',
				'cache-control': 'public, max-age=31536000, immutable'
			}
		});
	} catch {
		error(404, 'Не найдено');
	}
};
