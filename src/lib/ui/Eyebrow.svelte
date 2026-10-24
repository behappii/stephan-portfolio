<script lang="ts">
	import type { Snippet } from 'svelte';
	let { tone = 'sky', children }: { tone?: 'sky' | 'dusk'; children: Snippet } = $props();
</script>

<span class="va-eyebrow va-eyebrow-{tone}">{@render children()}</span>
