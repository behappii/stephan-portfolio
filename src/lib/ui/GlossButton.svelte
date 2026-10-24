<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';

	type Props = {
		variant?: 'violet' | 'pearl';
		size?: 'md' | 'lg';
		href?: string;
		icon?: 'arrow-right' | 'arrow-up-right';
		type?: 'button' | 'submit';
		class?: string;
		children: Snippet;
	} & Omit<HTMLAnchorAttributes & HTMLButtonAttributes, 'type' | 'class' | 'children'>;

	let {
		variant = 'violet',
		size = 'md',
		href,
		icon,
		type = 'button',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const classes = $derived(`va-btn va-btn-${size} va-btn-${variant} ${className}`);
</script>

{#if href}
	<a {href} class={classes} {...rest}>
		{@render children()}
		{#if icon}<Icon name={icon} size={18} strokeWidth={2.4} />{/if}
	</a>
{:else}
	<button {type} class={classes} {...rest}>
		{@render children()}
		{#if icon}<Icon name={icon} size={18} strokeWidth={2.4} />{/if}
	</button>
{/if}
