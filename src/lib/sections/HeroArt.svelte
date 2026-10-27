<div aria-hidden="true" class="art">
	<div class="art-glow"></div>
	<div class="art-glow-shine"></div>

	<div class="va-window art-browser">
		<div class="va-window-bar">
			<span class="va-window-url">behappii.ru/...</span>
			<span class="va-window-ctl"></span>
			<span class="va-window-ctl"></span>
			<span class="va-window-close"></span>
		</div>
		<div class="va-window-client">
			<div class="bar bar-title"></div>
			<div class="bar bar-line" style="--w: 82%"></div>
			<div class="bar bar-line" style="--w: 66%"></div>
			<div class="tiles">
				<div class="tile tile-accent"></div>
				<div class="tile"></div>
				<div class="tile"></div>
			</div>
		</div>
	</div>

	<div class="va-window art-app">
		<div class="va-window-bar"></div>
		<div class="app-client">
			<div class="app-side">
				<div class="bar bar-strong" style="--w: 70%"></div>
				<div class="bar bar-soft" style="--w: 90%"></div>
				<div class="bar bar-soft" style="--w: 60%"></div>
			</div>
			<div class="app-main">
				<div class="bar bar-strong bar-tall" style="--w: 50%"></div>
				<div class="app-canvas"></div>
			</div>
		</div>
	</div>

	<div class="art-phone">
		<div class="phone-screen">
			<div class="phone-hero"></div>
			<div class="bar bar-strong bar-tall" style="--w: 75%"></div>
			<div class="bar bar-soft" style="--w: 90%"></div>
			<div class="bar bar-soft" style="--w: 60%"></div>
			<div class="phone-cta"></div>
			<div class="phone-shine"></div>
		</div>
	</div>
</div>

<style>
	.art {
		flex: 1 1 440px;
		min-width: 0;
		position: relative;
		height: 520px;
	}
	.art-glow {
		position: absolute;
		left: 12%;
		top: 40px;
		width: 380px;
		height: 380px;
		max-width: 80%;
		border-radius: 50%;
		background: radial-gradient(
			circle at 50% 110%,
			rgba(232, 220, 255, 0.95) 0%,
			rgba(167, 139, 250, 0.75) 40%,
			rgba(109, 40, 217, 0.75) 100%
		);
		box-shadow:
			0 30px 80px rgba(109, 40, 217, 0.35),
			inset 0 -20px 50px rgba(255, 255, 255, 0.45);
	}
	.art-glow-shine {
		position: absolute;
		left: calc(12% + 50px);
		top: 52px;
		width: 280px;
		max-width: 58%;
		height: 150px;
		border-radius: 50%;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0));
	}
	.art-browser {
		position: absolute;
		top: 10px;
		left: 0;
		width: 80%;
		height: 290px;
	}
	.bar {
		width: var(--w, 100%);
		height: 9px;
		border-radius: 5px;
	}
	.bar-title {
		width: 55%;
		height: 16px;
		border-radius: 8px;
		background: linear-gradient(90deg, var(--violet-500), var(--lilac));
	}
	.bar-line {
		background: #ede6ff;
	}
	.bar-strong {
		height: 8px;
		border-radius: 4px;
		background: var(--lilac);
	}
	.bar-soft {
		height: 8px;
		border-radius: 4px;
		background: #ede6ff;
	}
	.bar-tall {
		height: 10px;
	}
	.tiles {
		display: flex;
		gap: 10px;
		margin-top: 8px;
	}
	.tile {
		flex: 1;
		height: 64px;
		border-radius: 10px;
		background: #f4efff;
	}
	.tile-accent {
		background: linear-gradient(180deg, #e9deff, #cdb8ff);
	}
	.art-app {
		position: absolute;
		left: 6%;
		bottom: 0;
		width: 60%;
		height: 180px;
		border-radius: 12px;
	}
	.art-app :global(.va-window-bar) {
		padding: 0;
		height: 26px;
	}
	.app-client {
		flex: 1;
		margin: 8px;
		border-radius: 6px;
		background: var(--glass-edge);
		display: flex;
	}
	.app-side {
		width: 32%;
		border-right: 1px solid #ede6ff;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 9px;
	}
	.app-main {
		flex: 1;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 9px;
	}
	.app-canvas {
		flex: 1;
		border-radius: 8px;
		background: #f4efff;
	}
	.art-phone {
		position: absolute;
		right: 0;
		top: 110px;
		width: 172px;
		height: 350px;
		border-radius: var(--radius-device);
		background: linear-gradient(160deg, #3b1a78 0%, #1e0b45 60%, #2b1260 100%);
		border: 1px solid #12052e;
		box-shadow:
			0 40px 70px -20px rgba(40, 10, 100, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.35);
		padding: 10px;
		box-sizing: border-box;
	}
	.phone-screen {
		position: relative;
		height: 100%;
		border-radius: 28px;
		overflow: hidden;
		background: linear-gradient(180deg, var(--sky-200) 0%, #ffffff 60%);
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 14px;
	}
	.phone-hero {
		height: 96px;
		border-radius: 18px;
		background: radial-gradient(
			circle at 50% 120%,
			#e2d4ff 0%,
			var(--violet-500) 55%,
			var(--violet-700) 100%
		);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
	}
	.phone-cta {
		margin-top: auto;
		height: 34px;
		border-radius: 17px;
		background: linear-gradient(
			180deg,
			var(--violet-gloss-top) 0%,
			var(--violet-gloss-mid) 50%,
			var(--violet-gloss-low) 51%,
			var(--violet-gloss-base) 100%
		);
	}
	.phone-shine {
		position: absolute;
		top: -40px;
		left: -30px;
		width: 180px;
		height: 200px;
		transform: rotate(-25deg);
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0),
			rgba(255, 255, 255, 0.45),
			rgba(255, 255, 255, 0)
		);
	}

	/* Телефон: та же композиция, размеры от ширины экрана, детали окон компактнее. */
	@media (max-width: 600px) {
		.art {
			flex-basis: 100%;
			height: auto;
			aspect-ratio: 1 / 0.95;
		}
		.art-glow {
			left: 8%;
			top: 6%;
			width: 72%;
			height: auto;
			aspect-ratio: 1;
		}
		.art-glow-shine {
			left: calc(8% + 30px);
			top: 8%;
			width: 52%;
			height: 24%;
		}
		.art-browser {
			top: 3%;
			width: 76%;
			height: 52%;
		}
		.art-browser :global(.va-window-client) {
			margin: 8px;
			padding: 12px;
			gap: 8px;
		}
		.art-browser :global(.va-window-url) {
			font-size: 11px;
		}
		.tile {
			height: 40px;
		}
		.art-app {
			left: 6%;
			width: 58%;
			height: 34%;
			border-radius: 10px;
		}
		.art-app :global(.va-window-bar) {
			height: 20px;
			min-height: 20px;
		}
		.app-client {
			margin: 6px;
		}
		.app-side,
		.app-main {
			padding: 10px;
			gap: 6px;
		}
		.app-side .bar,
		.app-main .bar {
			height: 6px;
		}
		.art-phone {
			top: 18%;
			width: 34%;
			height: auto;
			aspect-ratio: 172 / 350;
			padding: 7px;
			border-radius: 26px;
		}
		.phone-screen {
			border-radius: 20px;
			gap: 7px;
			padding: 10px;
		}
		.phone-hero {
			height: 30%;
			flex: none;
			border-radius: 14px;
		}
		.phone-cta {
			height: 26px;
		}
	}
</style>
