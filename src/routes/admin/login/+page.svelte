<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Вход — админка</title>
</svelte:head>

<main class="va-sky grid min-h-screen place-items-center px-4">
	<form
		method="POST"
		use:enhance
		class="va-glass va-glass-2xl va-glass-pad-lg flex w-full max-w-sm flex-col gap-4"
	>
		<h1 class="font-display text-3xl font-black text-ink">Вход</h1>
		<label class="flex flex-col gap-1 text-sm font-semibold text-ink-nav">
			Пароль
			<input
				name="password"
				type="password"
				autocomplete="current-password"
				required
				class="admin-input"
			/>
		</label>
		{#if form?.error}
			<p role="alert" class="text-sm font-semibold text-violet-800">{form.error}</p>
		{/if}
		<button type="submit" class="va-btn va-btn-md va-btn-violet">Войти</button>
	</form>
</main>
