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
	db
		.insert(stackItems)
		.values({ ...data, sort: nextSort(db, stackItems) })
		.returning({ id: stackItems.id })
		.get().id;
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
	db
		.insert(projects)
		.values({ ...data, sort: nextSort(db, projects) })
		.returning({ id: projects.id })
		.get().id;
export const updateProject = (db: Db, id: number, data: ProjectData): void => {
	db.update(projects).set(data).where(eq(projects.id, id)).run();
};
export const deleteProject = (db: Db, id: number): string | null =>
	db.delete(projects).where(eq(projects.id, id)).returning({ image: projects.image }).get()
		?.image ?? null;

// Этапы
export const listApproachSteps = (db: Db) =>
	db.select().from(approachSteps).orderBy(asc(approachSteps.sort), asc(approachSteps.id)).all();
export const getApproachStep = (db: Db, id: number) =>
	db.select().from(approachSteps).where(eq(approachSteps.id, id)).get();
export const createApproachStep = (db: Db, data: ApproachStepInput): number =>
	db
		.insert(approachSteps)
		.values({ ...data, sort: nextSort(db, approachSteps) })
		.returning({ id: approachSteps.id })
		.get().id;
export const updateApproachStep = (db: Db, id: number, data: ApproachStepInput): void => {
	db.update(approachSteps).set(data).where(eq(approachSteps.id, id)).run();
};
export const deleteApproachStep = (db: Db, id: number): void => {
	db.delete(approachSteps).where(eq(approachSteps.id, id)).run();
};

// Ссылки
export const listLinks = (db: Db) =>
	db.select().from(links).orderBy(asc(links.sort), asc(links.id)).all();
export const getLink = (db: Db, id: number) =>
	db.select().from(links).where(eq(links.id, id)).get();
export const createLink = (db: Db, data: LinkInput): number =>
	db
		.insert(links)
		.values({ ...data, sort: nextSort(db, links) })
		.returning({ id: links.id })
		.get().id;
export const updateLink = (db: Db, id: number, data: LinkInput): void => {
	db.update(links).set(data).where(eq(links.id, id)).run();
};
export const deleteLink = (db: Db, id: number): void => {
	db.delete(links).where(eq(links.id, id)).run();
};
