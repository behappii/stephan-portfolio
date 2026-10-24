<script lang="ts">
	let { saved, label = 'Сохранить' }: { saved: boolean; label?: string } = $props();
</script>

<div class="flex items-center gap-4">
	<button type="submit" class="va-btn va-btn-md va-btn-violet">{label}</button>
	{#if saved}<p role="status" class="text-sm font-semibold text-violet-700">Сохранено</p>{/if}
</div>
