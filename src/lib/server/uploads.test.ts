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
	return new File([new Uint8Array(buf)], name, { type: 'image/png' });
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
