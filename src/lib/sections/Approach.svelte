<script lang="ts">
	import type { ApproachStep } from '#lib/server/db/schema.ts';
	import Orb from '#lib/ui/Orb.svelte';
	import SectionHeader from '#lib/ui/SectionHeader.svelte';
	import { tilt } from '#lib/ui/tilt.ts';

	let { items, eyebrow, title }: { items: ApproachStep[]; eyebrow: string; title: string } =
		$props();
</script>

<section id="approach" aria-labelledby="approach-title">
	<div class="story-inner">
		<SectionHeader id="approach-title" {eyebrow} {title} />
		<ol class="zigzag">
			{#each items as step, i (step.id)}
				<li class="step va-hover-orb" class:step-right={i % 2 === 1}>
					<Orb>{i + 1}</Orb>
					<div
						{@attach tilt}
						class="step-card va-glass va-glass-2xl va-glass-pad-lg va-hover va-card-col"
					>
						<h3 class="va-project-title">{step.title}</h3>
						<p class="va-project-text">{step.description}</p>
						{#if step.tags.length}<span class="step-tech">{step.tags.join(' · ')}</span>{/if}
					</div>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	/* Линия идёт через центры шаров: на телефоне слева, на широком экране посередине. */
	.zigzag {
		--orb: 48px;
		position: relative;
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.zigzag::before {
		content: '';
		position: absolute;
		top: 24px;
		bottom: 24px;
		left: calc(var(--orb) / 2 - 1.5px);
		width: 3px;
		border-radius: 2px;
		background: linear-gradient(180deg, var(--lilac), var(--violet-gloss-mid));
	}
	.step {
		position: relative;
		display: grid;
		grid-template-columns: var(--orb) minmax(0, 1fr);
		align-items: start;
		gap: 16px;
	}
	.step :global(.va-orb) {
		z-index: 1;
		width: var(--orb);
		height: var(--orb);
		font-size: 22px;
		box-shadow: 0 0 0 6px var(--sky-100);
	}
	.step-card {
		padding: 24px 20px;
	}
	.step-tech {
		margin-top: auto;
		font-size: 14px;
		font-weight: 700;
		color: var(--violet-700);
	}

	@media (min-width: 760px) {
		.zigzag {
			--orb: 64px;
			gap: 0;
		}
		.zigzag::before {
			left: calc(50% - 1.5px);
		}
		.step {
			grid-template-columns: minmax(0, 1fr) var(--orb) minmax(0, 1fr);
			align-items: center;
			gap: 32px;
		}
		/* Соседние шаги стоят по разные стороны линии, поэтому могут заходить друг на друга по высоте. */
		.step + .step {
			margin-top: -48px;
		}
		.step :global(.va-orb) {
			grid-column: 2;
			grid-row: 1;
			font-size: 28px;
		}
		.step-card {
			grid-column: 1;
			grid-row: 1;
			padding: 32px;
		}
		.step-right .step-card {
			grid-column: 3;
		}
	}
</style>
