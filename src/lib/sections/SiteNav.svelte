<script lang="ts">
	import mark from '#lib/assets/logo/behappii-mark.svg';
	import GlossButton from '#lib/ui/GlossButton.svelte';
	import type { PageContent } from '#lib/server/content.ts';

	let { nav }: { nav: PageContent['nav'] } = $props();
</script>

<header class="site-header">
	<nav aria-label="Основная навигация" class="va-nav site-nav">
		<a href="#top" aria-label="behappii — наверх" class="va-nav-brand">
			<img src={mark} alt="" width="44" height="44" />
			<span aria-hidden="true"
				><span class="brand-angle">&lt;</span>behappii.ru<span class="brand-angle">/&gt;</span
				></span
			>
		</a>
		<div class="va-nav-links">
			{#each nav as item (item.href)}
				<a class="va-nav-link" href={item.href}>{item.label}</a>
			{/each}
			<GlossButton href="#contact">Связаться</GlossButton>
		</div>
	</nav>
</header>

<style>
	.site-header {
		position: relative;
		z-index: 2;
		padding: 20px 24px 0;
	}
	.site-nav {
		box-sizing: content-box;
		max-width: 1240px;
		margin: 0 auto;
	}
	.brand-angle {
		color: var(--violet-600);
	}
</style>
