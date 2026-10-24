<script lang="ts">
	import ItemList from '#lib/admin/ItemList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Ссылки — админка</title></svelte:head>

<div class="flex flex-wrap items-center justify-between gap-4">
	<h1 class="admin-h1">Ссылки</h1>
	<a href="/admin/links/new" class="va-btn va-btn-md va-btn-violet">Добавить ссылку</a>
</div>
<p class="text-sm text-ink-body">
	Ссылка с названием GitHub ещё и выводится как «Все проекты на GitHub» в разделе проектов.
</p>
<ItemList
	base="/admin/links"
	items={data.items.map((l) => ({ id: l.id, title: l.label, meta: l.url }))}
/>
