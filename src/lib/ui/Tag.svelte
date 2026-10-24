<script lang="ts">
	import type { Snippet } from 'svelte';
	let { tone = 'pearl', children }: { tone?: 'pearl' | 'violet'; children: Snippet } = $props();
</script>

<span class="va-tag va-tag-{tone}">{@render children()}</span>
