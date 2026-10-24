import { verify } from '@node-rs/argon2';
import { createHash, randomBytes } from 'node:crypto';
import { eq, lt } from 'drizzle-orm';
import type { Db } from './db/client';
import { sessions } from './db/schema';

export const SESSION_COOKIE = 'session';
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function verifyPassword(password: string, hash: string | undefined): Promise<boolean> {
	if (!hash) return false;
	try {
		return await verify(hash, password);
	} catch {
		return false;
	}
}

export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export function createSession(db: Db, now = new Date()): { token: string; expiresAt: Date } {
	const token = randomBytes(32).toString('base64url');
	const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
	db.delete(sessions).where(lt(sessions.expiresAt, now)).run();
	db.insert(sessions)
		.values({ id: hashToken(token), expiresAt })
		.run();
	return { token, expiresAt };
}

export function validateSession(db: Db, token: string, now = new Date()): boolean {
	const row = db
		.select()
		.from(sessions)
		.where(eq(sessions.id, hashToken(token)))
		.get();
	return !!row && row.expiresAt > now;
}

export function deleteSession(db: Db, token: string): void {
	db.delete(sessions)
		.where(eq(sessions.id, hashToken(token)))
		.run();
}

/** Счётчик неудачных входов в памяти процесса. */
export class RateLimiter {
	#failures = new Map<string, number[]>();
	readonly limit: number;
	readonly windowMs: number;

	constructor(limit = 5, windowMs = 15 * 60_000) {
		this.limit = limit;
		this.windowMs = windowMs;
	}

	get size(): number {
		return this.#failures.size;
	}

	isBlocked(key: string, now = Date.now()): boolean {
		return this.#recent(key, now).length >= this.limit;
	}

	registerFailure(key: string, now = Date.now()): void {
		this.#prune(now);
		this.#failures.set(key, [...this.#recent(key, now), now]);
	}

	reset(key: string): void {
		this.#failures.delete(key);
	}

	#recent(key: string, now: number): number[] {
		return (this.#failures.get(key) ?? []).filter((t) => now - t < this.windowMs);
	}

	#prune(now: number): void {
		for (const key of this.#failures.keys()) {
			if (this.#recent(key, now).length === 0) this.#failures.delete(key);
		}
	}
}
