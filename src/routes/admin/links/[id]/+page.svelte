<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '#lib/admin/Field.svelte';
	import SaveBar from '#lib/admin/SaveBar.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const v = (key: 'label' | 'url', fallback: string) => form?.values?.[key] ?? fallback;
</script>

<svelte:head><title>{data.item ? 'Ссылка' : 'Новая ссылка'} — админка</title></svelte:head>

<a href="/admin/links" class="text-sm font-semibold">← Ко всем ссылкам</a>
<h1 class="admin-h1">{data.item ? data.item.label : 'Новая ссылка'}</h1>

<form
	method="POST"
	use:enhance={() =>
		async ({ update }) =>
			update({ reset: false })}
	class="admin-panel flex flex-col gap-4"
>
	<Field
		name="label"
		label="Название"
		value={v('label', data.item?.label ?? '')}
		error={form?.errors?.label}
	/>
	<Field
		name="url"
		label="Адрес"
		type="url"
		value={v('url', data.item?.url ?? '')}
		error={form?.errors?.url}
	/>
	<SaveBar saved={!!form?.saved} label={data.item ? 'Сохранить' : 'Добавить'} />
</form>
