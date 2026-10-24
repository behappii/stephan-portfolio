import { error, fail, redirect } from '@sveltejs/kit';
import { approachStepSchema, parseForm } from '#lib/schemas.ts';
import { parseId } from '#lib/server/admin-actions.ts';
import { getDb } from '#lib/server/db/index.ts';
import { createApproachStep, getApproachStep, updateApproachStep } from '#lib/server/repo/lists.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const id = parseId(params.id);
	if (id === 'new') return { item: null };
	const item = getApproachStep(getDb(), id);
	if (!item) error(404, 'Этап не найден');
	return { item };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = parseId(params.id);
		const result = parseForm(approachStepSchema, await request.formData());
		if (!result.ok) return fail(400, { errors: result.errors, values: result.values });
		const db = getDb();
		if (id === 'new') {
			createApproachStep(db, result.data);
			redirect(303, '/admin/approach');
		}
		if (!getApproachStep(db, id)) error(404, 'Этап не найден');
		updateApproachStep(db, id, result.data);
		return { saved: true };
	}
};
