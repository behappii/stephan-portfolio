<script lang="ts">
	import type { Settings } from '#lib/server/db/schema.ts';
	import GlossButton from '#lib/ui/GlossButton.svelte';
	import HeroArt from './HeroArt.svelte';

	let { settings, hasProjects }: { settings: Settings; hasProjects: boolean } = $props();

	// Пузырьки взлетают через весь раздел до шапки. Длительности из макета рассчитаны
	// на подъём в 880px, поэтому на высоком экране время растёт вместе с путём.
	const BASE_RISE = 880;
	let heroHeight = $state(BASE_RISE);
	// +120px — чтобы за край уходил даже самый крупный пузырёк (110px).
	const rise = $derived(Math.max(BASE_RISE, heroHeight + 120));

	// [left, size, rest, duration, delay, sway] — позиции из макета
	const BUBBLES: [string, number, string, number, number, boolean][] = [
		['3%', 90, '58%', 18, -2, false],
		['12%', 34, '30%', 13, -9, true],
		['22%', 56, '80%', 16, -5, false],
		['31%', 22, '88%', 11, -3, true],
		['40%', 46, '12%', 15, -12, false],
		['48%', 18, '50%', 10, -6, true],
		['55%', 70, '75%', 20, -14, false],
		['63%', 28, '20%', 12, -1, true],
		['70%', 110, '5%', 22, -8, false],
		['78%', 38, '62%', 14, -10, true],
		['85%', 24, '40%', 9, -4, false],
		['91%', 64, '82%', 17, -11, true],
		['96%', 20, '25%', 12, -7, false],
		['17%', 26, '8%', 19, -15, true],
		['36%', 40, '45%', 21, -18, false],
		['60%', 52, '35%', 18, -16, true]
	];

	// Пузырёк лопается по клику, а через мгновение вылетает заново снизу:
	// новое поколение пересоздаёт элемент, и подъём начинается с начала.
	const POP_MS = 350;
	let generation = $state(BUBBLES.map(() => 0));
	let popping = $state(BUBBLES.map(() => false));

	function pop(i: number) {
		if (popping[i]) return;
		popping[i] = true;
		setTimeout(() => {
			popping[i] = false;
			generation[i] += 1;
		}, POP_MS);
	}
</script>

<section
	aria-labelledby="hero-title"
	class="hero"
	bind:clientHeight={heroHeight}
	style="--rise: {rise}px; --slow: {rise / BASE_RISE}"
>
	<div class="wave" aria-hidden="true"></div>
	<div class="wave-line" aria-hidden="true"></div>
	<!-- Пузырьки — украшение: хлопать их можно мышью и пальцем, для читалок их нет. -->
	<div aria-hidden="true">
		{#each BUBBLES as [left, size, rest, dur, delay, sway], i (i)}
			{#key generation[i]}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span
					class="rise {sway ? 'sway-b' : ''}"
					class:respawn={generation[i] > 0}
					style="--left: {left}; --size: {size}px; --rest: {rest}; --dur: {dur}s"
					style:--delay="{generation[i] ? 0 : delay}s"
					onpointerdown={() => pop(i)}
				>
					<span class="bubble" class:popping={popping[i]}></span>
				</span>
			{/key}
		{/each}
	</div>

	<div class="hero-inner">
		<div class="hero-copy">
			<div class="hero-badge">
				<span class="hero-badge-dot" aria-hidden="true"></span>
				<span>{settings.name} · {settings.city}</span>
			</div>
			<h1 id="hero-title" class="hero-title">
				{settings.heroTitle}
				{#if settings.heroTitleAccent}<span class="va-gradient-text"
						>{settings.heroTitleAccent}</span
					>{/if}
			</h1>
			<p class="hero-text">{settings.heroText}</p>
			<div class="hero-actions">
				<GlossButton href="#contact" size="lg" icon="arrow-right"
					>{settings.heroCtaPrimary}</GlossButton
				>
				{#if hasProjects}
					<GlossButton href="#projects" size="lg" variant="pearl"
						>{settings.heroCtaSecondary}</GlossButton
					>
				{/if}
			</div>
		</div>
		<HeroArt />
	</div>
</section>

<style>
	/* Закреплённая шапка стоит над разделом, поэтому раздел заходит под неё. */
	.hero {
		position: relative;
		overflow: hidden;
		margin-top: calc(-1 * var(--header-h));
		padding-top: var(--header-h);
		background:
			radial-gradient(ellipse 70% 55% at 75% 30%, rgba(196, 168, 255, 0.85), transparent 70%),
			radial-gradient(ellipse 60% 50% at 10% 0%, rgba(255, 255, 255, 0.9), transparent 70%),
			linear-gradient(180deg, var(--sky-400) 0%, var(--sky-200) 70%, var(--sky-100) 100%);
	}
	.wave {
		position: absolute;
		left: -20%;
		top: 62%;
		width: 140%;
		height: 220px;
		border-radius: 50%;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0) 0%,
			rgba(255, 255, 255, 0.75) 45%,
			rgba(255, 255, 255, 0) 100%
		);
		transform: rotate(-7deg);
		filter: blur(6px);
		animation: waveDrift 9s ease-in-out infinite alternate;
	}
	.wave-line {
		position: absolute;
		left: -10%;
		top: 70%;
		width: 120%;
		height: 120px;
		border-radius: 50%;
		border-top: 2px solid rgba(255, 255, 255, 0.9);
		transform: rotate(-5deg);
		animation: waveLine 12s ease-in-out infinite alternate;
	}
	.rise {
		position: absolute;
		top: 100%;
		left: var(--left);
		width: var(--size);
		height: var(--size);
		cursor: pointer;
		will-change: transform;
		animation: bubbleRiseA calc(var(--dur) * var(--slow, 1)) linear
			calc(var(--delay) * var(--slow, 1)) infinite;
	}
	.rise.sway-b {
		animation-name: bubbleRiseB;
	}
	.bubble {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: radial-gradient(
			circle at 32% 28%,
			rgba(255, 255, 255, 0.98) 0 9%,
			rgba(255, 255, 255, 0.4) 22%,
			rgba(214, 195, 255, 0.25) 55%,
			var(--bubble) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.85);
		box-shadow: inset 0 -6px 14px rgba(124, 58, 237, 0.22);
	}
	/* Кольцо, которое расходится от лопнувшего пузырька. */
	.bubble::after {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: 50%;
		border: 3px solid rgba(167, 139, 250, 0.85);
		opacity: 0;
	}
	.bubble.popping {
		animation: bubblePop 0.25s ease-out forwards;
	}
	.bubble.popping::after {
		animation: bubbleRing 0.35s ease-out forwards;
	}
	@keyframes bubblePop {
		to {
			transform: scale(1.3);
			opacity: 0;
			background: transparent;
			border-color: transparent;
			box-shadow: none;
		}
	}
	@keyframes bubbleFade {
		to {
			opacity: 0;
		}
	}
	@keyframes bubbleRing {
		from {
			opacity: 1;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(1.8);
		}
	}
	@keyframes bubbleRiseA {
		0% {
			transform: translate3d(0, 0, 0);
			opacity: 0;
		}
		8% {
			opacity: 1;
		}
		50% {
			transform: translate3d(18px, calc(var(--rise, 880px) * -0.49), 0);
		}
		92% {
			opacity: 1;
		}
		100% {
			transform: translate3d(-8px, calc(var(--rise, 880px) * -1), 0);
			opacity: 0;
		}
	}
	@keyframes bubbleRiseB {
		0% {
			transform: translate3d(0, 0, 0);
			opacity: 0;
		}
		8% {
			opacity: 1;
		}
		50% {
			transform: translate3d(-16px, calc(var(--rise, 880px) * -0.49), 0);
		}
		92% {
			opacity: 1;
		}
		100% {
			transform: translate3d(10px, calc(var(--rise, 880px) * -1), 0);
			opacity: 0;
		}
	}
	@keyframes waveDrift {
		0% {
			transform: translate3d(0, 0, 0) rotate(-7deg) scaleY(1);
		}
		50% {
			transform: translate3d(-4%, -28px, 0) rotate(-3deg) scaleY(1.15);
		}
		100% {
			transform: translate3d(3%, 14px, 0) rotate(-10deg) scaleY(0.9);
		}
	}
	@keyframes waveLine {
		0% {
			transform: translate3d(0, 0, 0) rotate(-5deg);
		}
		50% {
			transform: translate3d(3%, -18px, 0) rotate(-8deg);
		}
		100% {
			transform: translate3d(-3%, 10px, 0) rotate(-2deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.rise {
			animation: none;
			top: var(--rest);
		}
		/* Пузырьки стоят на месте: лопнувший тихо проявляется снова. */
		.bubble.popping {
			animation: bubbleFade 0.25s ease-out forwards;
		}
		.bubble.popping::after {
			animation: none;
		}
		.rise.respawn .bubble {
			animation: bubbleFade 0.6s ease-in 1.5s reverse both;
		}
		.wave,
		.wave-line {
			animation: none;
		}
	}
	/* Блок с текстом и картинкой лежит поверх пузырьков: клики по пустому месту
	   проходят к пузырькам, а текст, кнопки и картинка ловят их как обычно. */
	.hero-inner {
		pointer-events: none;
		box-sizing: content-box;
		position: relative;
		z-index: 1;
		max-width: 1240px;
		margin: 0 auto;
		padding: 88px 32px 128px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 64px;
	}
	/* Телефон и планшет: чип с именем ближе к шапке. */
	@media (max-width: 900px) {
		.hero-inner {
			padding-top: 32px;
		}
	}
	.hero-copy > *,
	.hero-inner > :global(.art) {
		pointer-events: auto;
	}
	.hero-copy {
		flex: 1 1 520px;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 30px;
	}
	.hero-badge {
		display: inline-flex;
		align-self: flex-start;
		align-items: center;
		gap: 10px;
		padding: 8px 18px 8px 10px;
		border-radius: var(--radius-pill);
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.55));
		border: 1px solid var(--glass-edge);
		box-shadow: 0 4px 14px rgba(91, 48, 180, 0.15);
		font-size: 14px;
		font-weight: 600;
		color: var(--ink-nav);
	}
	.hero-badge-dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: radial-gradient(
			circle at 35% 30%,
			#ffffff 0 15%,
			#a78bfa 45%,
			var(--violet-600) 100%
		);
		box-shadow: 0 0 10px rgba(124, 58, 237, 0.6);
	}
	.hero-title {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 900;
		font-size: clamp(42px, 5.4vw, 76px);
		line-height: 1.02;
		letter-spacing: -0.02em;
		color: var(--ink);
		text-wrap: balance;
	}
	.hero-text {
		margin: 0;
		max-width: 560px;
		font-size: 19px;
		line-height: 1.65;
		color: var(--ink-body);
		text-wrap: pretty;
	}
	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px;
	}
</style>
