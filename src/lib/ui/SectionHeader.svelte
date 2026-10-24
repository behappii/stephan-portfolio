<script lang="ts">
	import type { Snippet } from 'svelte';
	import Eyebrow from './Eyebrow.svelte';

	let {
		id,
		eyebrow,
		title,
		tone = 'sky',
		aside
	}: {
		id: string;
		eyebrow: string;
		title: string;
		tone?: 'sky' | 'dusk';
		aside?: Snippet;
	} = $props();
</script>

<div class="va-section-head">
	<div class="va-section-head-main">
		<Eyebrow {tone}>{eyebrow}</Eyebrow>
		<h2 {id} class="va-section-title">{title}</h2>
	</div>
	{@render aside?.()}
</div>
