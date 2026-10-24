<script lang="ts">
	import Approach from '#lib/sections/Approach.svelte';
	import Hero from '#lib/sections/Hero.svelte';
	import Projects from '#lib/sections/Projects.svelte';
	import Stack from '#lib/sections/Stack.svelte';
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
	{#if c.eyebrows.stack}
		<Stack
			items={c.stack}
			eyebrow={c.eyebrows.stack}
			title={c.settings.stackTitle}
			subtitle={c.settings.stackSubtitle}
		/>
	{/if}
	{#if c.eyebrows.projects}
		<Projects
			items={c.projects}
			eyebrow={c.eyebrows.projects}
			title={c.settings.projectsTitle}
			githubUrl={c.githubUrl}
		/>
	{/if}
	{#if c.eyebrows.approach}
		<Approach items={c.approach} eyebrow={c.eyebrows.approach} title={c.settings.approachTitle} />
	{/if}
</div>

<style>
	.page {
		min-height: 100vh;
		color: var(--ink);
		overflow-x: clip;
	}
</style>
