<script lang="ts">
	import type { StackIcon } from '#lib/icons.ts';
	import Icon from './Icon.svelte';
	let { icon }: { icon: StackIcon } = $props();
</script>

<span class="va-icon-tile"><Icon name={icon} size={26} /></span>
