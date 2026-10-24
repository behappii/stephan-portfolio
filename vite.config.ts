import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { existsSync } from 'node:fs';

// Серверный код читает настройки из process.env, как в продакшене (Docker передаёт их через env_file).
// В dev и preview подхватываем .env; переменные, уже заданные в окружении, не перезаписываются.
if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		})
	],
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
