<script lang="ts">
	import type { ApproachStep } from '#lib/server/db/schema.ts';
	import Orb from '#lib/ui/Orb.svelte';
	import SectionHeader from '#lib/ui/SectionHeader.svelte';

	let { items, eyebrow, title }: { items: ApproachStep[]; eyebrow: string; title: string } =
		$props();
</script>

<section id="approach" class="story" aria-labelledby="approach-title" style="--n: {items.length}">
	<div class="story-inner">
		<SectionHeader id="approach-title" {eyebrow} {title} />
		<ol class="story-track">
			{#each items as step, i (step.id)}
				<li
					class="story-card va-glass va-glass-2xl va-glass-pad-lg va-glass-lift va-card-col"
					style="--i: {i}"
				>
					<Orb>{i + 1}</Orb>
					<h3 class="va-project-title">{step.title}</h3>
					<p class="va-project-text">{step.description}</p>
					{#if step.tags.length}<span class="step-tech">{step.tags.join(' · ')}</span>{/if}
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.step-tech {
		margin-top: auto;
		font-size: 14px;
		font-weight: 700;
		color: var(--violet-700);
	}
</style>
