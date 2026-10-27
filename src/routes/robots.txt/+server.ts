import { siteOrigin } from '#lib/server/config.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) =>
	new Response(
		['User-agent: *', 'Disallow: /admin', '', `Sitemap: ${siteOrigin(url)}/sitemap.xml`, ''].join(
			'\n'
		),
		{ headers: { 'content-type': 'text/plain; charset=utf-8' } }
	);
