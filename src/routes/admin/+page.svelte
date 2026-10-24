<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	const cards = $derived([
		{
			href: '/admin/settings',
			title: 'Тексты',
			text: 'Первый экран, заголовки разделов, почта, SEO'
		},
		{ href: '/admin/stack', title: 'Стек', text: `Карточек: ${data.counts.stack}` },
		{
			href: '/admin/projects',
			title: 'Проекты',
			text: `Всего: ${data.counts.projects}, на сайте: ${data.counts.published}`
		},
		{ href: '/admin/approach', title: 'Подход', text: `Этапов: ${data.counts.approach}` },
		{ href: '/admin/links', title: 'Ссылки', text: `Ссылок: ${data.counts.links}` },
		{ href: '/admin/backup', title: 'Бэкапы', text: 'Экспорт, импорт, восстановление' }
	]);
</script>

<svelte:head><title>Обзор — админка</title></svelte:head>

<h1 class="admin-h1">Обзор</h1>

{#if data.placeholders > 0}
	<p class="admin-panel font-semibold text-ink-body">
		На сайте осталось заглушек в [скобках]: {data.placeholders}. Замените их перед публикацией.
	</p>
{/if}

<div
	class="grid gap-4"
	style="grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr))"
>
	{#each cards as card (card.href)}
		<a
			href={card.href}
			class="va-glass va-glass-xl va-glass-pad-md va-glass-lift flex flex-col gap-2"
		>
			<span class="admin-h2">{card.title}</span>
			<span class="text-sm text-ink-body">{card.text}</span>
		</a>
	{/each}
</div>
