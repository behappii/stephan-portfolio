<script lang="ts">
	import type { Link, Settings } from '#lib/server/db/schema.ts';
	import Bubble from '#lib/ui/Bubble.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	let { settings, links, eyebrow }: { settings: Settings; links: Link[]; eyebrow: string } =
		$props();
</script>

<section id="contact" aria-labelledby="contact-title" class="va-dusk contact">
	<div class="contact-shine" aria-hidden="true"></div>
	<Bubble size={110} tone="dusk" class="contact-bubble" style="right: 8%; top: 22%" />
	<Bubble size={44} tone="dusk" class="contact-bubble" style="right: 22%; top: 56%" />
	<Bubble size={26} tone="dusk" class="contact-bubble" style="right: 4%; bottom: 22%" />

	<div class="contact-inner">
		<Eyebrow tone="dusk">{eyebrow}</Eyebrow>
		<h2 id="contact-title" class="contact-title">{settings.contactTitle}</h2>
		<div class="contact-actions">
			<a class="contact-email" href="mailto:{settings.email}">
				{settings.email}
				<Icon name="arrow-up-right" size={20} strokeWidth={2.4} />
			</a>
			{#if links.length}
				<div class="contact-links">
					{#each links as link (link.id)}
						<a class="light-link" href={link.url} target="_blank" rel="noopener">{link.label} ↗</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<footer class="contact-footer">
		<span>© {settings.footerYear} {settings.name}</span>
		<a class="light-link" href="#top">Наверх ↑</a>
	</footer>
</section>

<style>
	.contact {
		position: relative;
		overflow: hidden;
		background:
			radial-gradient(ellipse 60% 80% at 80% 0%, rgba(196, 161, 255, 0.55), transparent 70%),
			linear-gradient(180deg, var(--violet-600) 0%, var(--violet-800) 55%, var(--dusk) 100%);
	}
	.contact-shine {
		position: absolute;
		left: -10%;
		top: -120px;
		width: 120%;
		height: 220px;
		border-radius: 50%;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0));
	}
	:global(.contact-bubble) {
		position: absolute;
	}
	.contact-inner {
		box-sizing: content-box;
		position: relative;
		max-width: 1240px;
		margin: 0 auto;
		padding: 128px 32px 96px;
		display: flex;
		flex-direction: column;
		gap: 40px;
	}
	.contact-title {
		margin: 0;
		max-width: 900px;
		font-family: var(--font-display);
		font-weight: 900;
		font-size: clamp(40px, 6vw, 88px);
		line-height: 1;
		letter-spacing: -0.02em;
		text-wrap: balance;
		text-shadow: 0 2px 20px rgba(30, 5, 70, 0.35);
	}
	.contact-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px 32px;
	}
	.contact-email {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		min-height: 62px;
		padding: 0 34px;
		border-radius: var(--radius-pill);
		background: linear-gradient(180deg, #ffffff 0%, var(--sky-100) 50%, #e2d4ff 51%, #f4efff 100%);
		border: 1px solid var(--glass-edge);
		box-shadow:
			inset 0 1px 0 #ffffff,
			0 12px 30px rgba(20, 0, 60, 0.4);
		color: var(--violet-800);
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 20px;
		letter-spacing: -0.01em;
		overflow-wrap: anywhere;
		transition:
			transform 0.15s ease,
			filter 0.15s ease;
	}
	.contact-email:hover {
		transform: translateY(-2px);
		filter: brightness(1.04);
		color: var(--violet-900);
	}
	.contact-links {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 28px;
		font-size: 16px;
		font-weight: 700;
	}
	.light-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: #f4eeff;
	}
	.light-link:hover {
		color: var(--on-violet);
	}
	.contact-footer {
		box-sizing: content-box;
		position: relative;
		max-width: 1240px;
		margin: 0 auto;
		padding: 24px 32px 36px;
		border-top: 1px solid rgba(255, 255, 255, 0.22);
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		font-size: 14px;
		color: var(--on-dusk-muted);
	}
</style>
