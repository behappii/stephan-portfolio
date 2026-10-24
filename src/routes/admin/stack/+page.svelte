<script lang="ts">
	import ItemList from '#lib/admin/ItemList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Стек — админка</title></svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4">
	<h1 class="admin-h1">Стек</h1>
	<a href="/admin/stack/new" class="va-btn va-btn-md va-btn-violet">Добавить карточку</a>
</div>
<ItemList
	base="/admin/stack"
	items={data.items.map((i) => ({ id: i.id, title: i.title, meta: i.tags.join(', ') }))}
/>
