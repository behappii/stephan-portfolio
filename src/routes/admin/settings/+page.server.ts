import { fail } from '@sveltejs/kit';
import { parseForm, settingsSchema } from '#lib/schemas.ts';
import { getDb } from '#lib/server/db/index.ts';
import { getSettings, updateSettings } from '#lib/server/repo/settings.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ settings: getSettings(getDb()) });

export const actions: Actions = {
	default: async ({ request }) => {
		const result = parseForm(settingsSchema, await request.formData());
		if (!result.ok) return fail(400, { errors: result.errors, values: result.values });
		updateSettings(getDb(), result.data);
		return { saved: true };
	}
};
