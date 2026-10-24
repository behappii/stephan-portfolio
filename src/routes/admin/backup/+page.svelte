<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const fmtSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
	const fmtDate = (d: Date) =>
		new Date(d).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<svelte:head><title>Бэкапы — админка</title></svelte:head>

<h1 class="admin-h1">Бэкапы</h1>

{#if form?.message}<p role="status" class="admin-panel font-semibold text-violet-700">
		{form.message}
	</p>{/if}
{#if form?.error}<p role="alert" class="admin-panel font-semibold text-violet-800">
		{form.error}
	</p>{/if}

<section class="admin-panel flex flex-col gap-3">
	<h2 class="admin-h2">Экспорт</h2>
	<p class="text-sm text-ink-body">
		Архив с базой и всеми картинками. Его же можно загрузить ниже, чтобы вернуть сайт в это
		состояние.
	</p>
	<div>
		<a href="/admin/backup/export" class="va-btn va-btn-md va-btn-violet" download>Скачать архив</a>
	</div>
</section>

<section class="admin-panel flex flex-col gap-3">
	<h2 class="admin-h2">Импорт</h2>
	<p class="text-sm text-ink-body">
		Заменит весь контент и картинки содержимым архива. Перед заменой текущее состояние сохраняется в
		автобэкап.
	</p>
	<form
		method="POST"
		action="?/import"
		enctype="multipart/form-data"
		use:enhance
		class="flex flex-wrap items-center gap-3"
	>
		<label class="sr-only" for="archive">Архив</label>
		<input
			id="archive"
			name="archive"
			type="file"
			accept=".zip,application/zip"
			required
			class="admin-input max-w-md"
		/>
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
					<span class="flex-1 text-sm text-ink-body"
						>{fmtDate(b.createdAt)} · {fmtSize(b.size)}</span
					>
					<a href="/admin/backup/files/{b.name}" class="va-btn va-btn-md va-btn-pearl" download
						>Скачать</a
					>
					<details class="relative">
						<summary class="va-btn va-btn-md va-btn-pearl list-none">Восстановить</summary>
						<form
							method="POST"
							action="?/restore"
							use:enhance
							class="admin-panel absolute right-0 z-10 mt-2 flex w-72 flex-col gap-3"
						>
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
