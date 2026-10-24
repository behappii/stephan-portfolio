<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '#lib/admin/Field.svelte';
	import IconPicker from '#lib/admin/IconPicker.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import type { StackIcon } from '#lib/icons.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const v = (key: 'title' | 'description' | 'tags' | 'icon', fallback: string) =>
		form?.values?.[key] ?? fallback;
</script>

<svelte:head><title>{data.item ? 'Карточка стека' : 'Новая карточка'} — админка</title></svelte:head
>

<a href="/admin/stack" class="text-sm font-semibold">← Ко всем карточкам</a>
<h1 class="admin-h1">{data.item ? data.item.title : 'Новая карточка'}</h1>

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
		rows={3}
		value={v('description', data.item?.description ?? '')}
		error={form?.errors?.description}
	/>
	<IconPicker value={v('icon', data.item?.icon ?? 'web') as StackIcon} error={form?.errors?.icon} />
	<Field
		name="tags"
		label="Теги"
		hint="Через запятую: SvelteKit, Next.js"
		value={v('tags', data.item?.tags.join(', ') ?? '')}
		error={form?.errors?.tags}
	/>
	<SaveBar saved={!!form?.saved} label={data.item ? 'Сохранить' : 'Добавить'} />
</form>
