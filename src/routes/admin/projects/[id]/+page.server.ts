import { error, fail, redirect } from '@sveltejs/kit';
import { parseForm, projectSchema } from '#lib/schemas.ts';
import { parseId } from '#lib/server/admin-actions.ts';
import { getDb } from '#lib/server/db/index.ts';
import { createProject, getProject, updateProject } from '#lib/server/repo/lists.ts';
import { deleteImage, saveImage, UploadError } from '#lib/server/uploads.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const id = parseId(params.id);
	if (id === 'new') return { item: null };
	const item = getProject(getDb(), id);
	if (!item) error(404, 'Проект не найден');
	return { item };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = parseId(params.id);
		const db = getDb();
		const existing = id === 'new' ? null : getProject(db, id);
		if (id !== 'new' && !existing) error(404, 'Проект не найден');

		const form = await request.formData();
		const result = parseForm(projectSchema, form);
		if (!result.ok) return fail(400, { errors: result.errors, values: result.values });

		const file = form.get('image');
		let newImage: string | null = null;
		if (file instanceof File && file.size > 0) {
			try {
				newImage = await saveImage(file);
			} catch (e) {
				if (!(e instanceof UploadError)) throw e;
				const errors: Record<string, string> = { image: e.message };
				const values: Record<string, string> = {};
				for (const [key, value] of form) if (typeof value === 'string') values[key] = value;
				return fail(400, { errors, values });
			}
		}

		const oldImage = existing?.image ?? null;
		const removeImage = form.get('removeImage') === 'on';
		const image = newImage ?? (removeImage ? null : oldImage);

		try {
			if (id === 'new') createProject(db, { ...result.data, image });
			else updateProject(db, id, { ...result.data, image });
		} catch (e) {
			await deleteImage(newImage);
			throw e;
		}
		if (oldImage && oldImage !== image) await deleteImage(oldImage);

		if (id === 'new') redirect(303, '/admin/projects');
		return { saved: true };
	}
};
