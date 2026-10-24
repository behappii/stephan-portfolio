import { hash } from '@node-rs/argon2';
import { defineConfig } from '@playwright/test';
import { E2E_PASSWORD } from './e2e/helpers';

const passwordHash = await hash(E2E_PASSWORD);

export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.test.ts',
	workers: 1,
	// Как за прокси: протокол приходит в заголовке, иначе adapter-node считает его https и режет формы по CSRF.
	use: { baseURL: 'http://localhost:4173', extraHTTPHeaders: { 'x-forwarded-proto': 'http' } },
	webServer: {
		// Тот же сервер adapter-node, что и в Docker, а не vite preview.
		command: 'rm -rf e2e/.data && pnpm build && node build',
		port: 4173,
		reuseExistingServer: false,
		timeout: 180_000,
		env: {
			DATA_DIR: 'e2e/.data',
			ADMIN_PASSWORD_HASH: passwordHash,
			PORT: '4173',
			PROTOCOL_HEADER: 'x-forwarded-proto',
			BODY_SIZE_LIMIT: '100M'
		}
	}
});
