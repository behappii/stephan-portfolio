<script lang="ts">
	import { STACK_ICON_LABELS, STACK_ICONS, type StackIcon } from '#lib/icons.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let { value, error }: { value: StackIcon; error?: string } = $props();
</script>

<fieldset class="flex flex-col gap-2">
	<legend class="text-sm font-semibold text-ink-nav">Иконка</legend>
	<div class="flex flex-wrap gap-2">
		{#each STACK_ICONS as icon (icon)}
			<label class="icon-option">
				<input type="radio" name="icon" value={icon} checked={icon === value} class="sr-only" />
				<span class="va-icon-tile"><Icon name={icon} size={26} /></span>
				<span class="text-xs font-semibold text-ink-nav">{STACK_ICON_LABELS[icon]}</span>
			</label>
		{/each}
	</div>
	{#if error}<p class="text-sm font-semibold text-violet-800">{error}</p>{/if}
</fieldset>

<style>
	.icon-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 8px;
		border-radius: var(--radius-icon);
		border: 2px solid transparent;
		cursor: pointer;
	}
	.icon-option:has(input:checked) {
		border-color: var(--violet-600);
		background: var(--glass);
	}
	.icon-option:has(input:focus-visible) {
		box-shadow: var(--focus-ring);
	}
</style>
