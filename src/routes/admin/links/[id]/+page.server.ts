import { error, fail, redirect } from '@sveltejs/kit';
import { linkSchema, parseForm } from '#lib/schemas.ts';
import { parseId } from '#lib/server/admin-actions.ts';
import { getDb } from '#lib/server/db/index.ts';
import { createLink, getLink, updateLink } from '#lib/server/repo/lists.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const id = parseId(params.id);
	if (id === 'new') return { item: null };
	const item = getLink(getDb(), id);
	if (!item) error(404, 'Ссылка не найдена');
	return { item };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = parseId(params.id);
		const result = parseForm(linkSchema, await request.formData());
		if (!result.ok) return fail(400, { errors: result.errors, values: result.values });
		const db = getDb();
		if (id === 'new') {
			createLink(db, result.data);
			redirect(303, '/admin/links');
		}
		if (!getLink(db, id)) error(404, 'Ссылка не найдена');
		updateLink(db, id, result.data);
		return { saved: true };
	}
};
