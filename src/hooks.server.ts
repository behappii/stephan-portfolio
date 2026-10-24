import { redirect } from '@sveltejs/kit';
import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { SESSION_COOKIE, validateSession } from '#lib/server/auth.ts';
import { getDb, initDb } from '#lib/server/db/index.ts';

export const init: ServerInit = () => {
	initDb();
};

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE) ?? null;
	const admin = token !== null && validateSession(getDb(), token);
	event.locals.admin = admin;
	event.locals.sessionToken = admin ? token : null;

	const { pathname } = event.url;
	if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !admin) {
		redirect(303, '/admin/login');
	}
	return resolve(event);
};
