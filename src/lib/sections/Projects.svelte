<script lang="ts">
	import { untrack } from 'svelte';
	import type { Project } from '#lib/server/db/schema.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import SectionHeader from '#lib/ui/SectionHeader.svelte';
	import Tag from '#lib/ui/Tag.svelte';
	import Tags from '#lib/ui/Tags.svelte';

	let {
		items,
		eyebrow,
		title,
		githubUrl
	}: { items: Project[]; eyebrow: string; title: string; githubUrl: string | null } = $props();

	let track: HTMLDivElement;
	// Отступы scrollLeft, на которых лента может остановиться: по одному на каждую карточку,
	// кроме тех, что уже видны в конце ленты.
	let positions = $state<number[]>([0]);
	let current = $state(0);

	function measure() {
		const max = track.scrollWidth - track.clientWidth;
		const first = (track.firstElementChild as HTMLElement | null)?.offsetLeft ?? 0;
		const stops = [...track.children].map((card) =>
			Math.min(Math.round((card as HTMLElement).offsetLeft - first), Math.round(max))
		);
		positions = stops.filter((x, i) => stops.indexOf(x) === i);
		onScroll();
	}

	function onScroll() {
		const x = track.scrollLeft;
		let nearest = 0;
		positions.forEach((p, i) => {
			if (Math.abs(p - x) < Math.abs(positions[nearest] - x)) nearest = i;
		});
		current = nearest;
	}

	function go(i: number) {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		track.scrollTo({ left: positions[i], behavior: reduce ? 'instant' : 'smooth' });
		current = i;
	}

	$effect(() => {
		untrack(measure);
		const ro = new ResizeObserver(measure);
		ro.observe(track);
		return () => ro.disconnect();
	});
</script>

{#snippet arrows(where: 'head' | 'foot')}
	{#if positions.length > 1}
		<div class="arrows arrows-{where}">
			<button
				type="button"
				class="arrow"
				aria-label="Предыдущий проект"
				disabled={current === 0}
				onclick={() => go(current - 1)}
			>
				<span class="arrow-flip"><Icon name="arrow-right" size={20} strokeWidth={2.4} /></span>
			</button>
			<button
				type="button"
				class="arrow"
				aria-label="Следующий проект"
				disabled={current === positions.length - 1}
				onclick={() => go(current + 1)}
			>
				<Icon name="arrow-right" size={20} strokeWidth={2.4} />
			</button>
		</div>
	{/if}
{/snippet}

<section id="projects" aria-labelledby="projects-title">
	<div class="story-inner">
		<SectionHeader id="projects-title" {eyebrow} {title}>
			{#snippet aside()}
				<div class="head-aside">
					{#if githubUrl}
						<a href={githubUrl} class="github-link" target="_blank" rel="noopener"
							>Все проекты на GitHub →</a
						>
					{/if}
					{@render arrows('head')}
				</div>
			{/snippet}
		</SectionHeader>
		<div class="carousel-wrap">
			<!-- Фокус на ленте, чтобы листать её клавишами-стрелками. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				bind:this={track}
				class="carousel"
				role="region"
				aria-roledescription="карусель"
				aria-label="Проекты"
				tabindex="0"
				onscroll={onScroll}
			>
				{#each items as p (p.id)}
					<svelte:element
						this={p.url ? 'a' : 'article'}
						href={p.url ?? undefined}
						target={p.url ? '_blank' : undefined}
						rel={p.url ? 'noopener' : undefined}
						class="carousel-card va-glass va-glass-2xl va-glass-pad-sm va-glass-lift va-project"
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
		{#if positions.length > 1}
			<div class="foot">
				<div class="dots">
					{#each positions as stop, i (stop)}
						<button
							type="button"
							class="dot"
							class:dot-on={i === current}
							aria-label="Позиция {i + 1} из {positions.length}"
							aria-current={i === current ? 'true' : undefined}
							onclick={() => go(i)}
						></button>
					{/each}
				</div>
				{@render arrows('foot')}
			</div>
		{/if}
	</div>
</section>

<style>
	.head-aside {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 24px;
	}
	.github-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-weight: 700;
	}
	:global(a.va-project) {
		color: inherit;
	}

	.carousel-wrap {
		/* Лента заходит на поля страницы, чтобы тени карточек и край следующей не обрезались. */
		margin: -16px -32px -24px;
	}
	.carousel {
		--per: 3;
		--gap: 24px;
		--peek: 56px;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: calc((100% - var(--peek) - (var(--per) - 1) * var(--gap)) / var(--per));
		gap: var(--gap);
		padding: 16px 32px 24px;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scroll-padding-inline: 32px;
		scrollbar-width: none;
	}
	.carousel::-webkit-scrollbar {
		display: none;
	}
	.carousel:focus-visible {
		border-radius: 36px;
	}
	.carousel-card {
		scroll-snap-align: start;
	}

	.foot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}
	.dots {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
	.dot {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}
	.dot::before {
		content: '';
		width: 10px;
		height: 10px;
		border-radius: 5px;
		background: var(--lilac-line);
		transition:
			width 0.2s,
			background 0.2s;
	}
	.dot-on {
		width: 44px;
	}
	.dot-on::before {
		width: 28px;
		background: var(--violet-gloss-mid);
	}

	.arrows {
		display: flex;
		gap: 10px;
	}
	.arrow {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		padding: 0;
		border-radius: 50%;
		cursor: pointer;
		color: var(--ink-nav);
		background: linear-gradient(180deg, var(--glass-edge), var(--lilac-tint));
		border: 1px solid var(--lilac-line);
		box-shadow: 0 4px 14px rgba(91, 48, 180, 0.15);
	}
	.arrow:hover:not(:disabled) {
		color: var(--violet-600);
	}
	.arrow:disabled {
		cursor: default;
		opacity: 0.4;
		box-shadow: none;
	}
	.arrow-flip {
		display: grid;
		transform: scaleX(-1);
	}
	.arrows-foot {
		display: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.dot::before {
			transition: none;
		}
	}
	@media (max-width: 1199px) {
		.carousel {
			--per: 2;
		}
	}
	@media (max-width: 759px) {
		.carousel {
			--per: 1;
			--gap: 16px;
			--peek: 40px;
		}
		.carousel-card :global(.va-well) {
			height: 220px;
		}
		.arrows-head {
			display: none;
		}
		.arrows-foot {
			display: flex;
		}
	}
</style>
