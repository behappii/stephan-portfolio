<script lang="ts">
	let {
		size,
		tone = 'sky',
		class: className = '',
		style = ''
	}: { size: number; tone?: 'sky' | 'dusk'; class?: string; style?: string } = $props();
</script>

<span
	aria-hidden="true"
	class="va-bubble {tone === 'dusk' ? 'va-bubble-dusk' : ''} {className}"
	style="width: {size}px; height: {size}px; {style}"
></span>
