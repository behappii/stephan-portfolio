<script lang="ts">
	import type { Snippet } from 'svelte';
	import Eyebrow from './Eyebrow.svelte';

	let {
		id,
		eyebrow,
		title,
		tone = 'sky',
		subtitle,
		aside
	}: {
		id: string;
		eyebrow: string;
		title: string;
		tone?: 'sky' | 'dusk';
		subtitle?: string;
		aside?: Snippet;
	} = $props();
</script>

<div class="va-section-head">
	<div class="va-section-head-main">
		<Eyebrow {tone}>{eyebrow}</Eyebrow>
		<h2 {id} class="va-section-title">{title}</h2>
		{#if subtitle}<p class="va-section-subtitle">{subtitle}</p>{/if}
	</div>
	{@render aside?.()}
</div>
