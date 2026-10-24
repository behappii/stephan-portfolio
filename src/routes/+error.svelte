<script lang="ts">
	import { page } from '$app/state';
	import GlossButton from '#lib/ui/GlossButton.svelte';
</script>

<svelte:head>
	<title>{page.status} — behappii</title>
</svelte:head>

<main class="va-sky grid min-h-screen place-items-center px-4">
	<div class="va-glass va-glass-2xl va-glass-pad-lg flex max-w-md flex-col items-start gap-4">
		<span class="va-eyebrow va-eyebrow-sky">Ошибка {page.status}</span>
		<h1 class="font-display text-4xl font-black text-ink">
			{page.status === 404 ? 'Такой страницы нет' : 'Что-то сломалось'}
		</h1>
		<p class="text-ink-body">
			{page.status === 404
				? 'Проверьте адрес или вернитесь на главную.'
				: 'Попробуйте обновить страницу через минуту.'}
		</p>
		<GlossButton href="/">На главную</GlossButton>
	</div>
</main>
