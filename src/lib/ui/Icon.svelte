<script lang="ts" module>
	import type { StackIcon } from '#lib/icons.ts';

	export type IconName = StackIcon | 'arrow-right' | 'arrow-up-right';

	type Shape =
		| { kind: 'path'; d: string }
		| { kind: 'circle'; cx: number; cy: number; r: number }
		| { kind: 'rect'; x: number; y: number; width: number; height: number; rx: number };

	const p = (d: string): Shape => ({ kind: 'path', d });

	const SHAPES: Record<IconName, Shape[]> = {
		web: [
			{ kind: 'circle', cx: 12, cy: 12, r: 9 },
			p('M3 12h18'),
			p('M12 3a14 14 0 0 1 0 18'),
			p('M12 3a14 14 0 0 0 0 18')
		],
		mobile: [{ kind: 'rect', x: 6, y: 2.5, width: 12, height: 19, rx: 3 }, p('M11 18h2')],
		desktop: [
			{ kind: 'rect', x: 2.5, y: 4, width: 19, height: 13, rx: 2 },
			p('M8 21h8'),
			p('M12 17v4')
		],
		infra: [
			p('M12 2.5l8.5 4.75v9.5L12 21.5l-8.5-4.75v-9.5z'),
			p('M3.5 7.25L12 12l8.5-4.75'),
			p('M12 12v9.5')
		],
		design: [
			p('M12 19l7-7 3 3-7 7z'),
			p('M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z'),
			p('M2 2l7.6 7.6'),
			{ kind: 'circle', cx: 11, cy: 11, r: 2 }
		],
		ai: [
			p('M10 3.5l1.9 4.6 4.6 1.9-4.6 1.9L10 16.5l-1.9-4.6L3.5 10l4.6-1.9z'),
			p('M18 14l.9 2.1 2.1.9-2.1.9L18 20l-.9-2.1L15 17l2.1-.9z')
		],
		'arrow-right': [p('M5 12h14'), p('M13 6l6 6-6 6')],
		'arrow-up-right': [p('M7 17L17 7'), p('M8 7h9v9')]
	};
</script>

<script lang="ts">
	let {
		name,
		size = 24,
		strokeWidth = 1.9,
		label
	}: { name: IconName; size?: number; strokeWidth?: number; label?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	{#each SHAPES[name] as shape, i (i)}
		{#if shape.kind === 'path'}
			<path d={shape.d} />
		{:else if shape.kind === 'circle'}
			<circle cx={shape.cx} cy={shape.cy} r={shape.r} />
		{:else}
			<rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} />
		{/if}
	{/each}
</svg>
