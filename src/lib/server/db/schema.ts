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
