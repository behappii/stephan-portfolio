<script lang="ts">
	import Tag from './Tag.svelte';
	let { items, class: className = '' }: { items: string[]; class?: string } = $props();
</script>

{#if items.length}
	<div class="va-tags {className}">
		{#each items as item (item)}<Tag>{item}</Tag>{/each}
	</div>
{/if}
