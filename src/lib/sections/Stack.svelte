<script lang="ts">
	import type { StackItem } from '#lib/server/db/schema.ts';
	import IconTile from '#lib/ui/IconTile.svelte';
	import SectionHeader from '#lib/ui/SectionHeader.svelte';
	import Tags from '#lib/ui/Tags.svelte';

	let {
		items,
		eyebrow,
		title,
		subtitle
	}: { items: StackItem[]; eyebrow: string; title: string; subtitle: string } = $props();
</script>

<section id="stack" class="story" aria-labelledby="stack-title" style="--n: {items.length}">
	<div class="story-inner">
		<SectionHeader id="stack-title" {eyebrow} {title}>
			{#snippet aside()}
				{#if subtitle}<p class="va-section-aside">{subtitle}</p>{/if}
			{/snippet}
		</SectionHeader>
		<div class="story-track">
			{#each items as item, i (item.id)}
				<article
					class="story-card va-glass va-glass-xl va-glass-pad-md va-glass-lift va-card-col"
					style="--i: {i}"
				>
					<IconTile icon={item.icon} />
					<h3 class="va-card-title">{item.title}</h3>
					<p class="va-card-text">{item.description}</p>
					<Tags items={item.tags} />
				</article>
			{/each}
		</div>
	</div>
</section>
