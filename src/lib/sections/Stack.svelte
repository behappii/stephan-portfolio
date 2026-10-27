<script lang="ts">
	import type { StackItem } from '#lib/server/db/schema.ts';
	import IconTile from '#lib/ui/IconTile.svelte';
	import SectionHeader from '#lib/ui/SectionHeader.svelte';
	import Tags from '#lib/ui/Tags.svelte';
	import { tilt } from '#lib/ui/tilt.ts';

	let {
		items,
		eyebrow,
		title,
		subtitle
	}: { items: StackItem[]; eyebrow: string; title: string; subtitle: string } = $props();

	// Бенто на три колонки: первая карточка крупная на две строки, рядом с ней сетка 2×2,
	// дальше ряды по три. Последняя карточка неполного ряда растягивается до края.
	const rest = $derived(items.length - 1);
	const bigRows = $derived(Math.max(1, Math.ceil(Math.min(rest, 4) / 2)));
	const lastSpanWide = $derived.by(() => {
		if (rest <= 4) return rest % 2 ? 2 : 1;
		return [1, 3, 2][(rest - 4) % 3];
	});
	// На планшете две колонки: крупная карточка во всю ширину, остальные парами.
	const lastSpanMid = $derived(rest % 2 ? 2 : 1);
</script>

<section id="stack" aria-labelledby="stack-title">
	<div class="story-inner">
		<SectionHeader id="stack-title" {eyebrow} {title} {subtitle} />
		<div class="bento" style="--big-rows: {bigRows}">
			{#each items as item, i (item.id)}
				<article
					{@attach tilt}
					class="stack-card va-glass va-glass-xl va-glass-pad-md va-hover va-card-col"
					class:stack-card-big={i === 0}
					class:stack-card-solo={items.length === 1}
					class:stack-card-last={i > 0 && i === items.length - 1}
					style:--span-wide={lastSpanWide}
					style:--span-mid={lastSpanMid}
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

<style>
	.bento {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 18px;
	}
	.stack-card-big {
		background:
			radial-gradient(ellipse 90% 60% at 75% 0%, rgba(167, 139, 250, 0.45), transparent 70%),
			linear-gradient(180deg, var(--glass), var(--glass-fade));
	}

	@media (min-width: 700px) {
		.bento {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.stack-card-big {
			grid-column: 1 / -1;
		}
		.stack-card-last {
			grid-column: span var(--span-mid);
		}
	}
	@media (min-width: 1100px) {
		.bento {
			grid-template-columns: minmax(0, 1.3fr) repeat(2, minmax(0, 1fr));
		}
		.stack-card-big {
			grid-column: auto;
			grid-row: span var(--big-rows);
			padding: 36px;
		}
		.stack-card-last {
			grid-column: span var(--span-wide);
		}
		.stack-card-solo {
			grid-column: 1 / -1;
		}
		/* Иконка сверху, текст и теги прижаты к низу крупной карточки. */
		.stack-card-big :global(.va-icon-tile) {
			width: 84px;
			height: 84px;
			border-radius: 24px;
			margin-bottom: auto;
		}
		.stack-card-big :global(.va-icon-tile > svg) {
			width: 40px;
			height: 40px;
		}
		.stack-card-big :global(.va-card-title) {
			font-size: 36px;
			line-height: 1.1;
		}
		.stack-card-big :global(.va-card-text) {
			font-size: 18px;
			max-width: 420px;
		}
		/* Теги крупной карточки идут сразу за текстом, а не прижимаются к низу. */
		.stack-card-big :global(.va-tags) {
			margin-top: 0;
		}
	}
</style>
