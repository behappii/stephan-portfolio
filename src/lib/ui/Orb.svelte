<script lang="ts">
	import type { Snippet } from 'svelte';
	let { size = 'md', children }: { size?: 'sm' | 'md'; children: Snippet } = $props();
</script>

<span class="va-orb va-orb-{size}"><span>{@render children()}</span></span>
