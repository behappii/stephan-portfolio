import { dev } from '$app/env';
import { fail, redirect } from '@sveltejs/kit';
import { attemptLogin, createSession, RateLimiter, SESSION_COOKIE } from '#lib/server/auth.ts';
import { getDb } from '#lib/server/db/index.ts';
import type { Actions, PageServerLoad } from './$types';

const limiter = new RateLimiter();

export const load: PageServerLoad = ({ locals }) => {
	if (locals.admin) redirect(303, '/admin');
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const ip = getClientAddress();
		if (limiter.isBlocked(ip)) {
			return fail(429, { error: 'Слишком много попыток. Попробуйте через 15 минут.' });
		}
		const password = String((await request.formData()).get('password') ?? '');
		const result = await attemptLogin(limiter, ip, password, process.env.ADMIN_PASSWORD_HASH);
		if (result === 'blocked') {
			return fail(429, { error: 'Слишком много попыток. Попробуйте через 15 минут.' });
		}
		if (result === 'invalid') return fail(400, { error: 'Неверный пароль' });
		const { token, expiresAt } = createSession(getDb());
		cookies.set(SESSION_COOKIE, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			expires: expiresAt
		});
		redirect(303, '/admin');
	}
};
