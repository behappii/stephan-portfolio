<script lang="ts">
	import Hero from '#lib/sections/Hero.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.content);
</script>

<svelte:head>
	<title>{c.settings.seoTitle}</title>
	<meta name="description" content={c.settings.seoDescription} />
</svelte:head>

<div id="top" class="va-sky page">
	<Hero settings={c.settings} nav={c.nav} hasProjects={c.projects.length > 0} />
</div>

<style>
	.page {
		min-height: 100vh;
		color: var(--ink);
		overflow-x: clip;
	}
</style>
