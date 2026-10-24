import { randomUUID } from 'node:crypto';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp, { type Metadata } from 'sharp';
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
	let meta: Metadata;
	try {
		meta = await sharp(input).metadata();
	} catch {
		throw new UploadError('Файл не похож на картинку');
	}
	const format = meta.format;
	const pixels = (meta.width ?? 0) * (meta.height ?? 0);
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
