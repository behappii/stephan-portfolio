import { countPlaceholders, getPageContent } from '#lib/server/content.ts';
import { getDb } from '#lib/server/db/index.ts';
import { listProjects } from '#lib/server/repo/lists.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const db = getDb();
	const c = getPageContent(db);
	return {
		placeholders: countPlaceholders(db),
		counts: {
			stack: c.stack.length,
			projects: listProjects(db).length,
			published: c.projects.length,
			approach: c.approach.length,
			links: c.links.length
		}
	};
};
