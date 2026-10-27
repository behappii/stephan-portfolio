import { siteOrigin } from '#lib/server/config.ts';
import type { RequestHandler } from './$types';

/** Сайт из одной страницы: в карте только главная. */
export const GET: RequestHandler = ({ url }) =>
	new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url><loc>${siteOrigin(url)}/</loc></url>
</urlset>
`,
		{ headers: { 'content-type': 'application/xml; charset=utf-8' } }
	);
