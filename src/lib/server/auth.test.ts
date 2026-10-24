import { hash } from '@node-rs/argon2';
import { describe, expect, it } from 'vitest';
import {
	createSession,
	deleteSession,
	RateLimiter,
	SESSION_TTL_MS,
	validateSession,
	verifyPassword
} from './auth';
import { sessions } from './db/schema';
import { createTestDb } from './testing';

describe('verifyPassword', () => {
	it('сверяет пароль с argon2-хешем', async () => {
		const h = await hash('секрет');
		expect(await verifyPassword('секрет', h)).toBe(true);
		expect(await verifyPassword('не тот', h)).toBe(false);
	});
	it('без хеша или с битым хешем — false', async () => {
		expect(await verifyPassword('x', undefined)).toBe(false);
		expect(await verifyPassword('x', 'garbage')).toBe(false);
	});
});

describe('сессии', () => {
	it('создаёт, проверяет и удаляет', () => {
		const db = createTestDb();
		const { token } = createSession(db);
		expect(validateSession(db, token)).toBe(true);
		expect(validateSession(db, 'чужой')).toBe(false);
		deleteSession(db, token);
		expect(validateSession(db, token)).toBe(false);
	});

	it('в базе хранится хеш, а не токен', () => {
		const db = createTestDb();
		const { token } = createSession(db);
		const ids = db
			.select()
			.from(sessions)
			.all()
			.map((s) => s.id);
		expect(ids).not.toContain(token);
	});

	it('просроченная сессия не принимается и чистится при новом входе', () => {
		const db = createTestDb();
		const start = new Date('2026-01-01T00:00:00Z');
		const { token } = createSession(db, start);
		const later = new Date(start.getTime() + SESSION_TTL_MS + 1);
		expect(validateSession(db, token, later)).toBe(false);
		createSession(db, later);
		expect(db.select().from(sessions).all()).toHaveLength(1);
	});
});

describe('RateLimiter', () => {
	it('блокирует после 5 неудач и отпускает через 15 минут', () => {
		const rl = new RateLimiter(5, 15 * 60_000);
		for (let i = 0; i < 5; i++) rl.registerFailure('1.2.3.4', 0);
		expect(rl.isBlocked('1.2.3.4', 1000)).toBe(true);
		expect(rl.isBlocked('5.6.7.8', 1000)).toBe(false);
		expect(rl.isBlocked('1.2.3.4', 15 * 60_000 + 1)).toBe(false);
	});

	it('reset снимает блокировку, старые ключи вычищаются', () => {
		const rl = new RateLimiter(5, 1000);
		rl.registerFailure('a', 0);
		rl.reset('a');
		expect(rl.size).toBe(0);
		rl.registerFailure('b', 0);
		rl.registerFailure('c', 5000);
		expect(rl.size).toBe(1);
	});
});
