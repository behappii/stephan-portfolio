<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/logo/favicon.svg';
	// Шрифты лежат на своём сервере; кириллицу грузим заранее — на ней почти весь текст.
	import nunitoCyrillic from '@fontsource-variable/nunito/files/nunito-cyrillic-wght-normal.woff2?url';
	import openSansCyrillic from '@fontsource-variable/open-sans/files/open-sans-cyrillic-wght-normal.woff2?url';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />
	{#each [nunitoCyrillic, openSansCyrillic] as font (font)}
		<link rel="preload" href={font} as="font" type="font/woff2" crossorigin="anonymous" />
	{/each}
</svelte:head>

{@render children()}
