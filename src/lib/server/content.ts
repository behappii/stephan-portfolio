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
