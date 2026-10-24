<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '#lib/admin/Field.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const v = (key: 'title' | 'description' | 'tags', fallback: string) =>
		form?.values?.[key] ?? fallback;
</script>

<svelte:head><title>{data.item ? 'Этап' : 'Новый этап'} — админка</title></svelte:head>

<a href="/admin/approach" class="text-sm font-semibold">← Ко всем этапам</a>
<h1 class="admin-h1">{data.item ? data.item.title : 'Новый этап'}</h1>

<form
	method="POST"
	use:enhance={() =>
		async ({ update }) =>
			update({ reset: false })}
	class="admin-panel flex flex-col gap-4"
>
	<Field
		name="title"
		label="Название"
		value={v('title', data.item?.title ?? '')}
		error={form?.errors?.title}
	/>
	<Field
		name="description"
		label="Описание"
		type="textarea"
		value={v('description', data.item?.description ?? '')}
		error={form?.errors?.description}
	/>
	<Field
		name="tags"
		label="Технологии"
		hint="Через запятую; на сайте выводятся через «·»"
		value={v('tags', data.item?.tags.join(', ') ?? '')}
		error={form?.errors?.tags}
	/>
	<SaveBar saved={!!form?.saved} label={data.item ? 'Сохранить' : 'Добавить'} />
</form>
