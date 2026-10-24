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

export function parseForm<S extends z.ZodType>(
	schema: S,
	form: FormData
): ParseResult<z.output<S>> {
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
