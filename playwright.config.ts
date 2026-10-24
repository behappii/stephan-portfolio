import { hash } from '@node-rs/argon2';
import { defineConfig } from '@playwright/test';
import { E2E_PASSWORD } from './e2e/helpers';

const passwordHash = await hash(E2E_PASSWORD);

export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.test.ts',
	workers: 1,
	use: { baseURL: 'http://localhost:4173' },
	webServer: {
		command: 'rm -rf e2e/.data && pnpm build && pnpm preview --port 4173 --strictPort',
		port: 4173,
		reuseExistingServer: false,
		timeout: 180_000,
		env: {
			DATA_DIR: 'e2e/.data',
			ADMIN_PASSWORD_HASH: passwordHash,
			ORIGIN: 'http://localhost:4173',
			BODY_SIZE_LIMIT: '100M'
		}
	}
});
