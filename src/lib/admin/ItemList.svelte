<script lang="ts">
	import { enhance } from '$app/forms';

	let { items, base }: { items: { id: number; title: string; meta?: string }[]; base: string } =
		$props();
</script>

{#if items.length === 0}
	<p class="admin-panel text-ink-body">Пока пусто — раздел на сайте скрыт.</p>
{:else}
	<ol class="flex flex-col gap-3">
		{#each items as item, i (item.id)}
			<li class="admin-panel flex flex-wrap items-center gap-4">
				<div class="flex min-w-0 flex-1 flex-col">
					<span class="admin-h2 truncate">{item.title}</span>
					{#if item.meta}<span class="text-sm text-ink-muted">{item.meta}</span>{/if}
				</div>
				<form method="POST" action="?/move" use:enhance class="flex gap-2">
					<input type="hidden" name="id" value={item.id} />
					<button
						type="submit"
						name="direction"
						value="up"
						class="va-btn va-btn-md va-btn-pearl"
						disabled={i === 0}
						aria-label="Поднять «{item.title}»">↑</button
					>
					<button
						type="submit"
						name="direction"
						value="down"
						class="va-btn va-btn-md va-btn-pearl"
						disabled={i === items.length - 1}
						aria-label="Опустить «{item.title}»">↓</button
					>
				</form>
				<a href="{base}/{item.id}" class="va-btn va-btn-md va-btn-pearl">Изменить</a>
				<details class="relative">
					<summary class="va-btn va-btn-md va-btn-pearl list-none">Удалить</summary>
					<form
						method="POST"
						action="?/delete"
						use:enhance
						class="admin-panel absolute right-0 z-10 mt-2 flex w-64 flex-col gap-3"
					>
						<input type="hidden" name="id" value={item.id} />
						<p class="text-sm text-ink-body">Удалить «{item.title}»? Отменить нельзя.</p>
						<button type="submit" class="va-btn va-btn-md va-btn-violet">Да, удалить</button>
					</form>
				</details>
			</li>
		{/each}
	</ol>
{/if}
