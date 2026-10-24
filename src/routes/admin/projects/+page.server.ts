import { getDb } from '#lib/server/db/index.ts';
import { projects } from '#lib/server/db/schema.ts';
import { sortableActions } from '#lib/server/admin-actions.ts';
import { deleteProject, listProjects } from '#lib/server/repo/lists.ts';
import { deleteImage } from '#lib/server/uploads.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ items: listProjects(getDb()) });

export const actions = sortableActions(projects, async (db, id) => {
	await deleteImage(deleteProject(db, id));
});
