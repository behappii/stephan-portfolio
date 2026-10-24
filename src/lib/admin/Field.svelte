<script lang="ts">
	let {
		name,
		label,
		value,
		error,
		type = 'text',
		rows = 4,
		hint
	}: {
		name: string;
		label: string;
		value: string;
		error?: string;
		type?: 'text' | 'textarea' | 'url' | 'email';
		rows?: number;
		hint?: string;
	} = $props();

	const id = $derived(`field-${name}`);
	const describedBy = $derived(
		[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
	);
</script>

<div class="flex flex-col gap-1">
	<label for={id} class="text-sm font-semibold text-ink-nav">{label}</label>
	{#if type === 'textarea'}
		<textarea
			{id}
			{name}
			{rows}
			{value}
			class="admin-input"
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}></textarea>
	{:else}
		<input
			{id}
			{name}
			{type}
			{value}
			class="admin-input"
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
		/>
	{/if}
	{#if hint}<p id="{id}-hint" class="text-xs text-ink-muted">{hint}</p>{/if}
	{#if error}<p id="{id}-error" class="text-sm font-semibold text-violet-800">{error}</p>{/if}
</div>
