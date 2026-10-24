<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const SECTIONS = [
		{ href: '/admin', label: 'Обзор' },
		{ href: '/admin/settings', label: 'Тексты' },
		{ href: '/admin/stack', label: 'Стек' },
		{ href: '/admin/projects', label: 'Проекты' },
		{ href: '/admin/approach', label: 'Подход' },
		{ href: '/admin/links', label: 'Ссылки' },
		{ href: '/admin/backup', label: 'Бэкапы' }
	];
	const isCurrent = (href: string) =>
		href === '/admin' ? page.url.pathname === '/admin' : page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if data.admin}
	<div class="va-sky min-h-screen">
		<header class="px-4 pt-5">
			<nav aria-label="Разделы админки" class="va-nav mx-auto max-w-6xl">
				<div class="va-nav-links">
					{#each SECTIONS as s (s.href)}
						<a
							class="va-nav-link"
							href={s.href}
							aria-current={isCurrent(s.href) ? 'page' : undefined}>{s.label}</a
						>
					{/each}
				</div>
				<div class="flex items-center gap-3">
					<a class="va-btn va-btn-md va-btn-pearl" href="/" target="_blank" rel="noopener"
						>Открыть сайт</a
					>
					<form method="POST" action="/admin/logout">
						<button type="submit" class="va-btn va-btn-md va-btn-pearl">Выйти</button>
					</form>
				</div>
			</nav>
		</header>
		<main class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
			{@render children()}
		</main>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	[aria-current='page'] {
		color: var(--violet-600);
		text-decoration: underline;
		text-underline-offset: 6px;
	}
</style>
