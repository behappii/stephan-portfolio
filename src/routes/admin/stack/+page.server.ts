import { getDb } from '#lib/server/db/index.ts';
import { stackItems } from '#lib/server/db/schema.ts';
import { sortableActions } from '#lib/server/admin-actions.ts';
import { deleteStackItem, listStackItems } from '#lib/server/repo/lists.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ items: listStackItems(getDb()) });

export const actions = sortableActions(stackItems, deleteStackItem);
