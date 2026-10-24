# Портфолио behappii.ru с админкой — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Одностраничный сайт-портфолио по макету Violet Aero с админкой, где владелец редактирует весь контент, загружает скриншоты и делает импорт/экспорт базы.

**Architecture:** Одно SvelteKit-приложение на `adapter-node`. Данные — SQLite (`better-sqlite3` + Drizzle), картинки — WebP-файлы в `DATA_DIR/uploads`. Серверные модули в `src/lib/server/` принимают `db: Db` первым аргументом и тестируются на базе в памяти; маршруты берут базу из синглтона `getDb()`. Админка — form actions SvelteKit под защитой проверки сессии в `hooks.server.ts`.

**Tech Stack:** SvelteKit 3, Svelte 5 (runes), TypeScript, Tailwind CSS 4, Drizzle ORM, better-sqlite3, Zod 4, sharp, @node-rs/argon2, yazl/yauzl, Vitest, Playwright, Docker.

**Spec:** `docs/superpowers/specs/2026-10-25-portfolio-admin-design.md`

## Global Constraints

- Node 24, pnpm; новые зависимости ставятся через `pnpm add`.
- Svelte 5 runes (`$props`, `$state`, `$derived`, snippets); `export let` и слоты не использовать.
- TypeScript strict; `any` не использовать.
- Серверные настройки читаются из `process.env`: `DATA_DIR` (по умолчанию `./data`), `MIGRATIONS_DIR` (по умолчанию `./drizzle`), `ADMIN_PASSWORD_HASH`, `ORIGIN`, `ADDRESS_HEADER`, `BODY_SIZE_LIMIT`.
- Все тексты интерфейса — на русском, по правилам голоса Violet Aero: без эмодзи, восклицательных знаков и превосходных степеней.
- Цвета, радиусы и тени — только из токенов Violet Aero (`var(--…)` или утилиты Tailwind из `theme.css`); новых HEX-значений не вводить, кроме перенесённых из макета декоративных градиентов.
- Всё, что нажимается, — не ниже 44px и с видимым `focus-ring`.
- Без `alert()`, `confirm()`, `prompt()`.
- Картинки: JPEG/PNG/WebP до 5 МБ, ширина до 1600px, сохраняются как `<uuid>.webp`.
- Архив бэкапа — до 100 МБ, автобэкапов хранится 10.
- Сессия — 30 дней; rate limit — 5 неудачных входов с IP за 15 минут.
- Перед каждым коммитом проходят `pnpm check`, `pnpm lint`, `pnpm test`.
- Каждое сообщение коммита заканчивается строкой `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Уточнения к спецификации

Найдены при разборе макета; спецификация обновлена в задаче 1.

- Иконок стека шесть, а не пять: в макете у карточки «Нейросети» иконка-искра (`ai`), которой нет в `assets/icons/`. Набор: `web`, `mobile`, `desktop`, `infra`, `design`, `ai`.
- Поля `hero_eyebrow` нет: плашка над заголовком собирается как `«{name} · {city}»`. Футер — `«© {footer_year} {name}»`.
- Версия схемы — `PRAGMA user_version` и константа `SCHEMA_VERSION` в коде (а не последняя миграция drizzle-kit): так её легко прочитать из импортируемого файла.
- При ошибке на шаге замены файлов импорт возвращает на место переименованные исходные файлы (это быстрее и надёжнее, чем распаковка автобэкапа; автобэкап всё равно создаётся).
- Импорт дополнительно отклоняет архив, в котором проект ссылается на картинку, которой нет в `uploads/`.

## Review Focus

1. Картинка с огромными размерами в пикселях (например, PNG 30000×30000 при малом весе файла) — должна отклоняться с понятной ошибкой, а не уронить процесс по памяти. Тест — задача 9.
2. Устаревший id: перемещение, удаление или открытие на редактирование записи, которую уже удалили в другой вкладке, — ничего не ломает, а страница редактирования отвечает 404. Тесты — задача 5 (репозиторий) и задача 16 (страница).
3. Восстановление самого старого автобэкапа, когда их уже 10: автобэкап перед импортом удаляет при ротации старейший файл — тот самый, который восстанавливаем. Восстановление должно пройти. Тест — задача 10.
4. Архив, в котором база ссылается на картинки, отсутствующие в `uploads/` (например, собранный вручную), — должен быть отклонён, текущие данные не меняются. Тест — задача 10.
5. Грязный ввод тегов: `" SvelteKit, , sveltekit ,Docker,"` — пробелы обрезаются, пустые выбрасываются, дубли без учёта регистра схлопываются с сохранением первого написания. Тест — задача 4.

## Карта файлов

```
drizzle.config.ts                       — конфиг drizzle-kit
drizzle/                                — сгенерированные SQL-миграции
playwright.config.ts                    — e2e
Dockerfile, .dockerignore, docker-compose.yml, Caddyfile.example, .env.example
scripts/hash-password.ts                — генерация ADMIN_PASSWORD_HASH
e2e/                                    — сценарии Playwright
src/app.d.ts                            — App.Locals
src/app.html                            — lang="ru", шрифты
src/hooks.server.ts                     — init (база), handle (сессия, защита /admin)
src/lib/icons.ts                        — имена иконок стека и подписи (общий для клиента и сервера)
src/lib/schemas.ts                      — Zod-схемы форм, parseTags, parseForm
src/lib/styles/tokens.css               — токены Violet Aero (копия)
src/lib/styles/components.css           — классы .va-* (копия bundle.css)
src/lib/styles/theme.css                — @theme Tailwind поверх токенов
src/lib/styles/story.css                — анимации прокрутки разделов
src/lib/assets/                         — логотипы, фавиконка
src/lib/ui/*.svelte                     — порты компонентов Violet Aero
src/lib/sections/*.svelte               — разделы главной
src/lib/admin/*.svelte                  — компоненты админки
src/lib/server/config.ts                — пути из окружения
src/lib/server/db/schema.ts             — таблицы
src/lib/server/db/client.ts             — openDatabase, SCHEMA_VERSION, тип Db
src/lib/server/db/index.ts              — синглтон initDb/getDb/closeDb
src/lib/server/db/seed.ts               — тексты из макета
src/lib/server/testing.ts               — createTestDb для тестов
src/lib/server/repo/settings.ts         — настройки
src/lib/server/repo/sortable.ts         — nextSort, moveItem
src/lib/server/repo/lists.ts            — CRUD стека, проектов, этапов, ссылок
src/lib/server/content.ts               — getPageContent, countPlaceholders
src/lib/server/auth.ts                  — пароль, сессии, RateLimiter
src/lib/server/uploads.ts               — saveImage, deleteImage
src/lib/server/backup.ts                — экспорт, импорт, автобэкапы
src/lib/server/admin-actions.ts         — общие действия списков (move, delete)
src/routes/+layout.svelte, +page.svelte, +page.server.ts, +error.svelte
src/routes/uploads/[file]/+server.ts
src/routes/admin/**                     — админка
```

---

### Task 1: Инструменты, зависимости и конфигурация

**Files:**
- Modify: `package.json`, `pnpm-workspace.yaml`, `vite.config.ts`, `.gitignore`, `.prettierignore`, `docs/superpowers/specs/2026-10-25-portfolio-admin-design.md`
- Create: `src/lib/server/config.ts`, `src/lib/server/config.test.ts`

**Interfaces:**
- Produces: `dataDir(): string`, `migrationsDir(): string` из `src/lib/server/config.ts`; скрипты `pnpm test`, `pnpm test:e2e`, `pnpm db:generate`, `pnpm hash-password`.

- [ ] **Step 1: Поставить зависимости**

```bash
pnpm add drizzle-orm better-sqlite3 zod sharp @node-rs/argon2 yazl yauzl
pnpm add -D drizzle-kit @types/better-sqlite3 @types/yazl @types/yauzl vitest @playwright/test @sveltejs/adapter-node
pnpm remove @sveltejs/adapter-auto
pnpm exec playwright install chromium
```

- [ ] **Step 2: Разрешить нативные сборки** — `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  esbuild: true
  better-sqlite3: true
  sharp: true
```

Затем `pnpm install` и проверить: `node -e "new (require('better-sqlite3'))(':memory:')"` выполняется без ошибки.

- [ ] **Step 3: Скрипты** — в `package.json` в `scripts` добавить:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"db:generate": "drizzle-kit generate",
"hash-password": "node scripts/hash-password.ts"
```

и поле верхнего уровня `"packageManager": "pnpm@<версия из pnpm -v>"` (нужно для corepack в Docker).

- [ ] **Step 4: `vite.config.ts`** — адаптер и Vitest:

```ts
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

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
```

- [ ] **Step 5: Игнор-файлы**

В `.gitignore` дописать:

```
# Data
/data
/e2e/.data
/test-results
/playwright-report
```

В `.prettierignore` дописать `/drizzle/` и `/e2e/.data/`.

- [ ] **Step 6: Написать падающий тест** — `src/lib/server/config.test.ts`:

```ts
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { dataDir, migrationsDir } from './config';

describe('config', () => {
	const saved = { ...process.env };
	afterEach(() => {
		process.env = { ...saved };
	});

	it('по умолчанию берёт ./data и ./drizzle', () => {
		delete process.env.DATA_DIR;
		delete process.env.MIGRATIONS_DIR;
		expect(dataDir()).toBe(path.resolve('data'));
		expect(migrationsDir()).toBe(path.resolve('drizzle'));
	});

	it('читает пути из окружения', () => {
		process.env.DATA_DIR = '/srv/portfolio';
		process.env.MIGRATIONS_DIR = '/app/drizzle';
		expect(dataDir()).toBe('/srv/portfolio');
		expect(migrationsDir()).toBe('/app/drizzle');
	});
});
```

- [ ] **Step 7: Убедиться, что тест падает**

Run: `pnpm test src/lib/server/config.test.ts`
Expected: FAIL — `Failed to resolve import "./config"`.

- [ ] **Step 8: Реализация** — `src/lib/server/config.ts`:

```ts
import path from 'node:path';

/** Папка с базой, картинками и бэкапами. */
export function dataDir(): string {
	return path.resolve(process.env.DATA_DIR ?? 'data');
}

/** Папка с SQL-миграциями drizzle-kit. */
export function migrationsDir(): string {
	return path.resolve(process.env.MIGRATIONS_DIR ?? 'drizzle');
}
```

- [ ] **Step 9: Тест проходит**

Run: `pnpm test src/lib/server/config.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 10: Обновить спецификацию** — в `docs/superpowers/specs/2026-10-25-portfolio-admin-design.md`:
  - в таблице `settings` убрать `hero_eyebrow`, после таблицы добавить строку «Плашка над заголовком первого экрана — `{name} · {city}`, футер — `© {footer_year} {name}`.»;
  - у `stack_items.icon` заменить список на `web | mobile | desktop | infra | design | ai`, в разделе «Списки и формы» — «из шести иконок системы (`ai` — искра из макета)»;
  - в «Миграции и наполнение» добавить: «Версия схемы — `PRAGMA user_version`, равная константе `SCHEMA_VERSION`; её же пишет `manifest.json`.»;
  - в «Экспорт и импорт», шаг 2, добавить «каждая картинка, на которую ссылается `projects.image`, есть в `uploads/`»; шаг 5 заменить на «При ошибке на шагах 1–3 текущие данные не меняются; при ошибке на шаге 4 исходные база и `uploads/` возвращаются на место.».

- [ ] **Step 11: Проверки и коммит**

Run: `pnpm check && pnpm lint && pnpm test`
Expected: всё без ошибок.

```bash
git add -A
git commit -m "chore: set up adapter-node, vitest, playwright and data deps

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Схема базы, миграции и клиент

**Files:**
- Create: `src/lib/icons.ts`, `src/lib/server/db/schema.ts`, `src/lib/server/db/client.ts`, `src/lib/server/testing.ts`, `drizzle.config.ts`, `drizzle/*` (генерируется)
- Test: `src/lib/server/db/client.test.ts`

**Interfaces:**
- Consumes: `migrationsDir()` (Task 1).
- Produces:
  - `src/lib/icons.ts`: `STACK_ICONS: readonly ['web','mobile','desktop','infra','design','ai']`, `type StackIcon`, `STACK_ICON_LABELS: Record<StackIcon, string>`.
  - `schema.ts`: таблицы `settings`, `stackItems`, `projects`, `approachSteps`, `links`, `sessions`; типы `Settings`, `StackItem`, `Project`, `ApproachStep`, `Link` (`$inferSelect`).
  - `client.ts`: `SCHEMA_VERSION = 1`, `type Db`, `openDatabase(file: string, migrationsFolder: string): Db`.
  - `testing.ts`: `createTestDb(): Db`.

- [ ] **Step 1: Имена иконок** — `src/lib/icons.ts`:

```ts
export const STACK_ICONS = ['web', 'mobile', 'desktop', 'infra', 'design', 'ai'] as const;
export type StackIcon = (typeof STACK_ICONS)[number];

export const STACK_ICON_LABELS: Record<StackIcon, string> = {
	web: 'Веб',
	mobile: 'Мобайл',
	desktop: 'Десктоп',
	infra: 'Инфраструктура',
	design: 'Дизайн',
	ai: 'Нейросети'
};
```

- [ ] **Step 2: Схема** — `src/lib/server/db/schema.ts`:

```ts
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { STACK_ICONS } from '../../icons';

const str = (name: string) => text(name).notNull().default('');
const tags = () =>
	text('tags', { mode: 'json' })
		.$type<string[]>()
		.notNull()
		.default(sql`'[]'`);

export const settings = sqliteTable('settings', {
	id: integer('id').primaryKey(),
	name: str('name'),
	city: str('city'),
	heroTitle: str('hero_title'),
	heroTitleAccent: str('hero_title_accent'),
	heroText: str('hero_text'),
	heroCtaPrimary: str('hero_cta_primary'),
	heroCtaSecondary: str('hero_cta_secondary'),
	stackEyebrow: str('stack_eyebrow'),
	stackTitle: str('stack_title'),
	stackSubtitle: str('stack_subtitle'),
	projectsEyebrow: str('projects_eyebrow'),
	projectsTitle: str('projects_title'),
	approachEyebrow: str('approach_eyebrow'),
	approachTitle: str('approach_title'),
	contactEyebrow: str('contact_eyebrow'),
	contactTitle: str('contact_title'),
	email: str('email'),
	footerYear: str('footer_year'),
	seoTitle: str('seo_title'),
	seoDescription: str('seo_description')
});

export const stackItems = sqliteTable('stack_items', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	sort: integer('sort').notNull(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	icon: text('icon', { enum: STACK_ICONS }).notNull(),
	tags: tags()
});

export const projects = sqliteTable('projects', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	sort: integer('sort').notNull(),
	title: text('title').notNull(),
	category: text('category').notNull(),
	year: text('year').notNull(),
	description: text('description').notNull(),
	image: text('image'),
	url: text('url'),
	tags: tags(),
	published: integer('published', { mode: 'boolean' }).notNull().default(true)
});

export const approachSteps = sqliteTable('approach_steps', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	sort: integer('sort').notNull(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	tags: tags()
});

export const links = sqliteTable('links', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	sort: integer('sort').notNull(),
	label: text('label').notNull(),
	url: text('url').notNull()
});

export const sessions = sqliteTable('sessions', {
	/** SHA-256 от токена из cookie, hex. */
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull()
});

export type Settings = typeof settings.$inferSelect;
export type StackItem = typeof stackItems.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ApproachStep = typeof approachSteps.$inferSelect;
export type Link = typeof links.$inferSelect;
```

- [ ] **Step 3: Конфиг drizzle-kit** — `drizzle.config.ts`:

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle'
});
```

В `tsconfig.json` в `include` добавить `"drizzle.config.ts"`, `"playwright.config.ts"`, `"e2e"`, `"scripts"`.

- [ ] **Step 4: Сгенерировать миграцию**

Run: `pnpm db:generate --name init`
Expected: в `drizzle/` появилась первая миграция с `CREATE TABLE` для шести таблиц.

- [ ] **Step 5: Написать падающий тест** — `src/lib/server/db/client.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createTestDb } from '../testing';
import { SCHEMA_VERSION } from './client';

describe('openDatabase', () => {
	it('применяет миграции и выставляет user_version', () => {
		const db = createTestDb();
		const tables = db.$client
			.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`)
			.pluck()
			.all();
		expect(tables).toEqual(
			expect.arrayContaining([
				'approach_steps',
				'links',
				'projects',
				'sessions',
				'settings',
				'stack_items'
			])
		);
		expect(db.$client.pragma('user_version', { simple: true })).toBe(SCHEMA_VERSION);
	});
});
```

- [ ] **Step 6: Убедиться, что тест падает**

Run: `pnpm test src/lib/server/db/client.test.ts`
Expected: FAIL — не находится `../testing`.

- [ ] **Step 7: Клиент** — `src/lib/server/db/client.ts`:

```ts
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

/** Повышается вместе с каждой новой миграцией. Пишется в PRAGMA user_version и manifest.json бэкапа. */
export const SCHEMA_VERSION = 1;

export type Db = BetterSQLite3Database & { $client: Database.Database };

export function openDatabase(file: string, migrationsFolder: string): Db {
	const sqlite = new Database(file);
	sqlite.pragma('journal_mode = WAL');
	sqlite.pragma('foreign_keys = ON');
	const db = drizzle({ client: sqlite });
	migrate(db, { migrationsFolder });
	sqlite.pragma(`user_version = ${SCHEMA_VERSION}`);
	return db;
}
```

`src/lib/server/testing.ts`:

```ts
import { migrationsDir } from './config';
import { openDatabase, type Db } from './db/client';

/** Пустая база в памяти с применёнными миграциями. */
export function createTestDb(): Db {
	return openDatabase(':memory:', migrationsDir());
}
```

- [ ] **Step 8: Тест проходит**

Run: `pnpm test src/lib/server/db/client.test.ts`
Expected: PASS.

- [ ] **Step 9: Проверки и коммит**

Run: `pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: add sqlite schema, migrations and db client

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Начальное наполнение и синглтон базы

**Files:**
- Create: `src/lib/server/db/seed.ts`, `src/lib/server/db/index.ts`
- Test: `src/lib/server/db/seed.test.ts`

**Interfaces:**
- Consumes: `openDatabase`, таблицы (Task 2), `dataDir()`, `migrationsDir()` (Task 1).
- Produces:
  - `seedIfEmpty(db: Db): boolean` — `true`, если наполнил.
  - `db/index.ts`: `initDb(): Db` (открывает `DATA_DIR/portfolio.db`, создаёт папку, наполняет пустую базу), `getDb(): Db` (бросает, если не открыта), `closeDb(): void`, `dbFile(): string`.

- [ ] **Step 1: Написать падающий тест** — `src/lib/server/db/seed.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createTestDb } from '../testing';
import { approachSteps, links, projects, settings, stackItems } from './schema';
import { seedIfEmpty } from './seed';

describe('seedIfEmpty', () => {
	it('заполняет пустую базу текстами из макета', () => {
		const db = createTestDb();
		expect(seedIfEmpty(db)).toBe(true);

		const s = db.select().from(settings).get();
		expect(s?.heroTitle).toBe('Ваша идея —');
		expect(s?.heroTitleAccent).toBe('моя задача');
		expect(s?.city).toBe('[город]');
		expect(db.select().from(stackItems).all()).toHaveLength(5);
		expect(db.select().from(projects).all()).toHaveLength(4);
		expect(db.select().from(approachSteps).all()).toHaveLength(4);
		expect(db.select().from(links).all().map((l) => l.label)).toEqual([
			'GitHub',
			'Telegram',
			'LinkedIn'
		]);
	});

	it('не трогает уже заполненную базу', () => {
		const db = createTestDb();
		seedIfEmpty(db);
		expect(seedIfEmpty(db)).toBe(false);
		expect(db.select().from(stackItems).all()).toHaveLength(5);
	});
});
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `pnpm test src/lib/server/db/seed.test.ts`
Expected: FAIL — нет модуля `./seed`.

- [ ] **Step 3: Наполнение** — `src/lib/server/db/seed.ts` (тексты взяты из `docs/design/portfolio/index.html`):

```ts
import type { Db } from './client';
import { approachSteps, links, projects, settings, stackItems } from './schema';

const PROJECT_TEXT = '[Одно предложение: что это, для кого и какую задачу решает]';

export function seedIfEmpty(db: Db): boolean {
	if (db.select().from(settings).get()) return false;

	db.transaction((tx) => {
		tx.insert(settings)
			.values({
				id: 1,
				name: 'Степан',
				city: '[город]',
				heroTitle: 'Ваша идея —',
				heroTitleAccent: 'моя задача',
				heroText:
					'Меня зовут Степан, веб-разработчик, студент ПГУ имени Шолом-Алейхема, обучаюсь по специальности информационные системы и технологии. Прототипирую интерфейсы с помощью нейросетей, пишу веб на SvelteKit и Next.js, мобильные приложения — на React Native и Flutter.',
				heroCtaPrimary: 'Обсудить проект',
				heroCtaSecondary: 'Смотреть проекты',
				stackEyebrow: 'стек',
				stackTitle: 'Работает везде',
				stackSubtitle: 'Подбираю инструмент под задачу, а не задачу под инструмент.',
				projectsEyebrow: 'проекты',
				projectsTitle: 'Избранные работы',
				approachEyebrow: 'подход',
				approachTitle: 'Сайт под ключ, исходники — ваши',
				contactEyebrow: 'контакты',
				contactTitle: 'Есть идея? Давайте соберём её',
				email: '[you@email.com]',
				footerYear: '[год]',
				seoTitle: 'behappii — веб-разработчик Степан',
				seoDescription:
					'Портфолио веб-разработчика: сайты, мобильные и десктопные приложения под ключ.'
			})
			.run();

		tx.insert(stackItems)
			.values([
				{ sort: 0, icon: 'web', title: 'Веб', description: 'Быстрые сайты и веб-приложения.', tags: ['SvelteKit', 'Next.js', 'WordPress'] },
				{ sort: 1, icon: 'mobile', title: 'Мобайл', description: 'Приложения для iOS и Android из одной кодовой базы.', tags: ['React Native', 'Flutter'] },
				{ sort: 2, icon: 'desktop', title: 'Десктоп', description: 'Лёгкие приложения для macOS, Windows и Linux.', tags: ['Tauri'] },
				{ sort: 3, icon: 'infra', title: 'Инфра­структура', description: 'CI/CD, контейнеры и деплой в облако.', tags: ['Docker', 'CI/CD'] },
				{ sort: 4, icon: 'ai', title: 'Нейросети', description: 'Прототипы за часы и разработка без рутины.', tags: ['Claude'] }
			])
			.run();

		tx.insert(projects)
			.values([
				{ sort: 0, title: '[Название проекта]', category: 'Веб', year: '[год]', description: PROJECT_TEXT, tags: ['SvelteKit', 'Docker'] },
				{ sort: 1, title: '[Название проекта]', category: 'Мобайл', year: '[год]', description: PROJECT_TEXT, tags: ['React Native'] },
				{ sort: 2, title: '[Название проекта]', category: 'Десктоп', year: '[год]', description: PROJECT_TEXT, tags: ['Tauri', 'SvelteKit'] },
				{ sort: 3, title: '[Название проекта]', category: 'Мобайл', year: '[год]', description: PROJECT_TEXT, tags: ['Flutter', 'Next.js'] }
			])
			.run();

		tx.insert(approachSteps)
			.values([
				{ sort: 0, title: 'Прототип', description: 'Собираю прототип с помощью нейросетей и согласовываю интерфейс до начала разработки.', tags: ['Claude'] },
				{ sort: 1, title: 'Разработка', description: 'Выбираю платформу под задачу: веб, мобильное или десктопное приложение — или всё сразу.', tags: ['SvelteKit', 'Next.js', 'React Native', 'Flutter', 'Tauri'] },
				{ sort: 2, title: 'Запуск', description: 'Настраиваю CI/CD и упаковываю в Docker, чтобы проект одинаково работал у вас, у меня и на сервере, — и передаю все исходники и доступы.', tags: ['Docker', 'CI/CD'] },
				{ sort: 3, title: 'Поддержка', description: 'По желанию размещаю и сопровождаю сервис на своей стороне: облачный хостинг, обновления, мониторинг. За отдельную плату.', tags: ['Облако'] }
			])
			.run();

		tx.insert(links)
			.values([
				{ sort: 0, label: 'GitHub', url: 'https://github.com/' },
				{ sort: 1, label: 'Telegram', url: 'https://t.me/' },
				{ sort: 2, label: 'LinkedIn', url: 'https://www.linkedin.com/' }
			])
			.run();
	});
	return true;
}
```

Prettier переформатирует длинные объекты при `pnpm format` — это нормально.

- [ ] **Step 4: Синглтон** — `src/lib/server/db/index.ts`:

```ts
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { dataDir, migrationsDir } from '../config';
import { openDatabase, type Db } from './client';
import { seedIfEmpty } from './seed';

let current: Db | null = null;

export function dbFile(): string {
	return path.join(dataDir(), 'portfolio.db');
}

/** Открывает базу приложения. Вызывается из init-хука и после импорта бэкапа. */
export function initDb(): Db {
	mkdirSync(dataDir(), { recursive: true });
	current = openDatabase(dbFile(), migrationsDir());
	seedIfEmpty(current);
	return current;
}

export function getDb(): Db {
	if (!current) throw new Error('База не открыта: initDb() ещё не вызывался');
	return current;
}

export function closeDb(): void {
	current?.$client.close();
	current = null;
}
```

- [ ] **Step 5: Тест проходит**

Run: `pnpm test src/lib/server/db`
Expected: PASS.

- [ ] **Step 6: Проверки и коммит**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: seed database with mockup content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Схемы форм и разбор ввода

**Files:**
- Create: `src/lib/schemas.ts`
- Test: `src/lib/schemas.test.ts`

**Interfaces:**
- Consumes: `STACK_ICONS` (Task 2).
- Produces:
  - `parseTags(raw: string): string[]`
  - `settingsSchema`, `stackItemSchema`, `projectSchema`, `approachStepSchema`, `linkSchema` (Zod) и типы `SettingsInput`, `StackItemInput`, `ProjectInput`, `ApproachStepInput`, `LinkInput` (`z.output`).
  - `parseForm<T>(schema, form: FormData): ParseResult<T>`, где `ParseResult<T> = { ok: true; data: T } | { ok: false; errors: Record<string, string>; values: Record<string, string> }`.

- [ ] **Step 1: Написать падающий тест** — `src/lib/schemas.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { linkSchema, parseForm, parseTags, projectSchema, settingsSchema, stackItemSchema } from './schemas';

function form(values: Record<string, string>): FormData {
	const f = new FormData();
	for (const [k, v] of Object.entries(values)) f.set(k, v);
	return f;
}

describe('parseTags', () => {
	it('чистит пробелы, пустые и дубли без учёта регистра', () => {
		expect(parseTags(' SvelteKit, , sveltekit ,Docker,')).toEqual(['SvelteKit', 'Docker']);
	});
	it('пустая строка даёт пустой массив', () => {
		expect(parseTags('')).toEqual([]);
	});
});

describe('parseForm', () => {
	it('возвращает данные при валидном вводе', () => {
		const r = parseForm(
			stackItemSchema,
			form({ title: ' Веб ', description: 'Сайты', icon: 'web', tags: 'SvelteKit, Next.js' })
		);
		expect(r).toEqual({
			ok: true,
			data: { title: 'Веб', description: 'Сайты', icon: 'web', tags: ['SvelteKit', 'Next.js'] }
		});
	});

	it('возвращает первую ошибку на поле и введённые значения', () => {
		const r = parseForm(stackItemSchema, form({ title: '', description: 'x', icon: 'rocket' }));
		expect(r.ok).toBe(false);
		if (r.ok) return;
		expect(r.errors.title).toBe('Обязательное поле');
		expect(r.errors.icon).toBeTruthy();
		expect(r.values.description).toBe('x');
	});

	it('проект: пустой url — null, без галочки — не опубликован', () => {
		const r = parseForm(
			projectSchema,
			form({ title: 'A', category: 'Веб', year: '2026', description: 'B', url: '', tags: '' })
		);
		expect(r.ok && r.data.url).toBe(null);
		expect(r.ok && r.data.published).toBe(false);
	});

	it('ссылка: только http и https', () => {
		expect(parseForm(linkSchema, form({ label: 'X', url: 'javascript:alert(1)' })).ok).toBe(false);
		expect(parseForm(linkSchema, form({ label: 'X', url: 'https://t.me/x' })).ok).toBe(true);
	});

	it('email принимает адрес или заглушку в скобках', () => {
		const base = Object.fromEntries(
			Object.keys(settingsSchema.shape).map((k) => [k, 'текст'])
		) as Record<string, string>;
		expect(parseForm(settingsSchema, form({ ...base, email: '[you@email.com]' })).ok).toBe(true);
		expect(parseForm(settingsSchema, form({ ...base, email: 'me@behappii.ru' })).ok).toBe(true);
		expect(parseForm(settingsSchema, form({ ...base, email: 'not-an-email' })).ok).toBe(false);
	});
});
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `pnpm test src/lib/schemas.test.ts`
Expected: FAIL — нет модуля `./schemas`.

- [ ] **Step 3: Реализация** — `src/lib/schemas.ts`:

```ts
import { z } from 'zod';
import { STACK_ICONS } from './icons';

z.config(z.locales.ru());

export function parseTags(raw: string): string[] {
	const seen = new Set<string>();
	const result: string[] = [];
	for (const part of raw.split(',')) {
		const tag = part.trim();
		const key = tag.toLowerCase();
		if (!tag || seen.has(key)) continue;
		seen.add(key);
		result.push(tag);
	}
	return result;
}

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => text(max).min(1, 'Обязательное поле');
const httpUrl = z.url({ protocol: /^https?$/, error: 'Нужна ссылка вида https://…' });
const tags = z.string().default('').transform(parseTags);
const placeholder = /^\[[^\]]+\]$/;

export const settingsSchema = z.object({
	name: required(80),
	city: required(80),
	heroTitle: required(120),
	heroTitleAccent: text(120),
	heroText: required(1000),
	heroCtaPrimary: required(40),
	heroCtaSecondary: required(40),
	stackEyebrow: required(40),
	stackTitle: required(120),
	stackSubtitle: text(300),
	projectsEyebrow: required(40),
	projectsTitle: required(120),
	approachEyebrow: required(40),
	approachTitle: required(120),
	contactEyebrow: required(40),
	contactTitle: required(120),
	email: required(200).refine(
		(v) => placeholder.test(v) || z.email().safeParse(v).success,
		'Нужен адрес почты'
	),
	footerYear: required(20),
	seoTitle: required(120),
	seoDescription: text(300)
});

export const stackItemSchema = z.object({
	title: required(60),
	description: required(300),
	icon: z.enum(STACK_ICONS),
	tags
});

export const projectSchema = z.object({
	title: required(120),
	category: required(40),
	year: required(20),
	description: required(500),
	url: z
		.string()
		.trim()
		.transform((v) => (v === '' ? null : v))
		.pipe(httpUrl.nullable()),
	tags,
	published: z.preprocess((v) => v === 'on' || v === 'true', z.boolean())
});

export const approachStepSchema = z.object({
	title: required(60),
	description: required(500),
	tags
});

export const linkSchema = z.object({
	label: required(40),
	url: z.string().trim().pipe(httpUrl)
});

export type SettingsInput = z.output<typeof settingsSchema>;
export type StackItemInput = z.output<typeof stackItemSchema>;
export type ProjectInput = z.output<typeof projectSchema>;
export type ApproachStepInput = z.output<typeof approachStepSchema>;
export type LinkInput = z.output<typeof linkSchema>;

export type ParseResult<T> =
	| { ok: true; data: T }
	| { ok: false; errors: Record<string, string>; values: Record<string, string> };

export function parseForm<S extends z.ZodType>(schema: S, form: FormData): ParseResult<z.output<S>> {
	const values: Record<string, string> = {};
	for (const [key, value] of form) if (typeof value === 'string') values[key] = value;

	const result = schema.safeParse(values);
	if (result.success) return { ok: true, data: result.data };

	const errors: Record<string, string> = {};
	for (const issue of result.error.issues) {
		const key = String(issue.path[0] ?? '');
		errors[key] ??= issue.message;
	}
	return { ok: false, errors, values };
}
```

- [ ] **Step 4: Тест проходит**

Run: `pnpm test src/lib/schemas.test.ts`
Expected: PASS. Если `required` для пустой строки выдаёт сообщение локали вместо «Обязательное поле» — убедиться, что `.min(1, 'Обязательное поле')` стоит после `.trim()`, как в коде выше.

- [ ] **Step 5: Проверки и коммит**

Run: `pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: add form schemas and tag parsing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Репозитории — настройки, списки, сортировка

**Files:**
- Create: `src/lib/server/repo/settings.ts`, `src/lib/server/repo/sortable.ts`, `src/lib/server/repo/lists.ts`
- Test: `src/lib/server/repo/repo.test.ts`

**Interfaces:**
- Consumes: `Db`, таблицы (Task 2), типы ввода (Task 4), `seedIfEmpty` (Task 3).
- Produces:
  - `settings.ts`: `getSettings(db): Settings` (бросает, если строки нет), `updateSettings(db, data: SettingsInput): void`.
  - `sortable.ts`: `type SortableTable`, `nextSort(db, table): number`, `moveItem(db, table, id: number, direction: 'up' | 'down'): void`.
  - `lists.ts`:
    - `listStackItems(db)`, `getStackItem(db, id)`, `createStackItem(db, data: StackItemInput)`, `updateStackItem(db, id, data)`, `deleteStackItem(db, id)`
    - `listProjects(db, opts?: { publishedOnly?: boolean })`, `getProject(db, id)`, `createProject(db, data: ProjectInput & { image: string | null }): number`, `updateProject(db, id, data: ProjectInput & { image: string | null }): void`, `deleteProject(db, id): string | null` (возвращает имя картинки удалённого проекта)
    - `listApproachSteps`, `getApproachStep`, `createApproachStep`, `updateApproachStep`, `deleteApproachStep`
    - `listLinks`, `getLink`, `createLink`, `updateLink`, `deleteLink`
    - `get*` возвращают запись или `undefined`; `create*` — новый `id`; `update*`/`delete*` по несуществующему id ничего не делают.

- [ ] **Step 1: Написать падающий тест** — `src/lib/server/repo/repo.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '../db/client';
import { stackItems } from '../db/schema';
import { seedIfEmpty } from '../db/seed';
import { createTestDb } from '../testing';
import {
	createProject,
	createStackItem,
	deleteProject,
	deleteStackItem,
	getStackItem,
	listProjects,
	listStackItems,
	updateStackItem
} from './lists';
import { getSettings, updateSettings } from './settings';
import { moveItem } from './sortable';

let db: Db;
beforeEach(() => {
	db = createTestDb();
	seedIfEmpty(db);
});

const titles = () => listStackItems(db).map((i) => i.title);

describe('settings', () => {
	it('читает и обновляет единственную строку', () => {
		const s = getSettings(db);
		updateSettings(db, { ...s, city: 'Биробиджан' });
		expect(getSettings(db).city).toBe('Биробиджан');
	});
});

describe('списки', () => {
	it('новая запись встаёт в конец', () => {
		const id = createStackItem(db, { title: 'Игры', description: 'x', icon: 'design', tags: [] });
		expect(titles().at(-1)).toBe('Игры');
		expect(getStackItem(db, id)?.title).toBe('Игры');
	});

	it('обновляет и удаляет', () => {
		const [first] = listStackItems(db);
		updateStackItem(db, first.id, { title: 'Сайты', description: 'y', icon: 'web', tags: ['A'] });
		expect(getStackItem(db, first.id)?.tags).toEqual(['A']);
		deleteStackItem(db, first.id);
		expect(getStackItem(db, first.id)).toBeUndefined();
	});

	it('скрывает неопубликованные проекты по запросу', () => {
		createProject(db, {
			title: 'Черновик', category: 'Веб', year: '2026', description: 'x', url: null, tags: [], published: false, image: null
		});
		expect(listProjects(db)).toHaveLength(5);
		expect(listProjects(db, { publishedOnly: true })).toHaveLength(4);
	});

	it('deleteProject возвращает имя картинки', () => {
		const id = createProject(db, {
			title: 'P', category: 'Веб', year: '2026', description: 'x', url: null, tags: [], published: true, image: 'abc.webp'
		});
		expect(deleteProject(db, id)).toBe('abc.webp');
	});
});

describe('moveItem', () => {
	it('меняет местами соседей', () => {
		const [, second] = listStackItems(db);
		moveItem(db, stackItems, second.id, 'up');
		expect(titles().slice(0, 2)).toEqual(['Мобайл', 'Веб']);
	});

	it('первую вверх и последнюю вниз — без изменений', () => {
		const items = listStackItems(db);
		const before = titles();
		moveItem(db, stackItems, items[0].id, 'up');
		moveItem(db, stackItems, items.at(-1)!.id, 'down');
		expect(titles()).toEqual(before);
	});

	it('устаревший id — без изменений и без ошибок', () => {
		const before = titles();
		moveItem(db, stackItems, 9999, 'up');
		deleteStackItem(db, 9999);
		updateStackItem(db, 9999, { title: 'x', description: 'x', icon: 'web', tags: [] });
		expect(titles()).toEqual(before);
		expect(getStackItem(db, 9999)).toBeUndefined();
	});

	it('выравнивает повторяющиеся sort', () => {
		db.update(stackItems).set({ sort: 0 }).run();
		const items = listStackItems(db);
		moveItem(db, stackItems, items[1].id, 'up');
		const sorts = listStackItems(db).map((i) => i.sort);
		expect(sorts).toEqual([0, 1, 2, 3, 4]);
	});
});
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `pnpm test src/lib/server/repo`
Expected: FAIL — нет модулей.

- [ ] **Step 3: Настройки** — `src/lib/server/repo/settings.ts`:

```ts
import { eq } from 'drizzle-orm';
import type { SettingsInput } from '../../schemas';
import type { Db } from '../db/client';
import { settings, type Settings } from '../db/schema';

export function getSettings(db: Db): Settings {
	const row = db.select().from(settings).where(eq(settings.id, 1)).get();
	if (!row) throw new Error('Таблица settings пуста');
	return row;
}

export function updateSettings(db: Db, data: SettingsInput): void {
	db.update(settings).set(data).where(eq(settings.id, 1)).run();
}
```

- [ ] **Step 4: Сортировка** — `src/lib/server/repo/sortable.ts`:

```ts
import { getTableName } from 'drizzle-orm';
import type { Db } from '../db/client';
import type { approachSteps, links, projects, stackItems } from '../db/schema';

export type SortableTable = typeof stackItems | typeof projects | typeof approachSteps | typeof links;

export function nextSort(db: Db, table: SortableTable): number {
	const name = getTableName(table);
	return db.$client.prepare(`SELECT COALESCE(MAX(sort), -1) + 1 FROM "${name}"`).pluck().get() as number;
}

/** Меняет запись местами с соседом и заново нумерует sort с нуля. */
export function moveItem(db: Db, table: SortableTable, id: number, direction: 'up' | 'down'): void {
	const name = getTableName(table);
	const sqlite = db.$client;
	sqlite.transaction(() => {
		const ids = sqlite.prepare(`SELECT id FROM "${name}" ORDER BY sort, id`).pluck().all() as number[];
		const i = ids.indexOf(id);
		const j = direction === 'up' ? i - 1 : i + 1;
		if (i < 0 || j < 0 || j >= ids.length) return;
		[ids[i], ids[j]] = [ids[j], ids[i]];
		const update = sqlite.prepare(`UPDATE "${name}" SET sort = ? WHERE id = ?`);
		ids.forEach((rowId, index) => update.run(index, rowId));
	})();
}
```

- [ ] **Step 5: Списки** — `src/lib/server/repo/lists.ts`:

```ts
import { asc, eq } from 'drizzle-orm';
import type { ApproachStepInput, LinkInput, ProjectInput, StackItemInput } from '../../schemas';
import type { Db } from '../db/client';
import { approachSteps, links, projects, stackItems } from '../db/schema';
import { nextSort } from './sortable';

type ProjectData = ProjectInput & { image: string | null };

// Стек
export const listStackItems = (db: Db) =>
	db.select().from(stackItems).orderBy(asc(stackItems.sort), asc(stackItems.id)).all();
export const getStackItem = (db: Db, id: number) =>
	db.select().from(stackItems).where(eq(stackItems.id, id)).get();
export const createStackItem = (db: Db, data: StackItemInput): number =>
	db.insert(stackItems).values({ ...data, sort: nextSort(db, stackItems) }).returning({ id: stackItems.id }).get().id;
export const updateStackItem = (db: Db, id: number, data: StackItemInput): void => {
	db.update(stackItems).set(data).where(eq(stackItems.id, id)).run();
};
export const deleteStackItem = (db: Db, id: number): void => {
	db.delete(stackItems).where(eq(stackItems.id, id)).run();
};

// Проекты
export const listProjects = (db: Db, opts: { publishedOnly?: boolean } = {}) =>
	db
		.select()
		.from(projects)
		.where(opts.publishedOnly ? eq(projects.published, true) : undefined)
		.orderBy(asc(projects.sort), asc(projects.id))
		.all();
export const getProject = (db: Db, id: number) =>
	db.select().from(projects).where(eq(projects.id, id)).get();
export const createProject = (db: Db, data: ProjectData): number =>
	db.insert(projects).values({ ...data, sort: nextSort(db, projects) }).returning({ id: projects.id }).get().id;
export const updateProject = (db: Db, id: number, data: ProjectData): void => {
	db.update(projects).set(data).where(eq(projects.id, id)).run();
};
export const deleteProject = (db: Db, id: number): string | null =>
	db.delete(projects).where(eq(projects.id, id)).returning({ image: projects.image }).get()?.image ?? null;

// Этапы
export const listApproachSteps = (db: Db) =>
	db.select().from(approachSteps).orderBy(asc(approachSteps.sort), asc(approachSteps.id)).all();
export const getApproachStep = (db: Db, id: number) =>
	db.select().from(approachSteps).where(eq(approachSteps.id, id)).get();
export const createApproachStep = (db: Db, data: ApproachStepInput): number =>
	db.insert(approachSteps).values({ ...data, sort: nextSort(db, approachSteps) }).returning({ id: approachSteps.id }).get().id;
export const updateApproachStep = (db: Db, id: number, data: ApproachStepInput): void => {
	db.update(approachSteps).set(data).where(eq(approachSteps.id, id)).run();
};
export const deleteApproachStep = (db: Db, id: number): void => {
	db.delete(approachSteps).where(eq(approachSteps.id, id)).run();
};

// Ссылки
export const listLinks = (db: Db) =>
	db.select().from(links).orderBy(asc(links.sort), asc(links.id)).all();
export const getLink = (db: Db, id: number) => db.select().from(links).where(eq(links.id, id)).get();
export const createLink = (db: Db, data: LinkInput): number =>
	db.insert(links).values({ ...data, sort: nextSort(db, links) }).returning({ id: links.id }).get().id;
export const updateLink = (db: Db, id: number, data: LinkInput): void => {
	db.update(links).set(data).where(eq(links.id, id)).run();
};
export const deleteLink = (db: Db, id: number): void => {
	db.delete(links).where(eq(links.id, id)).run();
};
```

- [ ] **Step 6: Тест проходит**

Run: `pnpm test src/lib/server/repo`
Expected: PASS.

- [ ] **Step 7: Проверки и коммит**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: add repositories for settings and sortable lists

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Контент главной и счётчик заглушек

**Files:**
- Create: `src/lib/server/content.ts`
- Test: `src/lib/server/content.test.ts`

**Interfaces:**
- Consumes: репозитории (Task 5).
- Produces:

```ts
export type SectionKey = 'stack' | 'projects' | 'approach' | 'contact';
export interface PageContent {
	settings: Settings;
	stack: StackItem[];
	projects: Project[];          // только опубликованные
	approach: ApproachStep[];
	links: Link[];
	githubUrl: string | null;     // url ссылки с меткой GitHub (без учёта регистра)
	eyebrows: Partial<Record<SectionKey, string>>; // «01 · стек»; нет ключа — раздел скрыт
	nav: { href: string; label: string }[];        // пункты меню видимых разделов, без «Связаться»
}
export function getPageContent(db: Db): PageContent;
export function countPlaceholders(db: Db): number;
```

- [ ] **Step 1: Написать падающий тест** — `src/lib/server/content.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import type { Db } from './db/client';
import { approachSteps, links, projects, stackItems } from './db/schema';
import { seedIfEmpty } from './db/seed';
import { countPlaceholders, getPageContent } from './content';
import { createTestDb } from './testing';

let db: Db;
beforeEach(() => {
	db = createTestDb();
	seedIfEmpty(db);
});

describe('getPageContent', () => {
	it('нумерует видимые разделы и строит меню', () => {
		const c = getPageContent(db);
		expect(c.eyebrows).toEqual({
			stack: '01 · стек',
			projects: '02 · проекты',
			approach: '03 · подход',
			contact: '04 · контакты'
		});
		expect(c.nav.map((n) => n.href)).toEqual(['#stack', '#projects', '#approach']);
	});

	it('пустой раздел скрыт, нумерация сдвигается', () => {
		db.delete(stackItems).run();
		const c = getPageContent(db);
		expect(c.eyebrows.stack).toBeUndefined();
		expect(c.eyebrows.projects).toBe('01 · проекты');
		expect(c.nav.map((n) => n.href)).toEqual(['#projects', '#approach']);
	});

	it('неопубликованные проекты не попадают на страницу', () => {
		db.update(projects).set({ published: false }).run();
		const c = getPageContent(db);
		expect(c.projects).toEqual([]);
		expect(c.eyebrows.projects).toBeUndefined();
	});

	it('ссылка GitHub ищется без учёта регистра', () => {
		expect(getPageContent(db).githubUrl).toBe('https://github.com/');
		db.update(links).set({ label: 'github' }).run();
		expect(getPageContent(db).githubUrl).toBe('https://github.com/');
		db.delete(links).run();
		expect(getPageContent(db).githubUrl).toBeNull();
	});
});

describe('countPlaceholders', () => {
	it('считает заглушки в скобках во всех текстах', () => {
		// settings: [город], [you@email.com], [год]; 4 проекта × ([Название], [год], [Одно предложение…])
		expect(countPlaceholders(db)).toBe(3 + 4 * 3);
		db.delete(projects).run();
		db.delete(approachSteps).run();
		expect(countPlaceholders(db)).toBe(3);
	});
});
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `pnpm test src/lib/server/content.test.ts`
Expected: FAIL — нет модуля `./content`.

- [ ] **Step 3: Реализация** — `src/lib/server/content.ts`:

```ts
import type { Db } from './db/client';
import type { ApproachStep, Link, Project, Settings, StackItem } from './db/schema';
import { listApproachSteps, listLinks, listProjects, listStackItems } from './repo/lists';
import { getSettings } from './repo/settings';

export type SectionKey = 'stack' | 'projects' | 'approach' | 'contact';

export interface PageContent {
	settings: Settings;
	stack: StackItem[];
	projects: Project[];
	approach: ApproachStep[];
	links: Link[];
	githubUrl: string | null;
	eyebrows: Partial<Record<SectionKey, string>>;
	nav: { href: string; label: string }[];
}

const NAV_LABELS: Record<Exclude<SectionKey, 'contact'>, string> = {
	stack: 'Стек',
	projects: 'Проекты',
	approach: 'Подход'
};

export function getPageContent(db: Db): PageContent {
	const settings = getSettings(db);
	const stack = listStackItems(db);
	const projects = listProjects(db, { publishedOnly: true });
	const approach = listApproachSteps(db);
	const links = listLinks(db);

	const visible: [SectionKey, string][] = [];
	if (stack.length) visible.push(['stack', settings.stackEyebrow]);
	if (projects.length) visible.push(['projects', settings.projectsEyebrow]);
	if (approach.length) visible.push(['approach', settings.approachEyebrow]);
	visible.push(['contact', settings.contactEyebrow]);

	const eyebrows: PageContent['eyebrows'] = {};
	visible.forEach(([key, label], i) => {
		eyebrows[key] = `${String(i + 1).padStart(2, '0')} · ${label}`;
	});

	const nav = visible
		.filter(([key]) => key !== 'contact')
		.map(([key]) => ({ href: `#${key}`, label: NAV_LABELS[key as keyof typeof NAV_LABELS] }));

	const githubUrl = links.find((l) => l.label.trim().toLowerCase() === 'github')?.url ?? null;

	return { settings, stack, projects, approach, links, githubUrl, eyebrows, nav };
}

const PLACEHOLDER = /\[[^\]\n]+\]/g;

export function countPlaceholders(db: Db): number {
	const texts: string[] = [
		...Object.values(getSettings(db)).filter((v): v is string => typeof v === 'string'),
		...listStackItems(db).flatMap((i) => [i.title, i.description, ...i.tags]),
		...listProjects(db).flatMap((p) => [p.title, p.category, p.year, p.description, ...p.tags]),
		...listApproachSteps(db).flatMap((s) => [s.title, s.description, ...s.tags]),
		...listLinks(db).map((l) => l.label)
	];
	return texts.reduce((n, t) => n + (t.match(PLACEHOLDER)?.length ?? 0), 0);
}
```

- [ ] **Step 4: Тест проходит**

Run: `pnpm test src/lib/server/content.test.ts`
Expected: PASS.

- [ ] **Step 5: Проверки и коммит**

Run: `pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: assemble page content with section numbering

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Пароль, сессии, ограничение попыток

**Files:**
- Create: `src/lib/server/auth.ts`, `scripts/hash-password.ts`
- Test: `src/lib/server/auth.test.ts`

**Interfaces:**
- Consumes: `Db`, `sessions` (Task 2).
- Produces:
  - `SESSION_COOKIE = 'session'`, `SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000`
  - `verifyPassword(password: string, hash: string | undefined): Promise<boolean>`
  - `hashToken(token: string): string`
  - `createSession(db, now?: Date): { token: string; expiresAt: Date }`
  - `validateSession(db, token: string, now?: Date): boolean`
  - `deleteSession(db, token: string): void`
  - `class RateLimiter { constructor(limit?: number, windowMs?: number); isBlocked(key: string, now?: number): boolean; registerFailure(key: string, now?: number): void; reset(key: string): void; get size(): number }`

- [ ] **Step 1: Написать падающий тест** — `src/lib/server/auth.test.ts`:

```ts
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
		const ids = db.select().from(sessions).all().map((s) => s.id);
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
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `pnpm test src/lib/server/auth.test.ts`
Expected: FAIL — нет модуля `./auth`.

- [ ] **Step 3: Реализация** — `src/lib/server/auth.ts`:

```ts
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
	db.insert(sessions).values({ id: hashToken(token), expiresAt }).run();
	return { token, expiresAt };
}

export function validateSession(db: Db, token: string, now = new Date()): boolean {
	const row = db.select().from(sessions).where(eq(sessions.id, hashToken(token))).get();
	return !!row && row.expiresAt > now;
}

export function deleteSession(db: Db, token: string): void {
	db.delete(sessions).where(eq(sessions.id, hashToken(token))).run();
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
```

- [ ] **Step 4: Тест проходит**

Run: `pnpm test src/lib/server/auth.test.ts`
Expected: PASS.

- [ ] **Step 5: Скрипт хеша** — `scripts/hash-password.ts`:

```ts
import { hash } from '@node-rs/argon2';
import { createInterface } from 'node:readline/promises';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question('Пароль для админки: ');
rl.close();

if (password.length < 12) {
	console.error('Пароль короче 12 символов — выберите длиннее.');
	process.exit(1);
}

// Одинарные кавычки не дают docker compose подставлять переменные вместо символов $.
console.log(`ADMIN_PASSWORD_HASH='${await hash(password)}'`);
```

Run: `echo 'длинный-тестовый-пароль' | pnpm hash-password`
Expected: строка `ADMIN_PASSWORD_HASH='$argon2id$...'`.

- [ ] **Step 6: Проверки и коммит**

Run: `pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: add password check, sessions and login rate limit

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Хуки, вход и выход, e2e-инфраструктура

**Files:**
- Create: `src/hooks.server.ts`, `src/routes/admin/login/+page.server.ts`, `src/routes/admin/login/+page.svelte`, `src/routes/admin/logout/+server.ts`, `src/routes/admin/+layout.svelte`, `src/routes/admin/+page.svelte`, `playwright.config.ts`, `e2e/helpers.ts`, `e2e/auth.test.ts`
- Modify: `src/app.d.ts`

**Interfaces:**
- Consumes: `initDb`, `getDb` (Task 3), функции `auth.ts` (Task 7).
- Produces:
  - `App.Locals`: `{ admin: boolean; sessionToken: string | null }`.
  - Любой запрос к `/admin/**`, кроме `/admin/login`, без сессии получает `303 → /admin/login` (и GET, и POST).
  - `e2e/helpers.ts`: `E2E_PASSWORD`, `login(page: Page): Promise<void>`.
  - Временные `src/routes/admin/+layout.svelte` и `+page.svelte` (заменяются в Task 15).

- [ ] **Step 1: Locals** — `src/app.d.ts`:

```ts
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			admin: boolean;
			sessionToken: string | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
```

(Сохранить существующие комментарии файла, если они отличаются; поменять только `Locals`.)

- [ ] **Step 2: Хуки** — `src/hooks.server.ts`:

```ts
import { redirect, type Handle, type ServerInit } from '@sveltejs/kit';
import { SESSION_COOKIE, validateSession } from '$lib/server/auth';
import { getDb, initDb } from '$lib/server/db';

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
```

Проект использует алиас `#lib` (см. `package.json` → `imports`); `$lib` в SvelteKit тоже работает. Использовать `$lib` во всём новом коде маршрутов — это алиас, который SvelteKit резолвит и в Vitest. Если `pnpm check` ругается на `$lib`, заменить на `#lib`.

- [ ] **Step 3: Вход** — `src/routes/admin/login/+page.server.ts`:

```ts
import { dev } from '$app/environment';
import { fail, redirect } from '@sveltejs/kit';
import {
	createSession,
	RateLimiter,
	SESSION_COOKIE,
	verifyPassword
} from '$lib/server/auth';
import { getDb } from '$lib/server/db';
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
		if (!(await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH))) {
			limiter.registerFailure(ip);
			return fail(400, { error: 'Неверный пароль' });
		}
		limiter.reset(ip);
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
```

`src/routes/admin/login/+page.svelte`:

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Вход — админка</title>
</svelte:head>

<main class="va-sky grid min-h-screen place-items-center px-4">
	<form method="POST" use:enhance class="va-glass va-glass-2xl va-glass-pad-lg flex w-full max-w-sm flex-col gap-4">
		<h1 class="font-display text-3xl font-black text-ink">Вход</h1>
		<label class="flex flex-col gap-1 text-sm font-semibold text-ink-nav">
			Пароль
			<input
				name="password"
				type="password"
				autocomplete="current-password"
				required
				class="admin-input"
			/>
		</label>
		{#if form?.error}
			<p role="alert" class="text-sm font-semibold text-violet-800">{form.error}</p>
		{/if}
		<button type="submit" class="va-btn va-btn-md va-btn-violet">Войти</button>
	</form>
</main>
```

Классы `.va-*` и `admin-input` появятся в Task 11 и Task 15; до тех пор страница просто без стилей.

- [ ] **Step 4: Выход** — `src/routes/admin/logout/+server.ts`:

```ts
import { redirect } from '@sveltejs/kit';
import { deleteSession, SESSION_COOKIE } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ cookies, locals }) => {
	if (locals.sessionToken) deleteSession(getDb(), locals.sessionToken);
	cookies.delete(SESSION_COOKIE, { path: '/' });
	redirect(303, '/admin/login');
};
```

- [ ] **Step 5: Временная оболочка админки**

`src/routes/admin/+layout.svelte`:

```svelte
<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

{@render children()}
```

`src/routes/admin/+page.svelte`:

```svelte
<h1>Обзор</h1>
<form method="POST" action="/admin/logout"><button type="submit">Выйти</button></form>
```

- [ ] **Step 6: Playwright** — `playwright.config.ts`:

```ts
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
```

`e2e/helpers.ts`:

```ts
import { expect, type Page } from '@playwright/test';

export const E2E_PASSWORD = 'e2e-пароль-для-тестов';

export async function login(page: Page): Promise<void> {
	await page.goto('/admin/login');
	await page.getByLabel('Пароль').fill(E2E_PASSWORD);
	await page.getByRole('button', { name: 'Войти' }).click();
	await expect(page).toHaveURL('/admin');
}
```

Все e2e-файлы идут по алфавиту в одном процессе против одной базы (`workers: 1`). Каждый тест проверяет только то, что сам изменил, и не рассчитывает на нетронутые данные, кроме `home.test.ts`, который идёт раньше `projects` и `settings`.

- [ ] **Step 7: Написать e2e-тест** — `e2e/auth.test.ts`:

```ts
import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('без сессии /admin ведёт на вход', async ({ page }) => {
	await page.goto('/admin/settings');
	await expect(page).toHaveURL('/admin/login');
});

test('POST в админку без сессии не выполняется', async ({ request }) => {
	const res = await request.post('/admin/settings', {
		form: { name: 'Взлом' },
		headers: { origin: 'http://localhost:4173' },
		maxRedirects: 0
	});
	expect(res.status()).toBe(303);
	expect(res.headers().location).toBe('/admin/login');
});

test('неверный пароль показывает ошибку', async ({ page }) => {
	await page.goto('/admin/login');
	await page.getByLabel('Пароль').fill('не тот');
	await page.getByRole('button', { name: 'Войти' }).click();
	await expect(page.getByRole('alert')).toHaveText('Неверный пароль');
});

test('вход и выход', async ({ page }) => {
	await login(page);
	await page.getByRole('button', { name: 'Выйти' }).click();
	await expect(page).toHaveURL('/admin/login');
	await page.goto('/admin');
	await expect(page).toHaveURL('/admin/login');
});
```

- [ ] **Step 8: Запустить e2e**

Run: `pnpm test:e2e`
Expected: PASS, 4 tests. Если `vite preview` не подхватывает `init`-хук, проверить, что версия SvelteKit поддерживает `ServerInit` (есть с 2.10).

- [ ] **Step 9: Проверки и коммит**

Run: `pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: guard admin routes with session login

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Загрузка и раздача картинок

**Files:**
- Create: `src/lib/server/uploads.ts`, `src/routes/uploads/[file]/+server.ts`
- Test: `src/lib/server/uploads.test.ts`

**Interfaces:**
- Consumes: `dataDir()` (Task 1).
- Produces:
  - `MAX_IMAGE_BYTES = 5 * 1024 * 1024`, `MAX_IMAGE_WIDTH = 1600`, `MAX_IMAGE_PIXELS = 40_000_000`, `IMAGE_NAME: RegExp` (`/^[a-z0-9-]+\.webp$/`)
  - `class UploadError extends Error`
  - `uploadsDir(): string` — `DATA_DIR/uploads`
  - `saveImage(file: File, dir?: string, opts?: { maxPixels?: number }): Promise<string>` — имя сохранённого файла
  - `deleteImage(name: string | null, dir?: string): Promise<void>`
  - `GET /uploads/<name>.webp`

- [ ] **Step 1: Написать падающий тест** — `src/lib/server/uploads.test.ts`:

```ts
import { mkdtemp, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { beforeEach, describe, expect, it } from 'vitest';
import { deleteImage, IMAGE_NAME, saveImage, UploadError } from './uploads';

let dir: string;
beforeEach(async () => {
	dir = await mkdtemp(path.join(os.tmpdir(), 'uploads-'));
});

async function png(width: number, height: number, name = 'shot.png'): Promise<File> {
	const buf = await sharp({ create: { width, height, channels: 3, background: '#8B5CF6' } })
		.png()
		.toBuffer();
	return new File([buf], name, { type: 'image/png' });
}

describe('saveImage', () => {
	it('сохраняет WebP шириной не больше 1600px', async () => {
		const name = await saveImage(await png(2400, 1200), dir);
		expect(name).toMatch(IMAGE_NAME);
		const meta = await sharp(path.join(dir, name)).metadata();
		expect(meta.format).toBe('webp');
		expect(meta.width).toBe(1600);
	});

	it('маленькую картинку не увеличивает', async () => {
		const name = await saveImage(await png(800, 400), dir);
		expect((await sharp(path.join(dir, name)).metadata()).width).toBe(800);
	});

	it('тип определяется по содержимому, а не по имени', async () => {
		await expect(saveImage(await png(10, 10, 'SHOT'), dir)).resolves.toMatch(IMAGE_NAME);
		const fake = new File(['<svg></svg>'], 'x.png', { type: 'image/png' });
		await expect(saveImage(fake, dir)).rejects.toThrow(UploadError);
	});

	it('отказывает файлам больше 5 МБ', async () => {
		const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png');
		await expect(saveImage(big, dir)).rejects.toThrow('Файл больше 5 МБ');
	});

	it('отказывает картинке с огромными размерами в пикселях', async () => {
		await expect(saveImage(await png(300, 300), dir, { maxPixels: 50_000 })).rejects.toThrow(
			'Картинка слишком большая'
		);
		expect(await readdir(dir)).toEqual([]);
	});
});

describe('deleteImage', () => {
	it('удаляет файл и игнорирует чужие имена', async () => {
		const name = await saveImage(await png(10, 10), dir);
		await deleteImage('../etc/passwd', dir);
		await deleteImage(null, dir);
		await deleteImage(name, dir);
		expect(await readdir(dir)).toEqual([]);
	});
});
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `pnpm test src/lib/server/uploads.test.ts`
Expected: FAIL — нет модуля `./uploads`.

- [ ] **Step 3: Реализация** — `src/lib/server/uploads.ts`:

```ts
import { randomUUID } from 'node:crypto';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { dataDir } from './config';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_WIDTH = 1600;
export const MAX_IMAGE_PIXELS = 40_000_000;
export const IMAGE_NAME = /^[a-z0-9-]+\.webp$/;
const FORMATS = new Set(['jpeg', 'png', 'webp']);

export class UploadError extends Error {}

export function uploadsDir(): string {
	return path.join(dataDir(), 'uploads');
}

export async function saveImage(
	file: File,
	dir = uploadsDir(),
	opts: { maxPixels?: number } = {}
): Promise<string> {
	const maxPixels = opts.maxPixels ?? MAX_IMAGE_PIXELS;
	if (file.size === 0) throw new UploadError('Файл пустой');
	if (file.size > MAX_IMAGE_BYTES) throw new UploadError('Файл больше 5 МБ');

	const input = Buffer.from(await file.arrayBuffer());
	let format: string | undefined;
	let pixels = 0;
	try {
		const meta = await sharp(input).metadata();
		format = meta.format;
		pixels = (meta.width ?? 0) * (meta.height ?? 0);
	} catch {
		throw new UploadError('Файл не похож на картинку');
	}
	if (!format || !FORMATS.has(format)) throw new UploadError('Поддерживаются JPEG, PNG и WebP');
	if (pixels > maxPixels) throw new UploadError('Картинка слишком большая по размеру в пикселях');

	const name = `${randomUUID()}.webp`;
	await mkdir(dir, { recursive: true });
	await sharp(input, { limitInputPixels: maxPixels })
		.rotate()
		.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
		.webp({ quality: 82 })
		.toFile(path.join(dir, name));
	return name;
}

export async function deleteImage(name: string | null, dir = uploadsDir()): Promise<void> {
	if (!name || !IMAGE_NAME.test(name)) return;
	await rm(path.join(dir, name), { force: true });
}
```

- [ ] **Step 4: Тест проходит**

Run: `pnpm test src/lib/server/uploads.test.ts`
Expected: PASS.

- [ ] **Step 5: Раздача** — `src/routes/uploads/[file]/+server.ts`:

```ts
import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { IMAGE_NAME, uploadsDir } from '$lib/server/uploads';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	if (!IMAGE_NAME.test(params.file)) error(404, 'Не найдено');
	try {
		const body = await readFile(path.join(uploadsDir(), params.file));
		return new Response(body, {
			headers: {
				'content-type': 'image/webp',
				'cache-control': 'public, max-age=31536000, immutable'
			}
		});
	} catch {
		error(404, 'Не найдено');
	}
};
```

- [ ] **Step 6: Проверки и коммит**

Run: `pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: convert uploaded screenshots to webp and serve them

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Экспорт, импорт и автобэкапы

**Files:**
- Create: `src/lib/server/backup.ts`
- Test: `src/lib/server/backup.test.ts`

**Interfaces:**
- Consumes: `Db`, `SCHEMA_VERSION`, `openDatabase` (Task 2), `sessions`, `projects` (Task 2), `hashToken` (Task 7), `IMAGE_NAME` (Task 9).
- Produces:
  - `class BackupError extends Error`
  - `MAX_BACKUPS = 10`, `BACKUP_NAME: RegExp`
  - `writeBackupArchive(db: Db, dataDir: string, outFile: string): Promise<void>`
  - `createAutoBackup(db: Db, dataDir: string): Promise<string>` — имя файла в `dataDir/backups`, с ротацией
  - `listBackups(dataDir: string): Promise<{ name: string; size: number; createdAt: Date }[]>` — новые сверху
  - `importBackup(archive: string, dataDir: string, ctx: ImportContext): Promise<void>`, где

```ts
export interface ImportContext {
	db: Db;                      // текущая открытая база
	close: () => void;           // закрыть текущую базу
	open: () => Db;              // открыть DATA_DIR/portfolio.db, применить миграции
	keepSessionToken: string | null;
}
```

- [ ] **Step 1: Написать падающий тест** — `src/lib/server/backup.test.ts`:

```ts
import Database from 'better-sqlite3';
import { createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { beforeEach, describe, expect, it } from 'vitest';
import yazl from 'yazl';
import { validateSession, createSession } from './auth';
import { BackupError, createAutoBackup, importBackup, listBackups, MAX_BACKUPS, writeBackupArchive } from './backup';
import { openDatabase, SCHEMA_VERSION, type Db } from './db/client';
import { projects, settings } from './db/schema';
import { seedIfEmpty } from './db/seed';
import { migrationsDir } from './config';

let dataDir: string;
let db: Db;

const file = () => path.join(dataDir, 'portfolio.db');
const open = () => (db = openDatabase(file(), migrationsDir()));
const ctx = (keepSessionToken: string | null = null) => ({
	db,
	close: () => db.$client.close(),
	open,
	keepSessionToken
});
const city = () => db.select().from(settings).get()?.city;

beforeEach(async () => {
	dataDir = await mkdtemp(path.join(os.tmpdir(), 'backup-'));
	open();
	seedIfEmpty(db);
	await mkdir(path.join(dataDir, 'uploads'));
	await writeFile(path.join(dataDir, 'uploads', 'shot-1.webp'), 'webp-bytes');
	db.update(projects).set({ image: 'shot-1.webp' }).run();
});

async function zip(out: string, entries: { name: string; data: string | Buffer; mode?: number }[]) {
	const z = new yazl.ZipFile();
	for (const e of entries) z.addBuffer(Buffer.from(e.data), e.name, { mode: e.mode });
	z.end();
	await pipeline(z.outputStream, createWriteStream(out));
}

async function sqliteBuffer(userVersion: number): Promise<Buffer> {
	const tmp = path.join(dataDir, `v${userVersion}.db`);
	const raw = new Database(tmp);
	raw.exec('CREATE TABLE settings (id INTEGER PRIMARY KEY)');
	raw.pragma(`user_version = ${userVersion}`);
	raw.close();
	return readFile(tmp);
}

const manifest = JSON.stringify({ format: 1, schemaVersion: SCHEMA_VERSION, createdAt: '2026-10-25' });

describe('экспорт и импорт', () => {
	it('после импорта данные и картинки совпадают с экспортом', async () => {
		const archive = path.join(dataDir, 'export.zip');
		await writeBackupArchive(db, dataDir, archive);

		db.update(settings).set({ city: 'Изменено' }).run();
		await rm(path.join(dataDir, 'uploads', 'shot-1.webp'));

		await importBackup(archive, dataDir, ctx());
		expect(city()).toBe('[город]');
		expect(await readFile(path.join(dataDir, 'uploads', 'shot-1.webp'), 'utf8')).toBe('webp-bytes');
	});

	it('перед импортом делает автобэкап, после — оставляет только текущую сессию', async () => {
		const archive = path.join(dataDir, 'export.zip');
		const mine = createSession(db).token;
		await writeBackupArchive(db, dataDir, archive);
		const other = createSession(db).token;

		await importBackup(archive, dataDir, ctx(mine));
		expect(await listBackups(dataDir)).toHaveLength(1);
		expect(validateSession(db, mine)).toBe(true);
		expect(validateSession(db, other)).toBe(false);
	});

	it('восстанавливает самый старый автобэкап, когда их уже 10', async () => {
		db.update(settings).set({ city: 'Самый старый' }).run();
		const oldest = await createAutoBackup(db, dataDir);
		db.update(settings).set({ city: 'Новее' }).run();
		for (let i = 1; i < MAX_BACKUPS; i++) await createAutoBackup(db, dataDir);
		expect(await listBackups(dataDir)).toHaveLength(MAX_BACKUPS);

		await importBackup(path.join(dataDir, 'backups', oldest), dataDir, ctx());
		expect(city()).toBe('Самый старый');
		expect(await listBackups(dataDir)).toHaveLength(MAX_BACKUPS);
	});
});

describe('отказ импорта, текущие данные не меняются', () => {
	async function expectRejected(entries: Parameters<typeof zip>[1]) {
		const archive = path.join(dataDir, 'bad.zip');
		await zip(archive, entries);
		await expect(importBackup(archive, dataDir, ctx())).rejects.toThrow(BackupError);
		expect(city()).toBe('[город]');
		expect(await readdir(path.join(dataDir, 'uploads'))).toEqual(['shot-1.webp']);
	}

	it('не zip', async () => {
		const archive = path.join(dataDir, 'bad.zip');
		await writeFile(archive, 'not a zip');
		await expect(importBackup(archive, dataDir, ctx())).rejects.toThrow(BackupError);
	});

	it('испорченная база', async () => {
		await expectRejected([
			{ name: 'manifest.json', data: manifest },
			{ name: 'portfolio.db', data: 'not a database' }
		]);
	});

	it('схема новее приложения', async () => {
		await expectRejected([
			{ name: 'manifest.json', data: manifest },
			{ name: 'portfolio.db', data: await sqliteBuffer(SCHEMA_VERSION + 1) }
		]);
	});

	it('путь с ..', async () => {
		const archive = path.join(dataDir, 'bad.zip');
		await zip(archive, [{ name: 'xx/evil.webp', data: 'x' }]);
		const buf = await readFile(archive);
		await writeFile(archive, Buffer.from(buf.toString('latin1').replaceAll('xx/evil.webp', '../evil.webp'), 'latin1'));
		await expect(importBackup(archive, dataDir, ctx())).rejects.toThrow(BackupError);
	});

	it('симлинк', async () => {
		await expectRejected([
			{ name: 'manifest.json', data: manifest },
			{ name: 'uploads/link.webp', data: '/etc/passwd', mode: 0o120777 }
		]);
	});

	it('лишний файл', async () => {
		await expectRejected([
			{ name: 'manifest.json', data: manifest },
			{ name: 'run.sh', data: 'echo' }
		]);
	});

	it('проект ссылается на картинку, которой нет в архиве', async () => {
		// Архив с настоящей базой, но без папки uploads/.
		const stripped = path.join(dataDir, 'stripped.zip');
		const snapshot = path.join(dataDir, 'snap.db');
		db.$client.exec(`VACUUM INTO '${snapshot}'`);
		await zip(stripped, [
			{ name: 'manifest.json', data: manifest },
			{ name: 'portfolio.db', data: await readFile(snapshot) }
		]);
		await expect(importBackup(stripped, dataDir, ctx())).rejects.toThrow('нет картинок');
	});
});

describe('автобэкапы', () => {
	it('хранит не больше 10', async () => {
		for (let i = 0; i < 12; i++) await createAutoBackup(db, dataDir);
		expect(await listBackups(dataDir)).toHaveLength(MAX_BACKUPS);
	});
});
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `pnpm test src/lib/server/backup.test.ts`
Expected: FAIL — нет модуля `./backup`.

- [ ] **Step 3: Реализация** — `src/lib/server/backup.ts`:

```ts
import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { createWriteStream, existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { eq } from 'drizzle-orm';
import yauzl from 'yauzl';
import yazl from 'yazl';
import { hashToken } from './auth';
import { SCHEMA_VERSION, type Db } from './db/client';
import { sessions } from './db/schema';
import { IMAGE_NAME } from './uploads';

export class BackupError extends Error {}

export const MAX_BACKUPS = 10;
export const BACKUP_NAME = /^portfolio-backup-[0-9TZ-]+-[a-f0-9]{6}\.zip$/;
const MAX_UNPACKED_BYTES = 500 * 1024 * 1024;
const FORMAT = 1;

export interface ImportContext {
	db: Db;
	close: () => void;
	open: () => Db;
	keepSessionToken: string | null;
}

const paths = (dataDir: string) => ({
	db: path.join(dataDir, 'portfolio.db'),
	uploads: path.join(dataDir, 'uploads'),
	backups: path.join(dataDir, 'backups'),
	tmp: path.join(dataDir, 'tmp')
});

async function tempDir(dataDir: string, prefix: string): Promise<string> {
	const dir = path.join(paths(dataDir).tmp, `${prefix}-${randomUUID()}`);
	await mkdir(dir, { recursive: true });
	return dir;
}

export async function writeBackupArchive(db: Db, dataDir: string, outFile: string): Promise<void> {
	const work = await tempDir(dataDir, 'export');
	try {
		const snapshot = path.join(work, 'portfolio.db');
		db.$client.exec(`VACUUM INTO '${snapshot.replaceAll("'", "''")}'`);

		const zip = new yazl.ZipFile();
		zip.addBuffer(
			Buffer.from(JSON.stringify({ format: FORMAT, schemaVersion: SCHEMA_VERSION, createdAt: new Date().toISOString() })),
			'manifest.json'
		);
		zip.addFile(snapshot, 'portfolio.db');
		zip.addEmptyDirectory('uploads');
		const uploads = paths(dataDir).uploads;
		const files = existsSync(uploads) ? await readdir(uploads) : [];
		for (const name of files.filter((n) => IMAGE_NAME.test(n))) {
			zip.addFile(path.join(uploads, name), `uploads/${name}`);
		}
		zip.end();
		await mkdir(path.dirname(outFile), { recursive: true });
		await pipeline(zip.outputStream, createWriteStream(outFile));
	} finally {
		await rm(work, { recursive: true, force: true });
	}
}

export async function createAutoBackup(db: Db, dataDir: string): Promise<string> {
	const stamp = new Date().toISOString().replace(/[:.]/g, '-');
	const name = `portfolio-backup-${stamp}-${randomUUID().slice(0, 6)}.zip`;
	await writeBackupArchive(db, dataDir, path.join(paths(dataDir).backups, name));
	const all = await listBackups(dataDir);
	for (const old of all.slice(MAX_BACKUPS)) {
		await rm(path.join(paths(dataDir).backups, old.name), { force: true });
	}
	return name;
}

export async function listBackups(dataDir: string): Promise<{ name: string; size: number; createdAt: Date }[]> {
	const dir = paths(dataDir).backups;
	if (!existsSync(dir)) return [];
	const names = (await readdir(dir)).filter((n) => BACKUP_NAME.test(n)).sort().reverse();
	return Promise.all(
		names.map(async (name) => {
			const s = await stat(path.join(dir, name));
			return { name, size: s.size, createdAt: s.mtime };
		})
	);
}

function allowedEntry(name: string): boolean {
	return (
		name === 'manifest.json' ||
		name === 'portfolio.db' ||
		name === 'uploads/' ||
		/^uploads\/[a-z0-9-]+\.webp$/.test(name)
	);
}

function extract(archive: string, dest: string): Promise<void> {
	return new Promise((resolve, reject) => {
		yauzl.open(archive, { lazyEntries: true }, (err, zip) => {
			if (err || !zip) return reject(new BackupError('Файл не похож на zip-архив'));
			let unpacked = 0;
			const fail = (message: string) => {
				zip.close();
				reject(new BackupError(message));
			};
			zip.on('error', () => fail('Архив повреждён'));
			zip.on('end', () => resolve());
			zip.on('entry', (entry: yauzl.Entry) => {
				const name = entry.fileName;
				const isSymlink = ((entry.externalFileAttributes >>> 16) & 0o170000) === 0o120000;
				if (isSymlink) return fail(`В архиве ссылка: ${name}`);
				if (!allowedEntry(name)) return fail(`Лишний файл в архиве: ${name}`);
				if (name.endsWith('/')) {
					mkdir(path.join(dest, name), { recursive: true }).then(() => zip.readEntry(), reject);
					return;
				}
				unpacked += entry.uncompressedSize;
				if (unpacked > MAX_UNPACKED_BYTES) return fail('Архив слишком большой после распаковки');
				zip.openReadStream(entry, async (streamErr, stream) => {
					if (streamErr || !stream) return fail('Архив повреждён');
					try {
						const target = path.join(dest, name);
						await mkdir(path.dirname(target), { recursive: true });
						await pipeline(stream, createWriteStream(target));
						zip.readEntry();
					} catch {
						fail('Не удалось распаковать архив');
					}
				});
			});
			zip.readEntry();
		});
	});
}

async function validate(dir: string): Promise<void> {
	let manifest: { format?: unknown; schemaVersion?: unknown };
	try {
		manifest = JSON.parse(await readFile(path.join(dir, 'manifest.json'), 'utf8'));
	} catch {
		throw new BackupError('В архиве нет manifest.json');
	}
	if (manifest.format !== FORMAT) throw new BackupError('Неизвестный формат архива');

	let raw: Database.Database;
	try {
		raw = new Database(path.join(dir, 'portfolio.db'), { readonly: true, fileMustExist: true });
	} catch {
		throw new BackupError('В архиве нет базы portfolio.db');
	}
	try {
		let integrity: unknown;
		try {
			integrity = raw.pragma('integrity_check', { simple: true });
		} catch {
			throw new BackupError('portfolio.db — не база SQLite');
		}
		if (integrity !== 'ok') throw new BackupError('База в архиве повреждена');
		const version = raw.pragma('user_version', { simple: true }) as number;
		if (version > SCHEMA_VERSION) {
			throw new BackupError('Архив сделан более новой версией сайта — сначала обновите сайт');
		}
		const hasSettings = raw
			.prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'settings'`)
			.get();
		if (!hasSettings) throw new BackupError('В базе нет таблицы settings');

		const hasProjects = raw
			.prepare(`SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'projects'`)
			.get();
		if (hasProjects) {
			const images = raw
				.prepare(`SELECT image FROM projects WHERE image IS NOT NULL`)
				.pluck()
				.all() as string[];
			const missing = images.filter((img) => !existsSync(path.join(dir, 'uploads', img)));
			if (missing.length) throw new BackupError(`В архиве нет картинок: ${missing.join(', ')}`);
		}
	} finally {
		raw.close();
	}
}

async function moveIfExists(from: string, to: string): Promise<void> {
	if (existsSync(from)) await rename(from, to);
}

export async function importBackup(archive: string, dataDir: string, ctx: ImportContext): Promise<void> {
	const p = paths(dataDir);
	const work = await tempDir(dataDir, 'import');
	const incoming = path.join(work, 'incoming');
	const rollback = path.join(work, 'rollback');
	try {
		await mkdir(incoming);
		await extract(archive, incoming);
		await validate(incoming);
		await mkdir(path.join(incoming, 'uploads'), { recursive: true });

		await createAutoBackup(ctx.db, dataDir);

		const kept = ctx.keepSessionToken
			? ctx.db.select().from(sessions).where(eq(sessions.id, hashToken(ctx.keepSessionToken))).get()
			: undefined;

		ctx.close();
		await mkdir(rollback);
		for (const suffix of ['', '-wal', '-shm']) {
			await moveIfExists(p.db + suffix, path.join(rollback, `portfolio.db${suffix}`));
		}
		await moveIfExists(p.uploads, path.join(rollback, 'uploads'));

		let db: Db;
		try {
			await rename(path.join(incoming, 'portfolio.db'), p.db);
			await rename(path.join(incoming, 'uploads'), p.uploads);
			db = ctx.open();
		} catch (e) {
			await rm(p.db, { force: true });
			await rm(p.uploads, { recursive: true, force: true });
			for (const suffix of ['', '-wal', '-shm']) {
				await moveIfExists(path.join(rollback, `portfolio.db${suffix}`), p.db + suffix);
			}
			await moveIfExists(path.join(rollback, 'uploads'), p.uploads);
			ctx.open();
			throw new BackupError(`Не удалось открыть базу из архива: ${(e as Error).message}`);
		}

		db.delete(sessions).run();
		if (kept) db.insert(sessions).values(kept).run();
	} finally {
		await rm(work, { recursive: true, force: true });
	}
}
```

- [ ] **Step 4: Тест проходит**

Run: `pnpm test src/lib/server/backup.test.ts`
Expected: PASS. Если тест «путь с ..» падает не с `BackupError`, а с другой ошибкой — значит, yauzl выдал `error` до первого `entry`: убедиться, что обработчик `zip.on('error')` подключён до `zip.readEntry()` (как в коде выше).

- [ ] **Step 5: Проверки и коммит**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: export and import database with uploads as zip

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Стили и базовые компоненты Violet Aero

**Files:**
- Create: `src/lib/styles/tokens.css`, `src/lib/styles/components.css`, `src/lib/styles/theme.css`, `src/lib/ui/Icon.svelte`, `src/lib/ui/GlossButton.svelte`, `src/lib/ui/Tag.svelte`, `src/lib/ui/Tags.svelte`, `src/lib/ui/Eyebrow.svelte`, `src/lib/ui/IconTile.svelte`, `src/lib/ui/Orb.svelte`, `src/lib/ui/Bubble.svelte`, `src/lib/ui/SectionHeader.svelte`
- Copy: `docs/design/portfolio/assets/logo/*.svg` → `src/lib/assets/logo/`
- Modify: `src/routes/layout.css`, `src/routes/+layout.svelte`, `src/app.html`
- Delete: `src/lib/assets/favicon.svg`

**Interfaces:**
- Consumes: `StackIcon` (Task 2).
- Produces (Svelte-компоненты, пропсы):
  - `Icon { name: StackIcon | 'arrow-right' | 'arrow-up-right'; size?: number = 24; strokeWidth?: number = 1.9; label?: string }`
  - `GlossButton { variant?: 'violet' | 'pearl'; size?: 'md' | 'lg'; href?: string; icon?: 'arrow-right' | 'arrow-up-right'; type?: 'button' | 'submit'; class?: string; children: Snippet; ...rest }`
  - `Tag { tone?: 'pearl' | 'violet'; children: Snippet }`, `Tags { items: string[]; class?: string }`
  - `Eyebrow { tone?: 'sky' | 'dusk'; children: Snippet }`
  - `IconTile { icon: StackIcon }`, `Orb { size?: 'sm' | 'md'; children: Snippet }`
  - `Bubble { size: number; tone?: 'sky' | 'dusk'; class?: string; style?: string }`
  - `SectionHeader { id: string; eyebrow: string; title: string; tone?: 'sky' | 'dusk'; aside?: Snippet }`
  - Классы `.va-*` из `components.css` и утилиты Tailwind `text-ink`, `bg-sky-100`, `rounded-pill`, `shadow-glass`, `font-display` и т. п.

- [ ] **Step 1: Скопировать стили и ассеты**

```bash
mkdir -p src/lib/styles src/lib/assets/logo
sed '/^@import url/d' docs/design/violet-aero/tokens/tokens.css > src/lib/styles/tokens.css
sed -e '/^@import url/d' -e '/preview helpers/,$d' docs/design/violet-aero/components/bundle.css > src/lib/styles/components.css
cp docs/design/portfolio/assets/logo/*.svg src/lib/assets/logo/
git rm -q src/lib/assets/favicon.svg
```

Проверить: в `components.css` нет строк `.va-row` и `.va-pad`, первая строка — комментарий.

- [ ] **Step 2: Тема Tailwind** — `src/lib/styles/theme.css`:

```css
/* Утилиты Tailwind поверх токенов Violet Aero.
   Цвета ссылаются на переменные из tokens.css; радиусы, тени и шрифты совпадают
   с ними по имени и значению, поэтому tokens.css остаётся единственным источником. */
@theme inline {
	--color-sky-50: var(--sky-50);
	--color-sky-100: var(--sky-100);
	--color-sky-200: var(--sky-200);
	--color-sky-300: var(--sky-300);
	--color-sky-400: var(--sky-400);
	--color-ink: var(--ink);
	--color-ink-body: var(--ink-body);
	--color-ink-nav: var(--ink-nav);
	--color-ink-muted: var(--ink-muted);
	--color-lilac: var(--lilac);
	--color-lilac-line: var(--lilac-line);
	--color-lilac-tint: var(--lilac-tint);
	--color-violet-500: var(--violet-500);
	--color-violet-600: var(--violet-600);
	--color-violet-700: var(--violet-700);
	--color-violet-800: var(--violet-800);
	--color-violet-900: var(--violet-900);
	--color-dusk: var(--dusk);
	--color-on-violet: var(--on-violet);
	--color-on-dusk-muted: var(--on-dusk-muted);
	--color-glass: var(--glass);
	--color-glass-fade: var(--glass-fade);
	--color-link: var(--link);
}

@theme {
	--font-display: 'Nunito', 'Segoe UI', system-ui, sans-serif;
	--font-body: 'Open Sans', 'Segoe UI', system-ui, sans-serif;
	--radius-icon: 16px;
	--radius-xl: 24px;
	--radius-2xl: 28px;
	--radius-pill: 999px;
	--shadow-glass: 0 12px 34px rgba(91, 48, 180, 0.15), inset 0 1px 0 #ffffff;
	--shadow-focus-ring: 0 0 0 3px #ffffff, 0 0 0 5px #6d28d9;
}
```

- [ ] **Step 3: Подключение** — `src/routes/layout.css`:

```css
@import 'tailwindcss';
@import '../lib/styles/tokens.css';
@import '../lib/styles/theme.css';
@import '../lib/styles/components.css';

@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';

html {
	scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
	html {
		scroll-behavior: auto;
	}
}
a {
	color: var(--link);
	text-decoration: none;
}
a:hover {
	color: var(--link-hover);
}
:focus-visible {
	outline: 2px solid transparent;
	box-shadow: var(--focus-ring);
	border-radius: var(--radius-sm);
}
```

`src/app.html` — `lang="ru"` и шрифты:

```html
<!doctype html>
<html lang="ru">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="text-scale" content="scale" />
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link
			rel="stylesheet"
			href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800;900&family=Open+Sans:wght@400;500;600;700&display=swap"
		/>
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

`src/routes/+layout.svelte`:

```svelte
<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/logo/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />
</svelte:head>

{@render children()}
```

- [ ] **Step 4: Icon** — `src/lib/ui/Icon.svelte`:

```svelte
<script lang="ts" module>
	import type { StackIcon } from '$lib/icons';

	export type IconName = StackIcon | 'arrow-right' | 'arrow-up-right';

	type Shape =
		| { kind: 'path'; d: string }
		| { kind: 'circle'; cx: number; cy: number; r: number }
		| { kind: 'rect'; x: number; y: number; width: number; height: number; rx: number };

	const p = (d: string): Shape => ({ kind: 'path', d });

	const SHAPES: Record<IconName, Shape[]> = {
		web: [{ kind: 'circle', cx: 12, cy: 12, r: 9 }, p('M3 12h18'), p('M12 3a14 14 0 0 1 0 18'), p('M12 3a14 14 0 0 0 0 18')],
		mobile: [{ kind: 'rect', x: 6, y: 2.5, width: 12, height: 19, rx: 3 }, p('M11 18h2')],
		desktop: [{ kind: 'rect', x: 2.5, y: 4, width: 19, height: 13, rx: 2 }, p('M8 21h8'), p('M12 17v4')],
		infra: [p('M12 2.5l8.5 4.75v9.5L12 21.5l-8.5-4.75v-9.5z'), p('M3.5 7.25L12 12l8.5-4.75'), p('M12 12v9.5')],
		design: [p('M12 19l7-7 3 3-7 7z'), p('M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z'), p('M2 2l7.6 7.6'), { kind: 'circle', cx: 11, cy: 11, r: 2 }],
		ai: [p('M10 3.5l1.9 4.6 4.6 1.9-4.6 1.9L10 16.5l-1.9-4.6L3.5 10l4.6-1.9z'), p('M18 14l.9 2.1 2.1.9-2.1.9L18 20l-.9-2.1L15 17l2.1-.9z')],
		'arrow-right': [p('M5 12h14'), p('M13 6l6 6-6 6')],
		'arrow-up-right': [p('M7 17L17 7'), p('M8 7h9v9')]
	};
</script>

<script lang="ts">
	let {
		name,
		size = 24,
		strokeWidth = 1.9,
		label
	}: { name: IconName; size?: number; strokeWidth?: number; label?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	{#each SHAPES[name] as shape, i (i)}
		{#if shape.kind === 'path'}
			<path d={shape.d} />
		{:else if shape.kind === 'circle'}
			<circle cx={shape.cx} cy={shape.cy} r={shape.r} />
		{:else}
			<rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} />
		{/if}
	{/each}
</svg>
```

- [ ] **Step 5: Остальные компоненты**

`src/lib/ui/GlossButton.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';

	type Props = {
		variant?: 'violet' | 'pearl';
		size?: 'md' | 'lg';
		href?: string;
		icon?: 'arrow-right' | 'arrow-up-right';
		type?: 'button' | 'submit';
		class?: string;
		children: Snippet;
	} & Omit<HTMLAnchorAttributes & HTMLButtonAttributes, 'type' | 'class' | 'children'>;

	let {
		variant = 'violet',
		size = 'md',
		href,
		icon,
		type = 'button',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const classes = $derived(`va-btn va-btn-${size} va-btn-${variant} ${className}`);
</script>

{#if href}
	<a {href} class={classes} {...rest}>
		{@render children()}
		{#if icon}<Icon name={icon} size={18} strokeWidth={2.4} />{/if}
	</a>
{:else}
	<button {type} class={classes} {...rest}>
		{@render children()}
		{#if icon}<Icon name={icon} size={18} strokeWidth={2.4} />{/if}
	</button>
{/if}
```

`src/lib/ui/Tag.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { tone = 'pearl', children }: { tone?: 'pearl' | 'violet'; children: Snippet } = $props();
</script>

<span class="va-tag va-tag-{tone}">{@render children()}</span>
```

`src/lib/ui/Tags.svelte`:

```svelte
<script lang="ts">
	import Tag from './Tag.svelte';
	let { items, class: className = '' }: { items: string[]; class?: string } = $props();
</script>

{#if items.length}
	<div class="va-tags {className}">
		{#each items as item (item)}<Tag>{item}</Tag>{/each}
	</div>
{/if}
```

`src/lib/ui/Eyebrow.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { tone = 'sky', children }: { tone?: 'sky' | 'dusk'; children: Snippet } = $props();
</script>

<span class="va-eyebrow va-eyebrow-{tone}">{@render children()}</span>
```

`src/lib/ui/IconTile.svelte`:

```svelte
<script lang="ts">
	import type { StackIcon } from '$lib/icons';
	import Icon from './Icon.svelte';
	let { icon }: { icon: StackIcon } = $props();
</script>

<span class="va-icon-tile"><Icon name={icon} size={26} /></span>
```

`src/lib/ui/Orb.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { size = 'md', children }: { size?: 'sm' | 'md'; children: Snippet } = $props();
</script>

<span class="va-orb va-orb-{size}"><span>{@render children()}</span></span>
```

`src/lib/ui/Bubble.svelte`:

```svelte
<script lang="ts">
	let {
		size,
		tone = 'sky',
		class: className = '',
		style = ''
	}: { size: number; tone?: 'sky' | 'dusk'; class?: string; style?: string } = $props();
</script>

<span
	aria-hidden="true"
	class="va-bubble {tone === 'dusk' ? 'va-bubble-dusk' : ''} {className}"
	style="width: {size}px; height: {size}px; {style}"
></span>
```

`src/lib/ui/SectionHeader.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Eyebrow from './Eyebrow.svelte';

	let {
		id,
		eyebrow,
		title,
		tone = 'sky',
		aside
	}: { id: string; eyebrow: string; title: string; tone?: 'sky' | 'dusk'; aside?: Snippet } = $props();
</script>

<div class="va-section-head">
	<div class="va-section-head-main">
		<Eyebrow {tone}>{eyebrow}</Eyebrow>
		<h2 {id} class="va-section-title">{title}</h2>
	</div>
	{@render aside?.()}
</div>
```

- [ ] **Step 6: Проверки**

Run: `pnpm check && pnpm lint && pnpm test`
Expected: без ошибок. `pnpm dev` — страница `/` открывается (пока со старым содержимым), в консоли нет ошибок CSS.

- [ ] **Step 7: Коммит**

```bash
git add -A
git commit -m "feat: port violet aero tokens and base components to svelte

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Главная — первый экран и навигация

**Files:**
- Create: `src/lib/sections/Hero.svelte`, `src/lib/sections/HeroArt.svelte`, `src/lib/sections/SiteNav.svelte`, `src/routes/+page.server.ts`
- Modify: `src/routes/+page.svelte`

**Interfaces:**
- Consumes: `getPageContent`, `PageContent` (Task 6), `getDb` (Task 3), `GlossButton`, `Bubble` (Task 11), логотип `src/lib/assets/logo/behappii-mark.svg`.
- Produces:
  - `+page.server.ts` → `data.content: PageContent`.
  - `SiteNav { nav: PageContent['nav'] }`, `Hero { settings: Settings; nav: PageContent['nav']; hasProjects: boolean }`, `HeroArt` (без пропсов).

- [ ] **Step 1: Загрузка данных** — `src/routes/+page.server.ts`:

```ts
import { getPageContent } from '$lib/server/content';
import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ content: getPageContent(getDb()) });
```

- [ ] **Step 2: Навигация** — `src/lib/sections/SiteNav.svelte` (разметка макета `index.html:108-131`):

```svelte
<script lang="ts">
	import mark from '$lib/assets/logo/behappii-mark.svg';
	import GlossButton from '$lib/ui/GlossButton.svelte';
	import type { PageContent } from '$lib/server/content';

	let { nav }: { nav: PageContent['nav'] } = $props();
</script>

<header class="site-header">
	<nav aria-label="Основная навигация" class="va-nav site-nav">
		<a href="#top" aria-label="behappii — наверх" class="va-nav-brand">
			<img src={mark} alt="" width="44" height="44" />
			<span aria-hidden="true"><span class="brand-angle">&lt;</span>behappii.ru<span class="brand-angle">/&gt;</span></span>
		</a>
		<div class="va-nav-links">
			{#each nav as item (item.href)}
				<a class="va-nav-link" href={item.href}>{item.label}</a>
			{/each}
			<GlossButton href="#contact">Связаться</GlossButton>
		</div>
	</nav>
</header>

<style>
	.site-header {
		position: relative;
		z-index: 2;
		padding: 20px 24px 0;
	}
	.site-nav {
		max-width: 1240px;
		margin: 0 auto;
	}
	.brand-angle {
		color: var(--violet-600);
	}
</style>
```

`$lib/server/content` импортируется только как тип (`import type`) — SvelteKit это разрешает в клиентском коде.

- [ ] **Step 3: Иллюстрация** — `src/lib/sections/HeroArt.svelte`. Перенести блок `index.html:150-195` (шар, браузерное окно, окно приложения, телефон, подписи) один в один, заменив каждый `style="…"` на класс и правило в `<style>` компонента с теми же значениями. Структура и имена классов:

```svelte
<div aria-hidden="true" class="art">
	<div class="art-glow"></div>
	<div class="art-glow-shine"></div>

	<div class="va-window art-browser">
		<div class="va-window-bar">
			<span class="va-window-url">behappii.ru/...</span>
			<span class="va-window-ctl"></span>
			<span class="va-window-ctl"></span>
			<span class="va-window-close"></span>
		</div>
		<div class="va-window-client">
			<div class="bar bar-title"></div>
			<div class="bar bar-line" style="--w: 82%"></div>
			<div class="bar bar-line" style="--w: 66%"></div>
			<div class="tiles">
				<div class="tile tile-accent"></div>
				<div class="tile"></div>
				<div class="tile"></div>
			</div>
		</div>
		<span class="va-tag va-tag-violet">SvelteKit · Next.js</span>
	</div>

	<div class="va-window art-app">
		<div class="va-window-bar"></div>
		<div class="app-client">
			<div class="app-side">
				<div class="bar bar-strong" style="--w: 70%"></div>
				<div class="bar bar-soft" style="--w: 90%"></div>
				<div class="bar bar-soft" style="--w: 60%"></div>
			</div>
			<div class="app-main">
				<div class="bar bar-strong bar-tall" style="--w: 50%"></div>
				<div class="app-canvas"></div>
			</div>
		</div>
		<span class="va-tag va-tag-violet">Tauri</span>
	</div>

	<div class="art-phone">
		<div class="phone-screen">
			<div class="phone-hero"></div>
			<div class="bar bar-strong bar-tall" style="--w: 75%"></div>
			<div class="bar bar-soft" style="--w: 90%"></div>
			<div class="bar bar-soft" style="--w: 60%"></div>
			<div class="phone-cta"></div>
			<div class="phone-shine"></div>
		</div>
	</div>
	<span class="va-tag va-tag-violet art-phone-tag">React Native · Flutter</span>
</div>

<style>
	.art { flex: 1 1 440px; min-width: 0; position: relative; height: 520px; }
	.art-glow { position: absolute; left: 12%; top: 40px; width: 380px; height: 380px; max-width: 80%; border-radius: 50%; background: radial-gradient(circle at 50% 110%, rgba(232,220,255,0.95) 0%, rgba(167,139,250,0.75) 40%, rgba(109,40,217,0.75) 100%); box-shadow: 0 30px 80px rgba(109,40,217,0.35), inset 0 -20px 50px rgba(255,255,255,0.45); }
	.art-glow-shine { position: absolute; left: calc(12% + 50px); top: 52px; width: 280px; max-width: 58%; height: 150px; border-radius: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0)); }
	.art-browser { position: absolute; top: 10px; left: 0; width: 80%; height: 290px; }
	.art-browser :global(.va-tag) { right: 22px; bottom: 20px; }
	.bar { width: var(--w, 100%); height: 9px; border-radius: 5px; }
	.bar-title { width: 55%; height: 16px; border-radius: 8px; background: linear-gradient(90deg, var(--violet-500), var(--lilac)); }
	.bar-line { background: #EDE6FF; }
	.bar-strong { height: 8px; border-radius: 4px; background: var(--lilac); }
	.bar-soft { height: 8px; border-radius: 4px; background: #EDE6FF; }
	.bar-tall { height: 10px; }
	.tiles { display: flex; gap: 10px; margin-top: 8px; }
	.tile { flex: 1; height: 64px; border-radius: 10px; background: #F4EFFF; }
	.tile-accent { background: linear-gradient(180deg, #E9DEFF, #CDB8FF); }
	.art-app { position: absolute; left: 6%; bottom: 0; width: 60%; height: 180px; border-radius: 12px; }
	.art-app :global(.va-window-bar) { padding: 0; height: 26px; }
	.art-app :global(.va-tag) { right: 18px; bottom: 16px; }
	.app-client { flex: 1; margin: 8px; border-radius: 6px; background: var(--glass-edge); display: flex; }
	.app-side { width: 32%; border-right: 1px solid #EDE6FF; padding: 14px; display: flex; flex-direction: column; gap: 9px; }
	.app-main { flex: 1; padding: 14px; display: flex; flex-direction: column; gap: 9px; }
	.app-canvas { flex: 1; border-radius: 8px; background: #F4EFFF; }
	.art-phone { position: absolute; right: 0; top: 110px; width: 172px; height: 350px; border-radius: var(--radius-device); background: linear-gradient(160deg, #3B1A78 0%, #1E0B45 60%, #2B1260 100%); border: 1px solid #12052E; box-shadow: 0 40px 70px -20px rgba(40,10,100,0.6), inset 0 1px 0 rgba(255,255,255,0.35); padding: 10px; box-sizing: border-box; }
	.phone-screen { position: relative; height: 100%; border-radius: 28px; overflow: hidden; background: linear-gradient(180deg, var(--sky-200) 0%, #FFFFFF 60%); display: flex; flex-direction: column; gap: 10px; padding: 14px; }
	.phone-hero { height: 96px; border-radius: 18px; background: radial-gradient(circle at 50% 120%, #E2D4FF 0%, var(--violet-500) 55%, var(--violet-700) 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6); }
	.phone-cta { margin-top: auto; height: 34px; border-radius: 17px; background: linear-gradient(180deg, var(--violet-gloss-top) 0%, var(--violet-gloss-mid) 50%, var(--violet-gloss-low) 51%, var(--violet-gloss-base) 100%); }
	.phone-shine { position: absolute; top: -40px; left: -30px; width: 180px; height: 200px; transform: rotate(-25deg); background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.45), rgba(255,255,255,0)); }
	.art-phone-tag { position: absolute; right: 8px; top: 474px; }
</style>
```

Значения цветов, которых нет в токенах (`#EDE6FF`, `#F4EFFF`, `#E9DEFF`, `#CDB8FF`, тёмные тона телефона), перенесены из макета как декоративные — это допустимо по Global Constraints.

- [ ] **Step 4: Первый экран** — `src/lib/sections/Hero.svelte` (макет `index.html:84-197`):

```svelte
<script lang="ts">
	import type { PageContent } from '$lib/server/content';
	import type { Settings } from '$lib/server/db/schema';
	import GlossButton from '$lib/ui/GlossButton.svelte';
	import HeroArt from './HeroArt.svelte';
	import SiteNav from './SiteNav.svelte';

	let {
		settings,
		nav,
		hasProjects
	}: { settings: Settings; nav: PageContent['nav']; hasProjects: boolean } = $props();

	// [left, size, rest, duration, delay, sway] — позиции из макета
	const BUBBLES: [string, number, string, number, number, boolean][] = [
		['3%', 90, '58%', 18, -2, false], ['12%', 34, '30%', 13, -9, true],
		['22%', 56, '80%', 16, -5, false], ['31%', 22, '88%', 11, -3, true],
		['40%', 46, '12%', 15, -12, false], ['48%', 18, '50%', 10, -6, true],
		['55%', 70, '75%', 20, -14, false], ['63%', 28, '20%', 12, -1, true],
		['70%', 110, '5%', 22, -8, false], ['78%', 38, '62%', 14, -10, true],
		['85%', 24, '40%', 9, -4, false], ['91%', 64, '82%', 17, -11, true],
		['96%', 20, '25%', 12, -7, false], ['17%', 26, '8%', 19, -15, true],
		['36%', 40, '45%', 21, -18, false], ['60%', 52, '35%', 18, -16, true]
	];
</script>

<section aria-labelledby="hero-title" class="hero">
	<div class="wave" aria-hidden="true"></div>
	<div class="wave-line" aria-hidden="true"></div>
	<div aria-hidden="true">
		{#each BUBBLES as [left, size, rest, dur, delay, sway], i (i)}
			<span
				class="rise {sway ? 'sway-b' : ''}"
				style="--left: {left}; --size: {size}px; --rest: {rest}; --dur: {dur}s; --delay: {delay}s"
			></span>
		{/each}
	</div>

	<SiteNav {nav} />

	<div class="hero-inner">
		<div class="hero-copy">
			<div class="hero-badge">
				<span class="hero-badge-dot" aria-hidden="true"></span>
				<span>{settings.name} · {settings.city}</span>
			</div>
			<h1 id="hero-title" class="hero-title">
				{settings.heroTitle}
				{#if settings.heroTitleAccent}<span class="va-gradient-text">{settings.heroTitleAccent}</span>{/if}
			</h1>
			<p class="hero-text">{settings.heroText}</p>
			<div class="hero-actions">
				<GlossButton href="#contact" size="lg" icon="arrow-right">{settings.heroCtaPrimary}</GlossButton>
				{#if hasProjects}
					<GlossButton href="#projects" size="lg" variant="pearl">{settings.heroCtaSecondary}</GlossButton>
				{/if}
			</div>
		</div>
		<HeroArt />
	</div>
</section>

<style>
	.hero { position: relative; overflow: hidden; background: radial-gradient(ellipse 70% 55% at 75% 30%, rgba(196,168,255,0.85), transparent 70%), radial-gradient(ellipse 60% 50% at 10% 0%, rgba(255,255,255,0.9), transparent 70%), linear-gradient(180deg, var(--sky-400) 0%, var(--sky-200) 70%, var(--sky-100) 100%); }
	.wave { position: absolute; left: -20%; top: 62%; width: 140%; height: 220px; border-radius: 50%; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 45%, rgba(255,255,255,0) 100%); transform: rotate(-7deg); filter: blur(6px); animation: waveDrift 9s ease-in-out infinite alternate; }
	.wave-line { position: absolute; left: -10%; top: 70%; width: 120%; height: 120px; border-radius: 50%; border-top: 2px solid rgba(255,255,255,0.9); transform: rotate(-5deg); animation: waveLine 12s ease-in-out infinite alternate; }
	.rise { position: absolute; top: 100%; left: var(--left); width: var(--size); height: var(--size); border-radius: 50%; background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.98) 0 9%, rgba(255,255,255,0.4) 22%, rgba(214,195,255,0.25) 55%, var(--bubble) 100%); border: 1px solid rgba(255,255,255,0.85); box-shadow: inset 0 -6px 14px rgba(124,58,237,0.22); will-change: transform; animation: bubbleRiseA var(--dur) linear var(--delay) infinite; }
	.rise.sway-b { animation-name: bubbleRiseB; }
	@keyframes bubbleRiseA { 0% { transform: translate3d(0,0,0); opacity: 0 } 8% { opacity: 1 } 50% { transform: translate3d(18px,-430px,0) } 92% { opacity: 1 } 100% { transform: translate3d(-8px,-880px,0); opacity: 0 } }
	@keyframes bubbleRiseB { 0% { transform: translate3d(0,0,0); opacity: 0 } 8% { opacity: 1 } 50% { transform: translate3d(-16px,-430px,0) } 92% { opacity: 1 } 100% { transform: translate3d(10px,-880px,0); opacity: 0 } }
	@keyframes waveDrift { 0% { transform: translate3d(0,0,0) rotate(-7deg) scaleY(1) } 50% { transform: translate3d(-4%,-28px,0) rotate(-3deg) scaleY(1.15) } 100% { transform: translate3d(3%,14px,0) rotate(-10deg) scaleY(0.9) } }
	@keyframes waveLine { 0% { transform: translate3d(0,0,0) rotate(-5deg) } 50% { transform: translate3d(3%,-18px,0) rotate(-8deg) } 100% { transform: translate3d(-3%,10px,0) rotate(-2deg) } }
	@media (prefers-reduced-motion: reduce) {
		.rise { animation: none; top: var(--rest); }
		.wave, .wave-line { animation: none; }
	}
	.hero-inner { position: relative; z-index: 1; max-width: 1240px; margin: 0 auto; padding: 88px 32px 128px; display: flex; flex-wrap: wrap; align-items: center; gap: 64px; }
	.hero-copy { flex: 1 1 520px; min-width: 0; display: flex; flex-direction: column; gap: 30px; }
	.hero-badge { display: inline-flex; align-self: flex-start; align-items: center; gap: 10px; padding: 8px 18px 8px 10px; border-radius: var(--radius-pill); background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.55)); border: 1px solid var(--glass-edge); box-shadow: 0 4px 14px rgba(91,48,180,0.15); font-size: 14px; font-weight: 600; color: var(--ink-nav); }
	.hero-badge-dot { width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #FFFFFF 0 15%, #A78BFA 45%, var(--violet-600) 100%); box-shadow: 0 0 10px rgba(124,58,237,0.6); }
	.hero-title { margin: 0; font-family: var(--font-display); font-weight: 900; font-size: clamp(42px, 5.4vw, 76px); line-height: 1.02; letter-spacing: -0.02em; color: var(--ink); text-wrap: balance; }
	.hero-text { margin: 0; max-width: 560px; font-size: 19px; line-height: 1.65; color: var(--ink-body); text-wrap: pretty; }
	.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
</style>
```

- [ ] **Step 5: Страница** — `src/routes/+page.svelte`:

```svelte
<script lang="ts">
	import Hero from '$lib/sections/Hero.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.content);
</script>

<svelte:head>
	<title>{c.settings.seoTitle}</title>
	<meta name="description" content={c.settings.seoDescription} />
</svelte:head>

<div id="top" class="va-sky page">
	<Hero settings={c.settings} nav={c.nav} hasProjects={c.projects.length > 0} />
</div>

<style>
	.page { min-height: 100vh; color: var(--ink); overflow-x: clip; }
</style>
```

- [ ] **Step 6: Проверка глазами**

Run: `pnpm dev` и открыть `http://localhost:5173/` рядом с `docs/design/portfolio/index.html` (открыть файл в браузере).
Expected: первый экран совпадает с макетом: навигация-пилюля, плашка «Степан · [город]», заголовок с градиентной частью, две кнопки, иллюстрация, пузыри поднимаются. В DevTools → Rendering → `prefers-reduced-motion: reduce` пузыри стоят на местах.

- [ ] **Step 7: Проверки и коммит**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: render hero section from database content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Главная — стек, проекты, подход и анимация прокрутки

**Files:**
- Create: `src/lib/styles/story.css`, `src/lib/sections/Stack.svelte`, `src/lib/sections/Projects.svelte`, `src/lib/sections/Approach.svelte`
- Modify: `src/routes/layout.css`, `src/routes/+page.svelte`

**Interfaces:**
- Consumes: `PageContent` (Task 6), `SectionHeader`, `IconTile`, `Tags`, `Tag`, `Orb` (Task 11).
- Produces:
  - `Stack { items: StackItem[]; eyebrow: string; title: string; subtitle: string }`
  - `Projects { items: Project[]; eyebrow: string; title: string; githubUrl: string | null }`
  - `Approach { items: ApproachStep[]; eyebrow: string; title: string }`
  - Классы `.story`, `.story-inner`, `.story-track`, `.story-card` и переменные `--n` (на `section`) и `--i` (на карточке).

- [ ] **Step 1: Стили прокрутки** — `src/lib/styles/story.css`. Это перенос `index.html:30-77` с заменой селекторов: `.story > div` → `.story-inner`, `.glass-card` → `.story-card`, `> span:first-child` → `> .va-icon-tile` / `> .va-orb`, `> div` у стека → `> .va-tags`, `> span:last-child` у подхода → `> .step-tech`, у проектов `> div:first-child` → `> .va-well`, `> div:last-child` → `> .va-project-body`. Нумерация `nth-child` заменена на `--i`, заданную в разметке.

```css
/* Разделы, где карточки сменяют друг друга при прокрутке. Без поддержки
   animation-timeline и при «уменьшить движение» остаётся обычная сетка. */
.story-inner { max-width: 1240px; margin: 0 auto; padding: 96px 32px; display: flex; flex-direction: column; gap: 48px; }
:where(#projects) .story-inner { padding: 64px 32px 96px; }
:where(#approach) .story-inner { padding: 64px 32px 112px; }
:where(#stack) .story-track { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(210px, 100%), 1fr)); gap: 18px; }
:where(#projects) .story-track { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(520px, 100%), 1fr)); gap: 28px; }
:where(#approach) .story-track { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: 20px; }

@keyframes storyCard { 0% { opacity: 0; translate: 0 140px; scale: .7 } 22%, 78% { opacity: 1; translate: 0 0; scale: 1 } 100% { opacity: 0; translate: 0 -140px; scale: 1.06 } }
@keyframes storyFirst { 0%, 78% { opacity: 1; translate: 0 0; scale: 1 } 100% { opacity: 0; translate: 0 -140px; scale: 1.06 } }
@keyframes storyLast { 0% { opacity: 0; translate: 0 140px; scale: .7 } 22%, 100% { opacity: 1; translate: 0 0; scale: 1 } }
@keyframes storyX { 0% { opacity: 0; translate: 100% 0; scale: .92 } 22%, 78% { opacity: 1; translate: 0 0; scale: 1 } 100% { opacity: 0; translate: -100% 0; scale: .92 } }
@keyframes storyXFirst { 0%, 78% { opacity: 1; translate: 0 0; scale: 1 } 100% { opacity: 0; translate: -100% 0; scale: .92 } }
@keyframes storyXLast { 0% { opacity: 0; translate: 100% 0; scale: .92 } 22%, 100% { opacity: 1; translate: 0 0; scale: 1 } }

@supports (animation-timeline: view()) {
	@media (prefers-reduced-motion: no-preference) and (max-height: 1400px) {
		.story { height: calc(var(--n) * 80vh + 100vh); view-timeline-name: --story; }
		.story .story-inner { position: sticky; top: 0; height: 100vh; box-sizing: border-box; padding-top: 64px; padding-bottom: 40px; gap: 24px; }
		.story .story-track { display: block; position: relative; flex: 1; min-height: 0; }
		.story-track > .story-card { position: absolute; inset: 0; margin: auto; width: 100%; height: 100%; box-sizing: border-box; border-radius: 36px; animation: storyCard linear both; animation-timeline: --story; animation-range: contain calc(var(--i) * 100% / var(--n)) contain calc((var(--i) + 1) * 100% / var(--n)); }
		.story-track > .story-card:first-child { animation-name: storyFirst; }
		.story-track > .story-card:last-child { animation-name: storyLast; }
		.story-track > .story-card:only-child { animation: none; }
		#stack .story-track > .story-card { animation-name: storyX; }
		#stack .story-track > .story-card:first-child { animation-name: storyXFirst; }
		#stack .story-track > .story-card:last-child { animation-name: storyXLast; }

		#stack .story-card, #approach .story-card { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 56px; row-gap: 18px; align-content: center; align-items: start; padding: 64px 72px; }
		#stack .story-card > .va-icon-tile { grid-row: 1 / span 3; width: 150px; height: 150px; border-radius: 40px; }
		#stack .story-card > .va-icon-tile > svg { width: 72px; height: 72px; }
		#approach .story-card > .va-orb { grid-row: 1 / span 3; width: 150px; height: 150px; font-size: 64px; }
		.story-card h3 { font-size: clamp(36px, 4.4vw, 64px); line-height: 1.05; }
		#stack .story-card > p, #approach .story-card > p { font-size: clamp(18px, 1.8vw, 24px); max-width: 720px; }
		#stack .story-card > .va-tags { grid-column: 2; gap: 10px; }
		#stack .story-card > .va-tags > .va-tag { font-size: 18px; padding: 10px 20px; }
		#approach .story-card > .step-tech { grid-column: 2; font-size: 18px; }
		#projects .story-card { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 8px; padding: 16px; }
		#projects .story-card > .va-well { height: auto; min-height: 0; }
		#projects .story-card > .va-project-body { padding: 40px 36px; justify-content: center; gap: 18px; }
		#projects .story-card p { font-size: 20px; }
		#projects .story-card .va-project-year { font-size: 18px; }
		#projects .story-card .va-tags > .va-tag { font-size: 16px; padding: 8px 16px; }

		@media (max-width: 760px) {
			#stack .story-card, #approach .story-card, #projects .story-card { grid-template-columns: minmax(0, 1fr); padding: 32px 28px; }
			#stack .story-card > .va-icon-tile, #approach .story-card > .va-orb { grid-row: auto; width: 88px; height: 88px; }
			#approach .story-card > .va-orb { font-size: 40px; }
			#stack .story-card > .va-tags, #approach .story-card > .step-tech { grid-column: auto; }
			#projects .story-card > .va-well { min-height: 200px; }
			#projects .story-card > .va-project-body { padding: 20px 12px; }
		}
	}
}
```

Специфичность: базовые сетки обёрнуты в `:where(#id)`, чтобы `.story .story-track` и `.story .story-inner` в режиме анимации их перекрывали; правила карточек внутри `@media` используют `#id .story-card` и перекрывают `.va-glass-pad-*` и `.va-card-col`. `!important` не нужен — если правило не применяется (видно в DevTools), поднять его специфичность.

В `src/routes/layout.css` после строки с `components.css` добавить `@import '../lib/styles/story.css';` (все `@import` идут до `@plugin`).

- [ ] **Step 2: Стек** — `src/lib/sections/Stack.svelte`:

```svelte
<script lang="ts">
	import type { StackItem } from '$lib/server/db/schema';
	import IconTile from '$lib/ui/IconTile.svelte';
	import SectionHeader from '$lib/ui/SectionHeader.svelte';
	import Tags from '$lib/ui/Tags.svelte';

	let {
		items,
		eyebrow,
		title,
		subtitle
	}: { items: StackItem[]; eyebrow: string; title: string; subtitle: string } = $props();
</script>

<section id="stack" class="story" aria-labelledby="stack-title" style="--n: {items.length}">
	<div class="story-inner">
		<SectionHeader id="stack-title" {eyebrow} {title}>
			{#snippet aside()}
				{#if subtitle}<p class="va-section-aside">{subtitle}</p>{/if}
			{/snippet}
		</SectionHeader>
		<div class="story-track">
			{#each items as item, i (item.id)}
				<article class="story-card va-glass va-glass-xl va-glass-pad-md va-glass-lift va-card-col" style="--i: {i}">
					<IconTile icon={item.icon} />
					<h3 class="va-card-title">{item.title}</h3>
					<p class="va-card-text">{item.description}</p>
					<Tags items={item.tags} />
				</article>
			{/each}
		</div>
	</div>
</section>
```

- [ ] **Step 3: Проекты** — `src/lib/sections/Projects.svelte`:

```svelte
<script lang="ts">
	import type { Project } from '$lib/server/db/schema';
	import SectionHeader from '$lib/ui/SectionHeader.svelte';
	import Tag from '$lib/ui/Tag.svelte';
	import Tags from '$lib/ui/Tags.svelte';

	let {
		items,
		eyebrow,
		title,
		githubUrl
	}: { items: Project[]; eyebrow: string; title: string; githubUrl: string | null } = $props();
</script>

<section id="projects" class="story" aria-labelledby="projects-title" style="--n: {items.length}">
	<div class="story-inner">
		<SectionHeader id="projects-title" {eyebrow} {title}>
			{#snippet aside()}
				{#if githubUrl}
					<a href={githubUrl} class="github-link" target="_blank" rel="noopener">Все проекты на GitHub →</a>
				{/if}
			{/snippet}
		</SectionHeader>
		<div class="story-track">
			{#each items as p, i (p.id)}
				<svelte:element
					this={p.url ? 'a' : 'article'}
					href={p.url ?? undefined}
					target={p.url ? '_blank' : undefined}
					rel={p.url ? 'noopener' : undefined}
					class="story-card va-glass va-glass-2xl va-glass-pad-sm va-glass-lift va-project"
					style="--i: {i}"
				>
					<div class="va-well">
						{#if p.image}
							<img src="/uploads/{p.image}" alt="Скриншот проекта «{p.title}»" loading="lazy" />
						{:else}
							<span class="va-well-empty">{p.title}</span>
						{/if}
						<Tag tone="violet">{p.category}</Tag>
					</div>
					<div class="va-project-body">
						<div class="va-project-head">
							<h3 class="va-project-title">{p.title}</h3>
							<span class="va-project-year">{p.year}</span>
						</div>
						<p class="va-project-text">{p.description}</p>
						<Tags items={p.tags} />
					</div>
				</svelte:element>
			{/each}
		</div>
	</div>
</section>

<style>
	.github-link { display: inline-flex; align-items: center; min-height: 44px; font-weight: 700; }
	:global(a.va-project) { color: inherit; }
</style>
```

- [ ] **Step 4: Подход** — `src/lib/sections/Approach.svelte`:

```svelte
<script lang="ts">
	import type { ApproachStep } from '$lib/server/db/schema';
	import Orb from '$lib/ui/Orb.svelte';
	import SectionHeader from '$lib/ui/SectionHeader.svelte';

	let { items, eyebrow, title }: { items: ApproachStep[]; eyebrow: string; title: string } = $props();
</script>

<section id="approach" class="story" aria-labelledby="approach-title" style="--n: {items.length}">
	<div class="story-inner">
		<SectionHeader id="approach-title" {eyebrow} {title} />
		<ol class="story-track">
			{#each items as step, i (step.id)}
				<li class="story-card va-glass va-glass-2xl va-glass-pad-lg va-glass-lift va-card-col" style="--i: {i}">
					<Orb>{i + 1}</Orb>
					<h3 class="va-project-title">{step.title}</h3>
					<p class="va-project-text">{step.description}</p>
					{#if step.tags.length}<span class="step-tech">{step.tags.join(' · ')}</span>{/if}
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.step-tech { margin-top: auto; font-size: 14px; font-weight: 700; color: var(--violet-700); }
</style>
```

- [ ] **Step 5: Подключить на странице** — в `src/routes/+page.svelte` импортировать `Stack`, `Projects`, `Approach` и после `<Hero … />` добавить:

```svelte
	{#if c.eyebrows.stack}
		<Stack items={c.stack} eyebrow={c.eyebrows.stack} title={c.settings.stackTitle} subtitle={c.settings.stackSubtitle} />
	{/if}
	{#if c.eyebrows.projects}
		<Projects items={c.projects} eyebrow={c.eyebrows.projects} title={c.settings.projectsTitle} githubUrl={c.githubUrl} />
	{/if}
	{#if c.eyebrows.approach}
		<Approach items={c.approach} eyebrow={c.eyebrows.approach} title={c.settings.approachTitle} />
	{/if}
```

- [ ] **Step 6: Проверка глазами**

Run: `pnpm dev`, сравнить с макетом в Chrome, Firefox и при `prefers-reduced-motion: reduce`.
Expected: в Chrome карточки сменяются при прокрутке (стек — по горизонтали, проекты и подход — по вертикали); в Firefox и при уменьшенном движении — обычные сетки, на ширине 375px в одну колонку. Заглушка вместо скриншота показывает название проекта.

- [ ] **Step 7: Проверки и коммит**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: render stack, projects and approach sections with scroll story

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Главная — контакты, футер, SEO и страница ошибки

**Files:**
- Create: `src/lib/sections/Contact.svelte`, `src/routes/+error.svelte`, `e2e/home.test.ts`
- Modify: `src/routes/+page.svelte`

**Interfaces:**
- Consumes: `PageContent` (Task 6), `SectionHeader`, `Bubble`, `Eyebrow`, `Icon` (Task 11).
- Produces: `Contact { settings: Settings; links: Link[]; eyebrow: string }`.

- [ ] **Step 1: Контакты и футер** — `src/lib/sections/Contact.svelte` (макет `index.html:411-436`):

```svelte
<script lang="ts">
	import type { Link, Settings } from '$lib/server/db/schema';
	import Bubble from '$lib/ui/Bubble.svelte';
	import Eyebrow from '$lib/ui/Eyebrow.svelte';
	import Icon from '$lib/ui/Icon.svelte';

	let { settings, links, eyebrow }: { settings: Settings; links: Link[]; eyebrow: string } = $props();
</script>

<section id="contact" aria-labelledby="contact-title" class="va-dusk contact">
	<div class="contact-shine" aria-hidden="true"></div>
	<Bubble size={110} tone="dusk" class="contact-bubble" style="right: 8%; top: 22%" />
	<Bubble size={44} tone="dusk" class="contact-bubble" style="right: 22%; top: 56%" />
	<Bubble size={26} tone="dusk" class="contact-bubble" style="right: 4%; bottom: 22%" />

	<div class="contact-inner">
		<Eyebrow tone="dusk">{eyebrow}</Eyebrow>
		<h2 id="contact-title" class="contact-title">{settings.contactTitle}</h2>
		<div class="contact-actions">
			<a class="contact-email" href="mailto:{settings.email}">
				{settings.email}
				<Icon name="arrow-up-right" size={20} strokeWidth={2.4} />
			</a>
			{#if links.length}
				<div class="contact-links">
					{#each links as link (link.id)}
						<a class="light-link" href={link.url} target="_blank" rel="noopener">{link.label} ↗</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<footer class="contact-footer">
		<span>© {settings.footerYear} {settings.name}</span>
		<a class="light-link" href="#top">Наверх ↑</a>
	</footer>
</section>

<style>
	.contact { position: relative; overflow: hidden; background: radial-gradient(ellipse 60% 80% at 80% 0%, rgba(196,161,255,0.55), transparent 70%), linear-gradient(180deg, var(--violet-600) 0%, var(--violet-800) 55%, var(--dusk) 100%); }
	.contact-shine { position: absolute; left: -10%; top: -120px; width: 120%; height: 220px; border-radius: 50%; background: linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0)); }
	:global(.contact-bubble) { position: absolute; }
	.contact-inner { position: relative; max-width: 1240px; margin: 0 auto; padding: 128px 32px 96px; display: flex; flex-direction: column; gap: 40px; }
	.contact-title { margin: 0; max-width: 900px; font-family: var(--font-display); font-weight: 900; font-size: clamp(40px, 6vw, 88px); line-height: 1; letter-spacing: -0.02em; text-wrap: balance; text-shadow: 0 2px 20px rgba(30,5,70,0.35); }
	.contact-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 32px; }
	.contact-email { display: inline-flex; align-items: center; gap: 12px; min-height: 62px; padding: 0 34px; border-radius: var(--radius-pill); background: linear-gradient(180deg, #FFFFFF 0%, var(--sky-100) 50%, #E2D4FF 51%, #F4EFFF 100%); border: 1px solid var(--glass-edge); box-shadow: inset 0 1px 0 #FFFFFF, 0 12px 30px rgba(20,0,60,0.4); color: var(--violet-800); font-family: var(--font-display); font-weight: 900; font-size: 20px; letter-spacing: -0.01em; overflow-wrap: anywhere; transition: transform .15s ease, filter .15s ease; }
	.contact-email:hover { transform: translateY(-2px); filter: brightness(1.04); color: var(--violet-900); }
	.contact-links { display: flex; flex-wrap: wrap; gap: 4px 28px; font-size: 16px; font-weight: 700; }
	.light-link { display: inline-flex; align-items: center; min-height: 44px; color: #F4EEFF; }
	.light-link:hover { color: var(--on-violet); }
	.contact-footer { position: relative; max-width: 1240px; margin: 0 auto; padding: 24px 32px 36px; border-top: 1px solid rgba(255,255,255,0.22); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; font-size: 14px; color: var(--on-dusk-muted); }
</style>
```

- [ ] **Step 2: SEO и раздел на странице** — в `src/routes/+page.svelte`: импортировать `Contact` и логотип `import logo from '$lib/assets/logo/behappii-logo.svg';`; после `Approach` добавить

```svelte
	<Contact settings={c.settings} links={c.links} eyebrow={c.eyebrows.contact ?? ''} />
```

а в `<svelte:head>` после `description`:

```svelte
	<meta property="og:type" content="website" />
	<meta property="og:title" content={c.settings.seoTitle} />
	<meta property="og:description" content={c.settings.seoDescription} />
	<meta property="og:image" content={new URL(logo, page.url).href} />
```

с `import { page } from '$app/state';`.

- [ ] **Step 3: Страница ошибки** — `src/routes/+error.svelte`:

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import GlossButton from '$lib/ui/GlossButton.svelte';
</script>

<svelte:head>
	<title>{page.status} — behappii</title>
</svelte:head>

<main class="va-sky grid min-h-screen place-items-center px-4">
	<div class="va-glass va-glass-2xl va-glass-pad-lg flex max-w-md flex-col items-start gap-4">
		<span class="va-eyebrow va-eyebrow-sky">Ошибка {page.status}</span>
		<h1 class="font-display text-4xl font-black text-ink">
			{page.status === 404 ? 'Такой страницы нет' : 'Что-то сломалось'}
		</h1>
		<p class="text-ink-body">
			{page.status === 404
				? 'Проверьте адрес или вернитесь на главную.'
				: 'Попробуйте обновить страницу через минуту.'}
		</p>
		<GlossButton href="/">На главную</GlossButton>
	</div>
</main>
```

- [ ] **Step 4: Написать e2e-тест** — `e2e/home.test.ts`:

```ts
import { expect, test } from '@playwright/test';

test('главная показывает контент из базы', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle('behappii — веб-разработчик Степан');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Ваша идея — моя задача');
	await expect(page.getByRole('heading', { name: 'Работает везде' })).toBeVisible();
	await expect(page.getByText('01 · стек')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Есть идея? Давайте соберём её' })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Основная навигация' }).getByRole('link', { name: 'Проекты' })).toHaveAttribute('href', '#projects');
});

test('неизвестный адрес — страница 404', async ({ page }) => {
	const res = await page.goto('/nope');
	expect(res?.status()).toBe(404);
	await expect(page.getByRole('heading', { name: 'Такой страницы нет' })).toBeVisible();
});
```

- [ ] **Step 5: Запустить e2e**

Run: `pnpm test:e2e`
Expected: PASS (тесты из Task 8 и новые).

- [ ] **Step 6: Проверка глазами** — `pnpm dev`, вся главная сверху донизу рядом с макетом; Tab по странице — у каждой ссылки и кнопки виден фокус.

- [ ] **Step 7: Проверки и коммит**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: add contact section, seo tags and error page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Оболочка админки, обзор и настройки

**Files:**
- Create: `src/lib/admin/admin.css`, `src/lib/admin/Field.svelte`, `src/lib/admin/SaveBar.svelte`, `src/routes/admin/+layout.server.ts`, `src/routes/admin/+page.server.ts`, `src/routes/admin/settings/+page.server.ts`, `src/routes/admin/settings/+page.svelte`, `e2e/settings.test.ts`
- Modify: `src/routes/admin/+layout.svelte`, `src/routes/admin/+page.svelte`, `src/routes/layout.css`, `static/robots.txt`

**Interfaces:**
- Consumes: `getSettings`, `updateSettings` (Task 5), `countPlaceholders`, `getPageContent` (Task 6), `settingsSchema`, `parseForm` (Task 4), `login` (Task 8).
- Produces:
  - `Field { name: string; label: string; value: string; error?: string; type?: 'text' | 'textarea' | 'url' | 'email'; rows?: number; hint?: string }`
  - `SaveBar { saved: boolean; label?: string = 'Сохранить' }`
  - Классы `admin-input`, `admin-panel`, `admin-h1`, `admin-h2`.
  - Ответ form actions админки: `fail(400, { errors: Record<string,string>, values: Record<string,string> })` или `{ saved: true }`.

- [ ] **Step 1: Стили админки** — `src/lib/admin/admin.css`, подключить в `src/routes/layout.css` строкой `@import '../lib/admin/admin.css';` после остальных `@import`:

```css
.admin-input {
	min-height: 44px;
	width: 100%;
	border-radius: var(--radius-md);
	border: 1px solid var(--lilac-line);
	background: var(--glass-edge);
	color: var(--ink);
	font: inherit;
	font-size: 15px;
	padding: 10px 14px;
}
.admin-input:focus {
	border-color: var(--violet-600);
	box-shadow: var(--focus-ring);
	outline: none;
}
.admin-input[aria-invalid='true'] {
	border-color: var(--violet-800);
}
.admin-panel {
	box-sizing: border-box;
	background: linear-gradient(180deg, var(--glass), var(--glass-fade));
	border: 1px solid var(--glass-edge);
	box-shadow: var(--shadow-glass);
	border-radius: var(--radius-xl);
	padding: 24px;
}
.admin-h1 {
	margin: 0;
	font-family: var(--font-display);
	font-weight: 900;
	font-size: 34px;
	line-height: 1.1;
	color: var(--ink);
}
.admin-h2 {
	margin: 0;
	font-family: var(--font-display);
	font-weight: 800;
	font-size: 21px;
	color: var(--ink);
}
```

- [ ] **Step 2: Поле формы** — `src/lib/admin/Field.svelte`:

```svelte
<script lang="ts">
	let {
		name,
		label,
		value,
		error,
		type = 'text',
		rows = 4,
		hint
	}: {
		name: string;
		label: string;
		value: string;
		error?: string;
		type?: 'text' | 'textarea' | 'url' | 'email';
		rows?: number;
		hint?: string;
	} = $props();

	const id = $derived(`field-${name}`);
	const describedBy = $derived([hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined);
</script>

<div class="flex flex-col gap-1">
	<label for={id} class="text-sm font-semibold text-ink-nav">{label}</label>
	{#if type === 'textarea'}
		<textarea {id} {name} {rows} {value} class="admin-input" aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy}></textarea>
	{:else}
		<input {id} {name} {type} {value} class="admin-input" aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} />
	{/if}
	{#if hint}<p id="{id}-hint" class="text-xs text-ink-muted">{hint}</p>{/if}
	{#if error}<p id="{id}-error" class="text-sm font-semibold text-violet-800">{error}</p>{/if}
</div>
```

Поле `type="email"` у браузера отклонит заглушку `[you@email.com]`, поэтому для email использовать `type="text"` с подсказкой.

- [ ] **Step 3: Кнопка сохранения** — `src/lib/admin/SaveBar.svelte`:

```svelte
<script lang="ts">
	let { saved, label = 'Сохранить' }: { saved: boolean; label?: string } = $props();
</script>

<div class="flex items-center gap-4">
	<button type="submit" class="va-btn va-btn-md va-btn-violet">{label}</button>
	{#if saved}<p role="status" class="text-sm font-semibold text-violet-700">Сохранено</p>{/if}
</div>
```

- [ ] **Step 4: Оболочка** — `src/routes/admin/+layout.server.ts`:

```ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => ({ admin: locals.admin });
```

`src/routes/admin/+layout.svelte`:

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const SECTIONS = [
		{ href: '/admin', label: 'Обзор' },
		{ href: '/admin/settings', label: 'Тексты' },
		{ href: '/admin/stack', label: 'Стек' },
		{ href: '/admin/projects', label: 'Проекты' },
		{ href: '/admin/approach', label: 'Подход' },
		{ href: '/admin/links', label: 'Ссылки' },
		{ href: '/admin/backup', label: 'Бэкапы' }
	];
	const isCurrent = (href: string) =>
		href === '/admin' ? page.url.pathname === '/admin' : page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if data.admin}
	<div class="va-sky min-h-screen">
		<header class="px-4 pt-5">
			<nav aria-label="Разделы админки" class="va-nav mx-auto max-w-6xl">
				<div class="va-nav-links">
					{#each SECTIONS as s (s.href)}
						<a class="va-nav-link" href={s.href} aria-current={isCurrent(s.href) ? 'page' : undefined}>{s.label}</a>
					{/each}
				</div>
				<div class="flex items-center gap-3">
					<a class="va-btn va-btn-md va-btn-pearl" href="/" target="_blank" rel="noopener">Открыть сайт</a>
					<form method="POST" action="/admin/logout">
						<button type="submit" class="va-btn va-btn-md va-btn-pearl">Выйти</button>
					</form>
				</div>
			</nav>
		</header>
		<main class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
			{@render children()}
		</main>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	[aria-current='page'] {
		color: var(--violet-600);
		text-decoration: underline;
		text-underline-offset: 6px;
	}
</style>
```

- [ ] **Step 5: Обзор** — `src/routes/admin/+page.server.ts`:

```ts
import { countPlaceholders, getPageContent } from '$lib/server/content';
import { getDb } from '$lib/server/db';
import { listProjects } from '$lib/server/repo/lists';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const db = getDb();
	const c = getPageContent(db);
	return {
		placeholders: countPlaceholders(db),
		counts: {
			stack: c.stack.length,
			projects: listProjects(db).length,
			published: c.projects.length,
			approach: c.approach.length,
			links: c.links.length
		}
	};
};
```

`src/routes/admin/+page.svelte`:

```svelte
<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	const cards = $derived([
		{ href: '/admin/settings', title: 'Тексты', text: 'Первый экран, заголовки разделов, почта, SEO' },
		{ href: '/admin/stack', title: 'Стек', text: `Карточек: ${data.counts.stack}` },
		{ href: '/admin/projects', title: 'Проекты', text: `Всего: ${data.counts.projects}, на сайте: ${data.counts.published}` },
		{ href: '/admin/approach', title: 'Подход', text: `Этапов: ${data.counts.approach}` },
		{ href: '/admin/links', title: 'Ссылки', text: `Ссылок: ${data.counts.links}` },
		{ href: '/admin/backup', title: 'Бэкапы', text: 'Экспорт, импорт, восстановление' }
	]);
</script>

<svelte:head><title>Обзор — админка</title></svelte:head>

<h1 class="admin-h1">Обзор</h1>

{#if data.placeholders > 0}
	<p class="admin-panel font-semibold text-ink-body">
		На сайте осталось заглушек в [скобках]: {data.placeholders}. Замените их перед публикацией.
	</p>
{/if}

<div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr))">
	{#each cards as card (card.href)}
		<a href={card.href} class="va-glass va-glass-xl va-glass-pad-md va-glass-lift flex flex-col gap-2">
			<span class="admin-h2">{card.title}</span>
			<span class="text-sm text-ink-body">{card.text}</span>
		</a>
	{/each}
</div>
```

- [ ] **Step 6: Настройки — сервер** — `src/routes/admin/settings/+page.server.ts`:

```ts
import { fail } from '@sveltejs/kit';
import { parseForm, settingsSchema } from '$lib/schemas';
import { getDb } from '$lib/server/db';
import { getSettings, updateSettings } from '$lib/server/repo/settings';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ settings: getSettings(getDb()) });

export const actions: Actions = {
	default: async ({ request }) => {
		const result = parseForm(settingsSchema, await request.formData());
		if (!result.ok) return fail(400, { errors: result.errors, values: result.values });
		updateSettings(getDb(), result.data);
		return { saved: true };
	}
};
```

- [ ] **Step 7: Настройки — страница** — `src/routes/admin/settings/+page.svelte`:

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '$lib/admin/Field.svelte';
	import SaveBar from '$lib/admin/SaveBar.svelte';
	import type { SettingsInput } from '$lib/schemas';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	type F = { name: keyof SettingsInput; label: string; type?: 'textarea'; hint?: string };
	const GROUPS: { title: string; fields: F[] }[] = [
		{
			title: 'Общее',
			fields: [
				{ name: 'name', label: 'Имя', hint: 'В плашке первого экрана и в футере' },
				{ name: 'city', label: 'Город' },
				{ name: 'email', label: 'Почта', hint: 'Адрес или заглушка в [скобках]' },
				{ name: 'footerYear', label: 'Год в футере' }
			]
		},
		{
			title: 'Первый экран',
			fields: [
				{ name: 'heroTitle', label: 'Заголовок' },
				{ name: 'heroTitleAccent', label: 'Акцентная часть заголовка', hint: 'Выводится градиентом после заголовка' },
				{ name: 'heroText', label: 'Текст', type: 'textarea' },
				{ name: 'heroCtaPrimary', label: 'Главная кнопка' },
				{ name: 'heroCtaSecondary', label: 'Вторая кнопка' }
			]
		},
		{
			title: 'Разделы',
			fields: [
				{ name: 'stackEyebrow', label: 'Стек: метка', hint: 'Номер «01 ·» добавляется сам' },
				{ name: 'stackTitle', label: 'Стек: заголовок' },
				{ name: 'stackSubtitle', label: 'Стек: подзаголовок' },
				{ name: 'projectsEyebrow', label: 'Проекты: метка' },
				{ name: 'projectsTitle', label: 'Проекты: заголовок' },
				{ name: 'approachEyebrow', label: 'Подход: метка' },
				{ name: 'approachTitle', label: 'Подход: заголовок' },
				{ name: 'contactEyebrow', label: 'Контакты: метка' },
				{ name: 'contactTitle', label: 'Контакты: заголовок' }
			]
		},
		{
			title: 'SEO',
			fields: [
				{ name: 'seoTitle', label: 'Заголовок вкладки' },
				{ name: 'seoDescription', label: 'Описание для поисковиков', type: 'textarea' }
			]
		}
	];

	const value = (name: keyof SettingsInput) => form?.values?.[name] ?? String(data.settings[name]);
</script>

<svelte:head><title>Тексты — админка</title></svelte:head>

<h1 class="admin-h1">Тексты</h1>

<form method="POST" use:enhance={() => async ({ update }) => update({ reset: false })} class="flex flex-col gap-6">
	{#each GROUPS as group (group.title)}
		<fieldset class="admin-panel flex flex-col gap-4">
			<legend class="admin-h2 px-2">{group.title}</legend>
			{#each group.fields as f (f.name)}
				<Field name={f.name} label={f.label} type={f.type} hint={f.hint} value={value(f.name)} error={form?.errors?.[f.name]} />
			{/each}
		</fieldset>
	{/each}
	<SaveBar saved={!!form?.saved} />
</form>
```

`update({ reset: false })` не очищает форму после успешного сохранения, иначе поля мигнут к значениям по умолчанию до перезагрузки данных.

- [ ] **Step 8: robots.txt** — `static/robots.txt`:

```
# allow crawling everything by default
User-agent: *
Disallow: /admin
```

- [ ] **Step 9: Написать e2e-тест** — `e2e/settings.test.ts`:

```ts
import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('правка заголовка первого экрана видна на главной', async ({ page }) => {
	await login(page);
	await expect(page.getByText(/осталось заглушек/)).toBeVisible();
	await page.getByRole('link', { name: 'Тексты' }).first().click();
	await page.getByLabel('Заголовок', { exact: true }).fill('Сайты, которые работают —');
	await page.getByRole('button', { name: 'Сохранить' }).click();
	await expect(page.getByRole('status')).toHaveText('Сохранено');

	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Сайты, которые работают —');
});

test('ошибка валидации не теряет ввод', async ({ page }) => {
	await login(page);
	await page.goto('/admin/settings');
	await page.getByLabel('Город').fill('Биробиджан');
	await page.getByLabel('Имя').fill('');
	await page.getByRole('button', { name: 'Сохранить' }).click();
	await expect(page.getByText('Обязательное поле')).toBeVisible();
	await expect(page.getByLabel('Город')).toHaveValue('Биробиджан');
});
```

- [ ] **Step 10: Запустить e2e**

Run: `pnpm test:e2e`
Expected: PASS. Тест `auth.test.ts` «вход и выход» по-прежнему проходит: кнопка «Выйти» теперь в шапке.

- [ ] **Step 11: Проверки и коммит**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: add admin shell, overview and settings editor

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: Админка — стек, подход, ссылки

**Files:**
- Create: `src/lib/server/admin-actions.ts`, `src/lib/admin/ItemList.svelte`, `src/lib/admin/IconPicker.svelte`
- Create: `src/routes/admin/stack/+page.server.ts`, `src/routes/admin/stack/+page.svelte`, `src/routes/admin/stack/[id]/+page.server.ts`, `src/routes/admin/stack/[id]/+page.svelte`
- Create: те же четыре файла в `src/routes/admin/approach/` и `src/routes/admin/links/`
- Test: `e2e/lists.test.ts`

**Interfaces:**
- Consumes: репозитории и `moveItem` (Task 5), схемы (Task 4), `Field`, `SaveBar` (Task 15), `STACK_ICONS`, `STACK_ICON_LABELS` (Task 2), `Icon` (Task 11).
- Produces:
  - `sortableActions(table: SortableTable, remove: (db: Db, id: number) => void | Promise<void>): { move: Action; delete: Action }` — форма передаёт `id` и (для move) `direction`.
  - `parseId(param: string): number | 'new'` — бросает `error(404)` на мусор.
  - `ItemList { items: { id: number; title: string; meta?: string }[]; base: string }` — `base` вроде `/admin/stack`.
  - `IconPicker { value: StackIcon; error?: string }`.

- [ ] **Step 1: Общие действия** — `src/lib/server/admin-actions.ts`:

```ts
import { error, type Action } from '@sveltejs/kit';
import type { Db } from './db/client';
import { getDb } from './db';
import { moveItem, type SortableTable } from './repo/sortable';

export function parseId(param: string): number | 'new' {
	if (param === 'new') return 'new';
	const id = Number(param);
	if (!Number.isInteger(id) || id <= 0) error(404, 'Не найдено');
	return id;
}

const formId = (form: FormData): number => Number(form.get('id'));

export function sortableActions(
	table: SortableTable,
	remove: (db: Db, id: number) => void | Promise<void>
): { move: Action; delete: Action } {
	return {
		move: async ({ request }) => {
			const form = await request.formData();
			moveItem(getDb(), table, formId(form), form.get('direction') === 'up' ? 'up' : 'down');
		},
		delete: async ({ request }) => {
			await remove(getDb(), formId(await request.formData()));
		}
	};
}
```

- [ ] **Step 2: Список** — `src/lib/admin/ItemList.svelte`:

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';

	let { items, base }: { items: { id: number; title: string; meta?: string }[]; base: string } = $props();
</script>

{#if items.length === 0}
	<p class="admin-panel text-ink-body">Пока пусто — раздел на сайте скрыт.</p>
{:else}
	<ol class="flex flex-col gap-3">
		{#each items as item, i (item.id)}
			<li class="admin-panel flex flex-wrap items-center gap-4">
				<div class="flex min-w-0 flex-1 flex-col">
					<span class="admin-h2 truncate">{item.title}</span>
					{#if item.meta}<span class="text-sm text-ink-muted">{item.meta}</span>{/if}
				</div>
				<form method="POST" action="?/move" use:enhance class="flex gap-2">
					<input type="hidden" name="id" value={item.id} />
					<button type="submit" name="direction" value="up" class="va-btn va-btn-md va-btn-pearl" disabled={i === 0} aria-label="Поднять «{item.title}»">↑</button>
					<button type="submit" name="direction" value="down" class="va-btn va-btn-md va-btn-pearl" disabled={i === items.length - 1} aria-label="Опустить «{item.title}»">↓</button>
				</form>
				<a href="{base}/{item.id}" class="va-btn va-btn-md va-btn-pearl">Изменить</a>
				<details class="relative">
					<summary class="va-btn va-btn-md va-btn-pearl list-none">Удалить</summary>
					<form method="POST" action="?/delete" use:enhance class="admin-panel absolute right-0 z-10 mt-2 flex w-64 flex-col gap-3">
						<input type="hidden" name="id" value={item.id} />
						<p class="text-sm text-ink-body">Удалить «{item.title}»? Отменить нельзя.</p>
						<button type="submit" class="va-btn va-btn-md va-btn-violet">Да, удалить</button>
					</form>
				</details>
			</li>
		{/each}
	</ol>
{/if}
```

- [ ] **Step 3: Выбор иконки** — `src/lib/admin/IconPicker.svelte`:

```svelte
<script lang="ts">
	import { STACK_ICON_LABELS, STACK_ICONS, type StackIcon } from '$lib/icons';
	import Icon from '$lib/ui/Icon.svelte';

	let { value, error }: { value: StackIcon; error?: string } = $props();
</script>

<fieldset class="flex flex-col gap-2">
	<legend class="text-sm font-semibold text-ink-nav">Иконка</legend>
	<div class="flex flex-wrap gap-2">
		{#each STACK_ICONS as icon (icon)}
			<label class="icon-option">
				<input type="radio" name="icon" value={icon} checked={icon === value} class="sr-only" />
				<span class="va-icon-tile"><Icon name={icon} size={26} /></span>
				<span class="text-xs font-semibold text-ink-nav">{STACK_ICON_LABELS[icon]}</span>
			</label>
		{/each}
	</div>
	{#if error}<p class="text-sm font-semibold text-violet-800">{error}</p>{/if}
</fieldset>

<style>
	.icon-option { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px; border-radius: var(--radius-icon); border: 2px solid transparent; cursor: pointer; }
	.icon-option:has(input:checked) { border-color: var(--violet-600); background: var(--glass); }
	.icon-option:has(input:focus-visible) { box-shadow: var(--focus-ring); }
</style>
```

- [ ] **Step 4: Стек — список** — `src/routes/admin/stack/+page.server.ts`:

```ts
import { getDb } from '$lib/server/db';
import { stackItems } from '$lib/server/db/schema';
import { sortableActions } from '$lib/server/admin-actions';
import { deleteStackItem, listStackItems } from '$lib/server/repo/lists';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ items: listStackItems(getDb()) });

export const actions = sortableActions(stackItems, deleteStackItem);
```

`src/routes/admin/stack/+page.svelte`:

```svelte
<script lang="ts">
	import ItemList from '$lib/admin/ItemList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Стек — админка</title></svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4">
	<h1 class="admin-h1">Стек</h1>
	<a href="/admin/stack/new" class="va-btn va-btn-md va-btn-violet">Добавить карточку</a>
</div>
<ItemList base="/admin/stack" items={data.items.map((i) => ({ id: i.id, title: i.title, meta: i.tags.join(', ') }))} />
```

- [ ] **Step 5: Стек — форма** — `src/routes/admin/stack/[id]/+page.server.ts`:

```ts
import { error, fail, redirect } from '@sveltejs/kit';
import { parseForm, stackItemSchema } from '$lib/schemas';
import { parseId } from '$lib/server/admin-actions';
import { getDb } from '$lib/server/db';
import { createStackItem, getStackItem, updateStackItem } from '$lib/server/repo/lists';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const id = parseId(params.id);
	if (id === 'new') return { item: null };
	const item = getStackItem(getDb(), id);
	if (!item) error(404, 'Карточка не найдена');
	return { item };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = parseId(params.id);
		const result = parseForm(stackItemSchema, await request.formData());
		if (!result.ok) return fail(400, { errors: result.errors, values: result.values });
		const db = getDb();
		if (id === 'new') {
			createStackItem(db, result.data);
			redirect(303, '/admin/stack');
		}
		if (!getStackItem(db, id)) error(404, 'Карточка не найдена');
		updateStackItem(db, id, result.data);
		return { saved: true };
	}
};
```

`src/routes/admin/stack/[id]/+page.svelte`:

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '$lib/admin/Field.svelte';
	import IconPicker from '$lib/admin/IconPicker.svelte';
	import SaveBar from '$lib/admin/SaveBar.svelte';
	import type { StackIcon } from '$lib/icons';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const v = (key: 'title' | 'description' | 'tags' | 'icon', fallback: string) => form?.values?.[key] ?? fallback;
</script>

<svelte:head><title>{data.item ? 'Карточка стека' : 'Новая карточка'} — админка</title></svelte:head>

<a href="/admin/stack" class="text-sm font-semibold">← Ко всем карточкам</a>
<h1 class="admin-h1">{data.item ? data.item.title : 'Новая карточка'}</h1>

<form method="POST" use:enhance={() => async ({ update }) => update({ reset: false })} class="admin-panel flex flex-col gap-4">
	<Field name="title" label="Название" value={v('title', data.item?.title ?? '')} error={form?.errors?.title} />
	<Field name="description" label="Описание" type="textarea" rows={3} value={v('description', data.item?.description ?? '')} error={form?.errors?.description} />
	<IconPicker value={v('icon', data.item?.icon ?? 'web') as StackIcon} error={form?.errors?.icon} />
	<Field name="tags" label="Теги" hint="Через запятую: SvelteKit, Next.js" value={v('tags', data.item?.tags.join(', ') ?? '')} error={form?.errors?.tags} />
	<SaveBar saved={!!form?.saved} label={data.item ? 'Сохранить' : 'Добавить'} />
</form>
```

- [ ] **Step 6: Подход** — четыре файла в `src/routes/admin/approach/`, устроены как у стека, но без иконки.

`src/routes/admin/approach/+page.server.ts`:

```ts
import { getDb } from '$lib/server/db';
import { approachSteps } from '$lib/server/db/schema';
import { sortableActions } from '$lib/server/admin-actions';
import { deleteApproachStep, listApproachSteps } from '$lib/server/repo/lists';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ items: listApproachSteps(getDb()) });

export const actions = sortableActions(approachSteps, deleteApproachStep);
```

`src/routes/admin/approach/+page.svelte`:

```svelte
<script lang="ts">
	import ItemList from '$lib/admin/ItemList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Подход — админка</title></svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4">
	<h1 class="admin-h1">Подход</h1>
	<a href="/admin/approach/new" class="va-btn va-btn-md va-btn-violet">Добавить этап</a>
</div>
<ItemList base="/admin/approach" items={data.items.map((s, i) => ({ id: s.id, title: `${i + 1}. ${s.title}`, meta: s.tags.join(' · ') }))} />
```

`src/routes/admin/approach/[id]/+page.server.ts`:

```ts
import { error, fail, redirect } from '@sveltejs/kit';
import { approachStepSchema, parseForm } from '$lib/schemas';
import { parseId } from '$lib/server/admin-actions';
import { getDb } from '$lib/server/db';
import { createApproachStep, getApproachStep, updateApproachStep } from '$lib/server/repo/lists';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const id = parseId(params.id);
	if (id === 'new') return { item: null };
	const item = getApproachStep(getDb(), id);
	if (!item) error(404, 'Этап не найден');
	return { item };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = parseId(params.id);
		const result = parseForm(approachStepSchema, await request.formData());
		if (!result.ok) return fail(400, { errors: result.errors, values: result.values });
		const db = getDb();
		if (id === 'new') {
			createApproachStep(db, result.data);
			redirect(303, '/admin/approach');
		}
		if (!getApproachStep(db, id)) error(404, 'Этап не найден');
		updateApproachStep(db, id, result.data);
		return { saved: true };
	}
};
```

`src/routes/admin/approach/[id]/+page.svelte`:

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '$lib/admin/Field.svelte';
	import SaveBar from '$lib/admin/SaveBar.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const v = (key: 'title' | 'description' | 'tags', fallback: string) => form?.values?.[key] ?? fallback;
</script>

<svelte:head><title>{data.item ? 'Этап' : 'Новый этап'} — админка</title></svelte:head>

<a href="/admin/approach" class="text-sm font-semibold">← Ко всем этапам</a>
<h1 class="admin-h1">{data.item ? data.item.title : 'Новый этап'}</h1>

<form method="POST" use:enhance={() => async ({ update }) => update({ reset: false })} class="admin-panel flex flex-col gap-4">
	<Field name="title" label="Название" value={v('title', data.item?.title ?? '')} error={form?.errors?.title} />
	<Field name="description" label="Описание" type="textarea" value={v('description', data.item?.description ?? '')} error={form?.errors?.description} />
	<Field name="tags" label="Технологии" hint="Через запятую; на сайте выводятся через «·»" value={v('tags', data.item?.tags.join(', ') ?? '')} error={form?.errors?.tags} />
	<SaveBar saved={!!form?.saved} label={data.item ? 'Сохранить' : 'Добавить'} />
</form>
```

- [ ] **Step 7: Ссылки** — четыре файла в `src/routes/admin/links/`.

`src/routes/admin/links/+page.server.ts`:

```ts
import { getDb } from '$lib/server/db';
import { links } from '$lib/server/db/schema';
import { sortableActions } from '$lib/server/admin-actions';
import { deleteLink, listLinks } from '$lib/server/repo/lists';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ items: listLinks(getDb()) });

export const actions = sortableActions(links, deleteLink);
```

`src/routes/admin/links/+page.svelte`:

```svelte
<script lang="ts">
	import ItemList from '$lib/admin/ItemList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Ссылки — админка</title></svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4">
	<h1 class="admin-h1">Ссылки</h1>
	<a href="/admin/links/new" class="va-btn va-btn-md va-btn-violet">Добавить ссылку</a>
</div>
<p class="text-sm text-ink-body">Ссылка с названием GitHub ещё и выводится как «Все проекты на GitHub» в разделе проектов.</p>
<ItemList base="/admin/links" items={data.items.map((l) => ({ id: l.id, title: l.label, meta: l.url }))} />
```

`src/routes/admin/links/[id]/+page.server.ts`:

```ts
import { error, fail, redirect } from '@sveltejs/kit';
import { linkSchema, parseForm } from '$lib/schemas';
import { parseId } from '$lib/server/admin-actions';
import { getDb } from '$lib/server/db';
import { createLink, getLink, updateLink } from '$lib/server/repo/lists';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const id = parseId(params.id);
	if (id === 'new') return { item: null };
	const item = getLink(getDb(), id);
	if (!item) error(404, 'Ссылка не найдена');
	return { item };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = parseId(params.id);
		const result = parseForm(linkSchema, await request.formData());
		if (!result.ok) return fail(400, { errors: result.errors, values: result.values });
		const db = getDb();
		if (id === 'new') {
			createLink(db, result.data);
			redirect(303, '/admin/links');
		}
		if (!getLink(db, id)) error(404, 'Ссылка не найдена');
		updateLink(db, id, result.data);
		return { saved: true };
	}
};
```

`src/routes/admin/links/[id]/+page.svelte`:

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '$lib/admin/Field.svelte';
	import SaveBar from '$lib/admin/SaveBar.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const v = (key: 'label' | 'url', fallback: string) => form?.values?.[key] ?? fallback;
</script>

<svelte:head><title>{data.item ? 'Ссылка' : 'Новая ссылка'} — админка</title></svelte:head>

<a href="/admin/links" class="text-sm font-semibold">← Ко всем ссылкам</a>
<h1 class="admin-h1">{data.item ? data.item.label : 'Новая ссылка'}</h1>

<form method="POST" use:enhance={() => async ({ update }) => update({ reset: false })} class="admin-panel flex flex-col gap-4">
	<Field name="label" label="Название" value={v('label', data.item?.label ?? '')} error={form?.errors?.label} />
	<Field name="url" label="Адрес" type="url" value={v('url', data.item?.url ?? '')} error={form?.errors?.url} />
	<SaveBar saved={!!form?.saved} label={data.item ? 'Сохранить' : 'Добавить'} />
</form>
```

- [ ] **Step 8: Написать e2e-тест** — `e2e/lists.test.ts`:

```ts
import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('добавить, переставить и удалить карточку стека', async ({ page }) => {
	await login(page);
	await page.goto('/admin/stack/new');
	await page.getByLabel('Название').fill('Игры');
	await page.getByLabel('Описание').fill('Браузерные игры на Canvas.');
	await page.getByText('Дизайн', { exact: true }).click();
	await page.getByLabel('Теги').fill('Canvas, Canvas, PixiJS');
	await page.getByRole('button', { name: 'Добавить' }).click();
	await expect(page).toHaveURL('/admin/stack');

	const last = page.getByRole('listitem').last();
	await expect(last).toContainText('Игры');
	await expect(last).toContainText('Canvas, PixiJS');

	const count = await page.getByRole('listitem').count();
	await page.getByRole('button', { name: 'Поднять «Игры»' }).click();
	await expect(page.getByRole('listitem').nth(count - 2)).toContainText('Игры');

	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Игры' })).toBeAttached();

	await page.goto('/admin/stack');
	const row = page.getByRole('listitem').filter({ hasText: 'Игры' });
	await row.getByText('Удалить', { exact: true }).click();
	await row.getByRole('button', { name: 'Да, удалить' }).click();
	await expect(page.getByRole('listitem').filter({ hasText: 'Игры' })).toHaveCount(0);
});

test('устаревший id отвечает 404', async ({ page }) => {
	await login(page);
	const res = await page.goto('/admin/stack/99999');
	expect(res?.status()).toBe(404);
	expect((await page.goto('/admin/links/abc'))?.status()).toBe(404);
});

test('ссылка: отказ на javascript:', async ({ page }) => {
	await login(page);
	await page.goto('/admin/links/new');
	await page.getByLabel('Название').fill('Плохая');
	await page.getByLabel('Адрес').fill('javascript:alert(1)');
	await page.getByRole('button', { name: 'Добавить' }).click();
	await expect(page.getByText('Нужна ссылка вида https://…')).toBeVisible();
});
```

Поле `type="url"` может не пустить `javascript:alert(1)` ещё в браузере, и тест не дойдёт до сервера. Если так, в этом тесте перед кликом снять клиентскую проверку: `await page.locator('form').evaluate((f) => f.setAttribute('novalidate', ''));`.

- [ ] **Step 9: Запустить e2e**

Run: `pnpm test:e2e`
Expected: PASS.

- [ ] **Step 10: Проверки и коммит**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: edit stack, approach and links in admin

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: Админка — проекты со скриншотами

**Files:**
- Create: `src/routes/admin/projects/+page.server.ts`, `src/routes/admin/projects/+page.svelte`, `src/routes/admin/projects/[id]/+page.server.ts`, `src/routes/admin/projects/[id]/+page.svelte`
- Test: `e2e/projects.test.ts`

**Interfaces:**
- Consumes: `listProjects`, `getProject`, `createProject`, `updateProject`, `deleteProject` (Task 5), `projectSchema`, `parseForm` (Task 4), `saveImage`, `deleteImage`, `UploadError` (Task 9), `sortableActions`, `parseId`, `ItemList` (Task 16), `Field`, `SaveBar` (Task 15).
- Produces: форма проекта — `multipart/form-data` с полями `title`, `category`, `year`, `description`, `url`, `tags`, `published` (checkbox), `image` (file), `removeImage` (checkbox).

- [ ] **Step 1: Список** — `src/routes/admin/projects/+page.server.ts`:

```ts
import { getDb } from '$lib/server/db';
import { projects } from '$lib/server/db/schema';
import { sortableActions } from '$lib/server/admin-actions';
import { deleteProject, listProjects } from '$lib/server/repo/lists';
import { deleteImage } from '$lib/server/uploads';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ items: listProjects(getDb()) });

export const actions = sortableActions(projects, async (db, id) => {
	await deleteImage(deleteProject(db, id));
});
```

`src/routes/admin/projects/+page.svelte`:

```svelte
<script lang="ts">
	import ItemList from '$lib/admin/ItemList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Проекты — админка</title></svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4">
	<h1 class="admin-h1">Проекты</h1>
	<a href="/admin/projects/new" class="va-btn va-btn-md va-btn-violet">Добавить проект</a>
</div>
<ItemList
	base="/admin/projects"
	items={data.items.map((p) => ({
		id: p.id,
		title: p.title,
		meta: [p.category, p.year, p.published ? null : 'не опубликован', p.image ? null : 'без скриншота'].filter(Boolean).join(' · ')
	}))}
/>
```

- [ ] **Step 2: Форма — сервер** — `src/routes/admin/projects/[id]/+page.server.ts`:

```ts
import { error, fail, redirect } from '@sveltejs/kit';
import { parseForm, projectSchema } from '$lib/schemas';
import { parseId } from '$lib/server/admin-actions';
import { getDb } from '$lib/server/db';
import { createProject, getProject, updateProject } from '$lib/server/repo/lists';
import { deleteImage, saveImage, UploadError } from '$lib/server/uploads';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const id = parseId(params.id);
	if (id === 'new') return { item: null };
	const item = getProject(getDb(), id);
	if (!item) error(404, 'Проект не найден');
	return { item };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const id = parseId(params.id);
		const db = getDb();
		const existing = id === 'new' ? null : getProject(db, id);
		if (id !== 'new' && !existing) error(404, 'Проект не найден');

		const form = await request.formData();
		const result = parseForm(projectSchema, form);
		if (!result.ok) return fail(400, { errors: result.errors, values: result.values });

		const file = form.get('image');
		let newImage: string | null = null;
		if (file instanceof File && file.size > 0) {
			try {
				newImage = await saveImage(file);
			} catch (e) {
				if (!(e instanceof UploadError)) throw e;
				return fail(400, { errors: { image: e.message }, values: result.values });
			}
		}

		const oldImage = existing?.image ?? null;
		const removeImage = form.get('removeImage') === 'on';
		const image = newImage ?? (removeImage ? null : oldImage);

		try {
			if (id === 'new') createProject(db, { ...result.data, image });
			else updateProject(db, id, { ...result.data, image });
		} catch (e) {
			await deleteImage(newImage);
			throw e;
		}
		if (oldImage && oldImage !== image) await deleteImage(oldImage);

		if (id === 'new') redirect(303, '/admin/projects');
		return { saved: true };
	}
};
```

- [ ] **Step 3: Форма — страница** — `src/routes/admin/projects/[id]/+page.svelte`:

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '$lib/admin/Field.svelte';
	import SaveBar from '$lib/admin/SaveBar.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	type Key = 'title' | 'category' | 'year' | 'description' | 'url' | 'tags';
	const v = (key: Key, fallback: string) => form?.values?.[key] ?? fallback;
	const published = $derived(form?.values ? form.values.published === 'on' : (data.item?.published ?? true));

	let preview = $state<string | null>(null);
	function onFile(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (preview) URL.revokeObjectURL(preview);
		preview = file ? URL.createObjectURL(file) : null;
	}
	const current = $derived(preview ?? (data.item?.image ? `/uploads/${data.item.image}` : null));
</script>

<svelte:head><title>{data.item ? 'Проект' : 'Новый проект'} — админка</title></svelte:head>

<a href="/admin/projects" class="text-sm font-semibold">← Ко всем проектам</a>
<h1 class="admin-h1">{data.item ? data.item.title : 'Новый проект'}</h1>

<form
	method="POST"
	enctype="multipart/form-data"
	use:enhance={() => async ({ update }) => {
		await update({ reset: false });
		preview = null;
	}}
	class="admin-panel flex flex-col gap-4"
>
	<Field name="title" label="Название" value={v('title', data.item?.title ?? '')} error={form?.errors?.title} />
	<div class="grid gap-4 sm:grid-cols-2">
		<Field name="category" label="Платформа" hint="Бейдж на скриншоте: Веб, Мобайл, Десктоп" value={v('category', data.item?.category ?? '')} error={form?.errors?.category} />
		<Field name="year" label="Год" value={v('year', data.item?.year ?? '')} error={form?.errors?.year} />
	</div>
	<Field name="description" label="Описание" type="textarea" rows={3} hint="Одно предложение: что это, для кого и какую задачу решает" value={v('description', data.item?.description ?? '')} error={form?.errors?.description} />
	<Field name="url" label="Ссылка на проект" type="url" hint="Необязательно. Без ссылки карточка не кликабельна" value={v('url', data.item?.url ?? '')} error={form?.errors?.url} />
	<Field name="tags" label="Теги" hint="Через запятую" value={v('tags', data.item?.tags.join(', ') ?? '')} error={form?.errors?.tags} />

	<fieldset class="flex flex-col gap-2">
		<legend class="text-sm font-semibold text-ink-nav">Скриншот</legend>
		{#if current}
			<img src={current} alt="Текущий скриншот" class="max-h-64 w-full rounded-xl object-cover" style="max-width: 480px" />
		{/if}
		<input id="field-image" name="image" type="file" accept="image/jpeg,image/png,image/webp" onchange={onFile} class="admin-input" aria-describedby="field-image-hint" />
		<p id="field-image-hint" class="text-xs text-ink-muted">JPEG, PNG или WebP до 5 МБ. Сохраняется в WebP шириной до 1600px.</p>
		{#if form?.errors?.image}<p class="text-sm font-semibold text-violet-800">{form.errors.image}</p>{/if}
		{#if data.item?.image}
			<label class="flex min-h-11 items-center gap-2 text-sm text-ink-body">
				<input type="checkbox" name="removeImage" /> Удалить картинку
			</label>
		{/if}
	</fieldset>

	<label class="flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-nav">
		<input type="checkbox" name="published" checked={published} /> Опубликован
	</label>

	<SaveBar saved={!!form?.saved} label={data.item ? 'Сохранить' : 'Добавить'} />
</form>
```

- [ ] **Step 4: Написать e2e-тест** — `e2e/projects.test.ts`:

```ts
import { expect, test } from '@playwright/test';
import sharp from 'sharp';
import { login } from './helpers';

test('загрузка скриншота проекта видна на главной', async ({ page }) => {
	const png = await sharp({ create: { width: 1200, height: 800, channels: 3, background: '#6D28D9' } }).png().toBuffer();

	await login(page);
	await page.goto('/admin/projects');
	await page.getByRole('link', { name: 'Изменить' }).first().click();
	await page.getByLabel('Название').fill('Портфолио behappii');
	await page.locator('#field-image').setInputFiles({ name: 'shot.png', mimeType: 'image/png', buffer: png });
	await page.getByRole('button', { name: 'Сохранить' }).click();
	await expect(page.getByRole('status')).toHaveText('Сохранено');

	await page.goto('/');
	const img = page.getByRole('img', { name: 'Скриншот проекта «Портфолио behappii»' });
	await expect(img).toBeAttached();
	const src = await img.getAttribute('src');
	expect(src).toMatch(/^\/uploads\/[a-z0-9-]+\.webp$/);
	const res = await page.request.get(src!);
	expect(res.headers()['content-type']).toBe('image/webp');
});

test('не-картинка отклоняется с ошибкой у поля', async ({ page }) => {
	await login(page);
	await page.goto('/admin/projects/new');
	await page.getByLabel('Название').fill('Тест');
	await page.getByLabel('Платформа').fill('Веб');
	await page.getByLabel('Год').fill('2026');
	await page.getByLabel('Описание').fill('Проверка.');
	await page.locator('#field-image').setInputFiles({ name: 'x.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
	await page.getByRole('button', { name: 'Добавить' }).click();
	await expect(page.getByText('Файл не похож на картинку')).toBeVisible();
	await expect(page.getByLabel('Название')).toHaveValue('Тест');
});

test('снятый с публикации проект пропадает с главной', async ({ page }) => {
	await login(page);
	await page.goto('/admin/projects/new');
	await page.getByLabel('Название').fill('Секретный');
	await page.getByLabel('Платформа').fill('Веб');
	await page.getByLabel('Год').fill('2026');
	await page.getByLabel('Описание').fill('Черновик.');
	await page.getByLabel('Опубликован').uncheck();
	await page.getByRole('button', { name: 'Добавить' }).click();
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Секретный' })).toHaveCount(0);
});
```

- [ ] **Step 5: Запустить e2e**

Run: `pnpm test:e2e`
Expected: PASS.

- [ ] **Step 6: Проверки и коммит**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: edit projects with screenshot upload in admin

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 18: Админка — бэкапы

**Files:**
- Create: `src/routes/admin/backup/+page.server.ts`, `src/routes/admin/backup/+page.svelte`, `src/routes/admin/backup/export/+server.ts`, `src/routes/admin/backup/files/[name]/+server.ts`
- Test: `e2e/backup.test.ts`

**Interfaces:**
- Consumes: `writeBackupArchive`, `createAutoBackup`, `listBackups`, `importBackup`, `BackupError`, `BACKUP_NAME` (Task 10), `getDb`, `initDb`, `closeDb` (Task 3), `dataDir()` (Task 1).
- Produces: `GET /admin/backup/export` (zip), `GET /admin/backup/files/<name>` (zip), действия `?/snapshot`, `?/import`, `?/restore`.

- [ ] **Step 1: Экспорт** — `src/routes/admin/backup/export/+server.ts`:

```ts
import { randomUUID } from 'node:crypto';
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { writeBackupArchive } from '$lib/server/backup';
import { dataDir } from '$lib/server/config';
import { getDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const file = path.join(dataDir(), 'tmp', `export-${randomUUID()}.zip`);
	try {
		await writeBackupArchive(getDb(), dataDir(), file);
		const body = await readFile(file);
		const date = new Date().toISOString().slice(0, 10);
		return new Response(body, {
			headers: {
				'content-type': 'application/zip',
				'content-disposition': `attachment; filename="portfolio-backup-${date}.zip"`
			}
		});
	} finally {
		await rm(file, { force: true });
	}
};
```

- [ ] **Step 2: Скачивание автобэкапа** — `src/routes/admin/backup/files/[name]/+server.ts`:

```ts
import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { BACKUP_NAME } from '$lib/server/backup';
import { dataDir } from '$lib/server/config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	if (!BACKUP_NAME.test(params.name)) error(404, 'Не найдено');
	try {
		const body = await readFile(path.join(dataDir(), 'backups', params.name));
		return new Response(body, {
			headers: {
				'content-type': 'application/zip',
				'content-disposition': `attachment; filename="${params.name}"`
			}
		});
	} catch {
		error(404, 'Не найдено');
	}
};
```

- [ ] **Step 3: Действия** — `src/routes/admin/backup/+page.server.ts`:

```ts
import { fail } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BACKUP_NAME, BackupError, createAutoBackup, importBackup, listBackups } from '$lib/server/backup';
import { dataDir } from '$lib/server/config';
import { closeDb, getDb, initDb } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;

export const load: PageServerLoad = async () => ({ backups: await listBackups(dataDir()) });

async function runImport(archive: string, sessionToken: string | null) {
	try {
		await importBackup(archive, dataDir(), { db: getDb(), close: closeDb, open: initDb, keepSessionToken: sessionToken });
		return { message: 'Данные восстановлены из архива' };
	} catch (e) {
		if (e instanceof BackupError) return fail(400, { error: e.message });
		throw e;
	}
}

export const actions: Actions = {
	snapshot: async () => {
		await createAutoBackup(getDb(), dataDir());
		return { message: 'Бэкап создан' };
	},

	import: async ({ request, locals }) => {
		const file = (await request.formData()).get('archive');
		if (!(file instanceof File) || file.size === 0) return fail(400, { error: 'Выберите zip-архив' });
		if (file.size > MAX_ARCHIVE_BYTES) return fail(400, { error: 'Архив больше 100 МБ' });

		const tmp = path.join(dataDir(), 'tmp', `upload-${randomUUID()}.zip`);
		await mkdir(path.dirname(tmp), { recursive: true });
		await writeFile(tmp, Buffer.from(await file.arrayBuffer()));
		try {
			return await runImport(tmp, locals.sessionToken);
		} finally {
			await rm(tmp, { force: true });
		}
	},

	restore: async ({ request, locals }) => {
		const name = String((await request.formData()).get('name') ?? '');
		if (!BACKUP_NAME.test(name)) return fail(400, { error: 'Нет такого бэкапа' });
		return runImport(path.join(dataDir(), 'backups', name), locals.sessionToken);
	}
};
```

- [ ] **Step 4: Страница** — `src/routes/admin/backup/+page.svelte`:

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const fmtSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
	const fmtDate = (d: Date) => new Date(d).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<svelte:head><title>Бэкапы — админка</title></svelte:head>

<h1 class="admin-h1">Бэкапы</h1>

{#if form?.message}<p role="status" class="admin-panel font-semibold text-violet-700">{form.message}</p>{/if}
{#if form?.error}<p role="alert" class="admin-panel font-semibold text-violet-800">{form.error}</p>{/if}

<section class="admin-panel flex flex-col gap-3">
	<h2 class="admin-h2">Экспорт</h2>
	<p class="text-sm text-ink-body">Архив с базой и всеми картинками. Его же можно загрузить ниже, чтобы вернуть сайт в это состояние.</p>
	<div><a href="/admin/backup/export" class="va-btn va-btn-md va-btn-violet" download>Скачать архив</a></div>
</section>

<section class="admin-panel flex flex-col gap-3">
	<h2 class="admin-h2">Импорт</h2>
	<p class="text-sm text-ink-body">Заменит весь контент и картинки содержимым архива. Перед заменой текущее состояние сохраняется в автобэкап.</p>
	<form method="POST" action="?/import" enctype="multipart/form-data" use:enhance class="flex flex-wrap items-center gap-3">
		<label class="sr-only" for="archive">Архив</label>
		<input id="archive" name="archive" type="file" accept=".zip,application/zip" required class="admin-input max-w-md" />
		<button type="submit" class="va-btn va-btn-md va-btn-violet">Импортировать</button>
	</form>
</section>

<section class="admin-panel flex flex-col gap-3">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h2 class="admin-h2">Автобэкапы</h2>
		<form method="POST" action="?/snapshot" use:enhance>
			<button type="submit" class="va-btn va-btn-md va-btn-pearl">Сделать бэкап сейчас</button>
		</form>
	</div>
	<p class="text-sm text-ink-body">Хранятся 10 последних.</p>
	{#if data.backups.length === 0}
		<p class="text-sm text-ink-muted">Пока нет ни одного.</p>
	{:else}
		<ul class="flex flex-col gap-2">
			{#each data.backups as b (b.name)}
				<li class="flex flex-wrap items-center gap-3">
					<span class="flex-1 text-sm text-ink-body">{fmtDate(b.createdAt)} · {fmtSize(b.size)}</span>
					<a href="/admin/backup/files/{b.name}" class="va-btn va-btn-md va-btn-pearl" download>Скачать</a>
					<details class="relative">
						<summary class="va-btn va-btn-md va-btn-pearl list-none">Восстановить</summary>
						<form method="POST" action="?/restore" use:enhance class="admin-panel absolute right-0 z-10 mt-2 flex w-72 flex-col gap-3">
							<input type="hidden" name="name" value={b.name} />
							<p class="text-sm text-ink-body">Заменить текущий контент этим бэкапом?</p>
							<button type="submit" class="va-btn va-btn-md va-btn-violet">Да, восстановить</button>
						</form>
					</details>
				</li>
			{/each}
		</ul>
	{/if}
</section>
```

- [ ] **Step 5: Написать e2e-тест** — `e2e/backup.test.ts`:

```ts
import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { login } from './helpers';

test('экспорт, правка, импорт возвращает прежний текст', async ({ page }) => {
	await login(page);
	await page.goto('/admin/backup');
	const download = page.waitForEvent('download');
	await page.getByRole('link', { name: 'Скачать архив' }).click();
	const archive = await readFile(await (await download).path());

	await page.goto('/admin/settings');
	const before = await page.getByLabel('Город').inputValue();
	await page.getByLabel('Город').fill('Временный город');
	await page.getByRole('button', { name: 'Сохранить' }).click();
	await expect(page.getByRole('status')).toHaveText('Сохранено');

	await page.goto('/admin/backup');
	await page.getByLabel('Архив').setInputFiles({ name: 'backup.zip', mimeType: 'application/zip', buffer: archive });
	await page.getByRole('button', { name: 'Импортировать' }).click();
	await expect(page.getByRole('status')).toHaveText('Данные восстановлены из архива');
	await expect(page.getByText(/МБ/).first()).toBeVisible();

	await page.goto('/admin/settings');
	await expect(page.getByLabel('Город')).toHaveValue(before);
});

test('не-архив отклоняется', async ({ page }) => {
	await login(page);
	await page.goto('/admin/backup');
	await page.getByLabel('Архив').setInputFiles({ name: 'x.zip', mimeType: 'application/zip', buffer: Buffer.from('nope') });
	await page.getByRole('button', { name: 'Импортировать' }).click();
	await expect(page.getByRole('alert')).toHaveText('Файл не похож на zip-архив');
});
```

Второй вход после импорта не нужен: текущая сессия переносится в новую базу (Task 10).

- [ ] **Step 6: Запустить e2e**

Run: `pnpm test:e2e`
Expected: PASS.

- [ ] **Step 7: Проверки и коммит**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test`

```bash
git add -A
git commit -m "feat: backup export, import and restore in admin

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 19: Docker, развёртывание и README

**Files:**
- Create: `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `.env.example`, `Caddyfile.example`
- Modify: `README.md`

**Interfaces:**
- Consumes: `pnpm build` (adapter-node → `build/`), `drizzle/`, переменные из Global Constraints.
- Produces: образ, который слушает `:3000`, хранит всё в томе `/data`.

- [ ] **Step 1: `.dockerignore`**

```
node_modules
.svelte-kit
build
data
e2e
test-results
playwright-report
docs
.git
.env
.env.*
!.env.example
```

- [ ] **Step 2: `Dockerfile`**

```dockerfile
FROM node:24-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/data \
    MIGRATIONS_DIR=/app/drizzle \
    BODY_SIZE_LIMIT=100M
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/drizzle ./drizzle
RUN mkdir -p /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3000
CMD ["node", "build"]
```

- [ ] **Step 3: `docker-compose.yml`**

```yaml
services:
  web:
    build: .
    restart: unless-stopped
    env_file: .env
    environment:
      DATA_DIR: /data
      BODY_SIZE_LIMIT: 100M
    ports:
      - '127.0.0.1:3000:3000'
    volumes:
      - portfolio-data:/data

volumes:
  portfolio-data:
```

- [ ] **Step 4: `.env.example`**

```
# Адрес сайта — нужен SvelteKit для проверки origin у форм
ORIGIN=https://behappii.ru

# Хеш пароля админки: pnpm hash-password
ADMIN_PASSWORD_HASH=''

# За обратным прокси: откуда брать IP клиента для ограничения попыток входа
ADDRESS_HEADER=X-Forwarded-For
XFF_DEPTH=1
```

- [ ] **Step 5: `Caddyfile.example`**

```
behappii.ru {
	encode zstd gzip
	reverse_proxy 127.0.0.1:3000
}
```

- [ ] **Step 6: Проверить сборку образа**

```bash
docker compose build
printf "ORIGIN=http://localhost:3000\nADMIN_PASSWORD_HASH='%s'\n" "$(node -e "require('@node-rs/argon2').hash('docker-test-password').then(console.log)")" > .env
docker compose up -d
sleep 5
curl -s http://localhost:3000/ | grep -o '<title>[^<]*</title>'
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/admin
docker compose exec web ls /data
docker compose down
rm .env
```

Expected: `<title>behappii — веб-разработчик Степан</title>`, `303`, в `/data` есть `portfolio.db`. Если команда `sleep` недоступна в окружении, вместо неё повторять `curl` до ответа.

- [ ] **Step 7: README** — заменить содержимое `README.md`:

````markdown
# behappii.ru

Сайт-портфолио на SvelteKit с админкой для редактирования контента. Дизайн — `docs/design/`, спецификация — `docs/superpowers/specs/`.

## Разработка

```sh
pnpm install
pnpm hash-password            # скопируйте строку в .env
pnpm dev                      # http://localhost:5173, админка — /admin
```

База и картинки лежат в `./data` (переменная `DATA_DIR`). При первом запуске база заполняется текстами из макета.

| Команда | Что делает |
| --- | --- |
| `pnpm test` | модульные тесты (Vitest) |
| `pnpm test:e2e` | сквозные тесты (Playwright, сам собирает и поднимает сайт) |
| `pnpm check`, `pnpm lint` | типы и стиль |
| `pnpm db:generate --name <имя>` | миграция после правки `src/lib/server/db/schema.ts`; затем поднимите `SCHEMA_VERSION` в `client.ts` |

## Развёртывание на VPS

1. Скопируйте репозиторий на сервер, создайте `.env` по образцу `.env.example`.
2. `docker compose up -d --build` — сайт слушает `127.0.0.1:3000`.
3. Настройте HTTPS через обратный прокси, например Caddy: `Caddyfile.example`.

Обновление: `git pull && docker compose up -d --build`. Миграции применяются при старте.

## Бэкапы

- В админке → «Бэкапы»: скачать архив, загрузить архив, восстановить один из 10 автобэкапов.
- С сервера: `docker compose cp web:/data ./data-backup` копирует базу, картинки и автобэкапы.
````

- [ ] **Step 8: Финальная проверка**

Run: `pnpm format && pnpm check && pnpm lint && pnpm test && pnpm test:e2e`
Expected: всё зелёное.

- [ ] **Step 9: Коммит**

```bash
git add -A
git commit -m "chore: add docker setup and deployment docs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
