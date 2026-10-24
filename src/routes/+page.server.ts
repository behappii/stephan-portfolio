import { getPageContent } from '#lib/server/content.ts';
import { getDb } from '#lib/server/db/index.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ content: getPageContent(getDb()) });
