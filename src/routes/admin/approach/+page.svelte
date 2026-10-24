<script lang="ts">
	import ItemList from '#lib/admin/ItemList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Подход — админка</title></svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4">
	<h1 class="admin-h1">Подход</h1>
	<a href="/admin/approach/new" class="va-btn va-btn-md va-btn-violet">Добавить этап</a>
</div>
<ItemList
	base="/admin/approach"
	items={data.items.map((s, i) => ({
		id: s.id,
		title: `${i + 1}. ${s.title}`,
		meta: s.tags.join(' · ')
	}))}
/>
