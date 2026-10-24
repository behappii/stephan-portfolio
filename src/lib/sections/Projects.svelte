<script lang="ts">
	import type { Project } from '#lib/server/db/schema.ts';
	import SectionHeader from '#lib/ui/SectionHeader.svelte';
	import Tag from '#lib/ui/Tag.svelte';
	import Tags from '#lib/ui/Tags.svelte';

	let {
		items,
		eyebrow,
		title,
		githubUrl
	}: { items: Project[]; eyebrow: string; title: string; githubUrl: string | null } = $props();
</script>

<section id="projects" class="story" aria-labelledby="projects-title" style="--n: {items.length}">
	<div class="story-inner">
		<SectionHeader id="projects-title" {eyebrow} {title}>
			{#snippet aside()}
				{#if githubUrl}
					<a href={githubUrl} class="github-link" target="_blank" rel="noopener"
						>Все проекты на GitHub →</a
					>
				{/if}
			{/snippet}
		</SectionHeader>
		<div class="story-track">
			{#each items as p, i (p.id)}
				<svelte:element
					this={p.url ? 'a' : 'article'}
					href={p.url ?? undefined}
					target={p.url ? '_blank' : undefined}
					rel={p.url ? 'noopener' : undefined}
					class="story-card va-glass va-glass-2xl va-glass-pad-sm va-glass-lift va-project"
					style="--i: {i}"
				>
					<div class="va-well">
						{#if p.image}
							<img src="/uploads/{p.image}" alt="Скриншот проекта «{p.title}»" loading="lazy" />
						{:else}
							<span class="va-well-empty">{p.title}</span>
						{/if}
						<Tag tone="violet">{p.category}</Tag>
					</div>
					<div class="va-project-body">
						<div class="va-project-head">
							<h3 class="va-project-title">{p.title}</h3>
							<span class="va-project-year">{p.year}</span>
						</div>
						<p class="va-project-text">{p.description}</p>
						<Tags items={p.tags} />
					</div>
				</svelte:element>
			{/each}
		</div>
	</div>
</section>

<style>
	.github-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-weight: 700;
	}
	:global(a.va-project) {
		color: inherit;
	}
</style>
