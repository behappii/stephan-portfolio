import { getDb } from '#lib/server/db/index.ts';
import { approachSteps } from '#lib/server/db/schema.ts';
import { sortableActions } from '#lib/server/admin-actions.ts';
import { deleteApproachStep, listApproachSteps } from '#lib/server/repo/lists.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ items: listApproachSteps(getDb()) });

export const actions = sortableActions(approachSteps, deleteApproachStep);
