<script lang="ts">
	import ItemList from '#lib/admin/ItemList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Проекты — админка</title></svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4">
	<h1 class="admin-h1">Проекты</h1>
	<a href="/admin/projects/new" class="va-btn va-btn-md va-btn-violet">Добавить проект</a>
</div>
<ItemList
	base="/admin/projects"
	items={data.items.map((p) => ({
		id: p.id,
		title: p.title,
		meta: [
			p.category,
			p.year,
			p.published ? null : 'не опубликован',
			p.image ? null : 'без скриншота'
		]
			.filter(Boolean)
			.join(' · ')
	}))}
/>
