<script lang="ts">
	import mark from '#lib/assets/logo/behappii-mark.svg';
	import GlossButton from '#lib/ui/GlossButton.svelte';
	import type { PageContent } from '#lib/server/content.ts';

	let { nav }: { nav: PageContent['nav'] } = $props();

	let menu: HTMLDialogElement;

	// Ширина, с которой ссылки снова помещаются в шапку; совпадает с @media ниже.
	const DESKTOP = '(min-width: 901px)';

	function openMenu() {
		menu.showModal();
	}

	function closeMenu() {
		menu.close();
	}

	$effect(() => {
		const mq = window.matchMedia(DESKTOP);
		const onChange = () => mq.matches && menu.open && menu.close();
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});
</script>

{#snippet brand(onclick?: () => void)}
	<a href="#top" aria-label="behappii — наверх" class="va-nav-brand" {onclick}>
		<img src={mark} alt="" width="44" height="44" />
		<span aria-hidden="true"
			><span class="brand-angle">&lt;</span>behappii.ru<span class="brand-angle">/&gt;</span></span
		>
	</a>
{/snippet}

<header class="site-header">
	<nav aria-label="Основная навигация" class="va-nav site-nav">
		{@render brand()}
		<div class="va-nav-links desktop-links">
			{#each nav as item (item.href)}
				<a class="va-nav-link" href={item.href}>{item.label}</a>
			{/each}
			<GlossButton href="#contact">Связаться</GlossButton>
		</div>
		<button
			type="button"
			class="burger"
			aria-label="Открыть меню"
			aria-haspopup="dialog"
			onclick={openMenu}
		>
			<span class="burger-lines" aria-hidden="true"></span>
		</button>
	</nav>

	<dialog bind:this={menu} class="menu" aria-label="Меню">
		<div class="va-nav menu-bar">
			{@render brand(closeMenu)}
			<button
				type="button"
				class="burger burger-close"
				aria-label="Закрыть меню"
				onclick={closeMenu}
			>
				<span class="burger-lines" aria-hidden="true"></span>
			</button>
		</div>
		<nav aria-label="Разделы" class="menu-links">
			{#each nav as item (item.href)}
				<a class="menu-link" href={item.href} onclick={closeMenu}>{item.label}</a>
			{/each}
		</nav>
		<GlossButton href="#contact" size="lg" class="menu-cta" onclick={closeMenu}
			>Связаться</GlossButton
		>
	</dialog>
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

	.burger {
		display: none;
		flex: none;
		width: 48px;
		height: 48px;
		padding: 0;
		border-radius: 50%;
		place-items: center;
		cursor: pointer;
		color: var(--ink-nav);
		background: linear-gradient(180deg, var(--glass-edge), var(--lilac-tint));
		border: 1px solid var(--lilac-line);
		box-shadow: 0 4px 14px rgba(91, 48, 180, 0.15);
	}
	.burger-lines,
	.burger-lines::before,
	.burger-lines::after {
		display: block;
		position: relative;
		width: 20px;
		height: 2px;
		border-radius: 2px;
		background: currentColor;
		content: '';
	}
	.burger-lines::before,
	.burger-lines::after {
		position: absolute;
		left: 0;
	}
	.burger-lines::before {
		top: -6px;
	}
	.burger-lines::after {
		top: 6px;
	}
	.burger-close .burger-lines {
		background: transparent;
	}
	.burger-close .burger-lines::before {
		top: 0;
		transform: rotate(45deg);
	}
	.burger-close .burger-lines::after {
		top: 0;
		transform: rotate(-45deg);
	}

	.menu {
		box-sizing: border-box;
		width: 100%;
		max-width: none;
		height: 100%;
		max-height: none;
		margin: 0;
		padding: 20px 24px 32px;
		border: 0;
		color: var(--ink);
		background:
			radial-gradient(ellipse 80% 45% at 80% 20%, rgba(196, 168, 255, 0.7), transparent 70%),
			linear-gradient(180deg, rgba(246, 242, 255, 0.97), rgba(230, 219, 255, 0.97));
		-webkit-backdrop-filter: blur(var(--blur-nav));
		backdrop-filter: blur(var(--blur-nav));
	}
	.menu[open] {
		display: flex;
		flex-direction: column;
		animation: menuIn 0.2s ease-out;
	}
	.menu::backdrop {
		background: transparent;
	}
	.menu-bar {
		flex-wrap: nowrap;
	}
	.menu-links {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 48px;
		padding: 0 14px;
	}
	.menu-link {
		display: flex;
		align-items: center;
		min-height: 56px;
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 34px;
		letter-spacing: -0.02em;
		color: var(--ink);
	}
	.menu-link:hover {
		color: var(--violet-600);
	}
	.menu :global(.menu-cta) {
		margin-top: auto;
		justify-content: center;
	}
	:global(html:has(.menu[open])) {
		overflow: hidden;
	}
	@keyframes menuIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.menu[open] {
			animation: none;
		}
	}

	@media (max-width: 900px) {
		.site-header {
			padding: 16px 16px 0;
		}
		.site-nav {
			flex-wrap: nowrap;
		}
		.desktop-links {
			display: none;
		}
		.burger {
			display: grid;
		}
		.menu {
			padding: 16px 16px 32px;
		}
	}
	@media (min-width: 901px) {
		.menu {
			display: none;
		}
	}
</style>
