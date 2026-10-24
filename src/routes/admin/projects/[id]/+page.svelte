<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '#lib/admin/Field.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	type Key = 'title' | 'category' | 'year' | 'description' | 'url' | 'tags';
	const v = (key: Key, fallback: string) => form?.values?.[key] ?? fallback;
	const published = $derived(
		form?.values ? form.values.published === 'on' : (data.item?.published ?? true)
	);

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
	use:enhance={() =>
		async ({ update }) => {
			await update({ reset: false });
			preview = null;
		}}
	class="admin-panel flex flex-col gap-4"
>
	<Field
		name="title"
		label="Название"
		value={v('title', data.item?.title ?? '')}
		error={form?.errors?.title}
	/>
	<div class="grid gap-4 sm:grid-cols-2">
		<Field
			name="category"
			label="Платформа"
			hint="Бейдж на скриншоте: Веб, Мобайл, Десктоп"
			value={v('category', data.item?.category ?? '')}
			error={form?.errors?.category}
		/>
		<Field
			name="year"
			label="Год"
			value={v('year', data.item?.year ?? '')}
			error={form?.errors?.year}
		/>
	</div>
	<Field
		name="description"
		label="Описание"
		type="textarea"
		rows={3}
		hint="Одно предложение: что это, для кого и какую задачу решает"
		value={v('description', data.item?.description ?? '')}
		error={form?.errors?.description}
	/>
	<Field
		name="url"
		label="Ссылка на проект"
		type="url"
		hint="Необязательно. Без ссылки карточка не кликабельна"
		value={v('url', data.item?.url ?? '')}
		error={form?.errors?.url}
	/>
	<Field
		name="tags"
		label="Теги"
		hint="Через запятую"
		value={v('tags', data.item?.tags.join(', ') ?? '')}
		error={form?.errors?.tags}
	/>

	<fieldset class="flex flex-col gap-2">
		<legend class="text-sm font-semibold text-ink-nav">Скриншот</legend>
		{#if current}
			<img
				src={current}
				alt="Текущий скриншот"
				class="max-h-64 w-full rounded-xl object-cover"
				style="max-width: 480px"
			/>
		{/if}
		<input
			id="field-image"
			name="image"
			type="file"
			accept="image/jpeg,image/png,image/webp"
			onchange={onFile}
			class="admin-input"
			aria-label="Файл скриншота"
			aria-describedby="field-image-hint"
		/>
		<p id="field-image-hint" class="text-xs text-ink-muted">
			JPEG, PNG или WebP до 5 МБ. Сохраняется в WebP шириной до 1600px.
		</p>
		{#if form?.errors?.image}<p class="text-sm font-semibold text-violet-800">
				{form.errors.image}
			</p>{/if}
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
