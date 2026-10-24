import { getDb } from '#lib/server/db/index.ts';
import { links } from '#lib/server/db/schema.ts';
import { sortableActions } from '#lib/server/admin-actions.ts';
import { deleteLink, listLinks } from '#lib/server/repo/lists.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ items: listLinks(getDb()) });

export const actions = sortableActions(links, deleteLink);
