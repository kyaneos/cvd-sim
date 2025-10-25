<script>
	import '../app.css';
	import '$lib/framework/styles/framework.css';

	let showInfo = $state(false);
</script>

<slot />

<!-- App Info Footer -->
<button
	class="info-button"
	onclick={() => (showInfo = !showInfo)}
	aria-label="Toggle app information"
>
	i
</button>

{#if showInfo}
	<div class="info-overlay" onclick={() => (showInfo = false)} role="button" tabindex="0">
		<div class="info-modal" onclick={(e) => e.stopPropagation()} role="dialog">
			<button class="close-button" onclick={() => (showInfo = false)} aria-label="Close">×</button>

			<h2>CVD Testing Framework</h2>

			<div class="info-section">
				<h3>Developer</h3>
				<p>
					Developed by <a href="https://kyaneos.github.io/" target="_blank" rel="noopener"
						>Justin Bonagura Moran</a
					>
				</p>
			</div>

			<div class="info-section">
				<h3>Source Code</h3>
				<p>
					<a href="https://github.com/kyaneos/cvd-sim/" target="_blank" rel="noopener"
						>View on GitHub</a
					>
				</p>
			</div>

			<div class="info-section">
				<h3>Application Features</h3>
				<ul>
					<li>
						<strong>Test:</strong> Adaptive color vision testing using Bayesian inference to identify
						confusion patterns
					</li>
					<li>
						<strong>Results:</strong> Complete test history with searchable, filterable records and statistics
					</li>
					<li>
						<strong>Color Map:</strong> Circular visualization showing your personal color confusion
						patterns (Farnsworth D-15 style)
					</li>
					<li>
						<strong>Settings:</strong> Configure CVD type, severity, and run multi-stage calibration
					</li>
					<li>
						<strong>Converter:</strong> Transform images to show how they appear with your specific color
						vision profile
					</li>
					<li>
						<strong>Hex Navigator:</strong> Explore and compare specific colors with CVD simulation
					</li>
				</ul>
			</div>

			<div class="info-section">
				<h3>Research Foundation</h3>
				<p>
					This application is built on extensive research into color vision deficiency testing
					methodologies. See the full research documentation for details on clinical testing
					standards, adaptive testing approaches, and visualization best practices.
				</p>
			</div>

			<div class="info-section">
				<h3>Reference Projects</h3>
				<p>This implementation was informed by excellent open-source projects:</p>
				<ul>
					<li>
						<a
							href="https://github.com/MaPePeR/jsColorblindSimulator"
							target="_blank"
							rel="noopener">jsColorblindSimulator</a
						> by MaPePeR - Machado et al. physiologically-accurate CVD simulation
					</li>
					<li>
						<a href="https://github.com/skratchdot/color-blind" target="_blank" rel="noopener"
							>color-blind</a
						> by skratchdot - Matthew Wickline/HCIRN algorithms
					</li>
					<li>
						<a href="https://www.color-blindness.com/" target="_blank" rel="noopener">Colblindor</a>
						- Educational resources and testing methods
					</li>
					<li>
						<a href="https://github.com/nvkelso/color-oracle" target="_blank" rel="noopener"
							>Color Oracle</a
						> by nvkelso - Design and accessibility inspiration
					</li>
					<li>
						<a href="https://github.com/markusn/color-diff" target="_blank" rel="noopener"
							>color-diff</a
						> by markusn - CIEDE2000 Delta E implementation for perceptual distance weighting
					</li>
				</ul>
			</div>

			<div class="info-section">
				<h3>Key Research</h3>
				<ul>
					<li>
						<strong>CVD Simulation:</strong> Machado et al. (2009) "A Physiologically-based Model for
						Simulation of Color Vision Deficiency"
					</li>
					<li>
						<strong>Clinical Testing:</strong> Farnsworth (1943) "The Farnsworth-Munsell 100-Hue and
						Dichotomous Tests"; Ishihara (1917) "Tests for colour-blindness"
					</li>
					<li>
						<strong>Perceptual Distance:</strong> CIE (2001) CIEDE2000 formula; Sharma et al. (2005)
						implementation notes
					</li>
					<li>
						<strong>Bayesian Adaptive Testing:</strong> Watson (2017) QUEST+; Watson & Pelli (1983) QUEST;
						Kontsevich & Tyler (1999) psychometric slope estimation
					</li>
				</ul>
			</div>

			<div class="info-section">
				<h3>Technology Stack</h3>
				<p>
					<strong>Frontend:</strong> Svelte 5, SvelteKit<br />
					<strong>Styling:</strong> TailwindCSS 4, DaisyUI<br />
					<strong>Backend:</strong> PocketBase<br />
					<strong>Testing:</strong> Bayesian inference with color-blind npm library
				</p>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Average', serif;
		background: #ffffff;
		color: #000000;
	}

	.info-button {
		position: fixed;
		bottom: 20px;
		right: 20px;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: #e8e8e8;
		color: #666666;
		border: 2px solid #cccccc;
		font-size: 20px;
		font-weight: normal;
		font-style: normal;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'Average', serif;
		padding: 0;
		z-index: 999;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.info-button:hover {
		background: #d8d8d8;
		border-color: #999999;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.info-button:active {
		background: #cccccc;
		transform: scale(0.95);
	}

	.info-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.info-modal {
		background: #ffffff;
		border: 2px solid #000000;
		border-radius: 8px;
		padding: 30px;
		max-width: 600px;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
	}

	.close-button {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: #e8e8e8;
		color: #666666;
		border: 2px solid #cccccc;
		font-size: 24px;
		line-height: 1;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.close-button:hover {
		background: #d8d8d8;
		border-color: #999999;
	}

	.info-modal h2 {
		margin-top: 0;
		margin-bottom: 20px;
		font-size: 24px;
		border-bottom: 2px solid #000000;
		padding-bottom: 10px;
	}

	.info-section {
		margin-bottom: 20px;
	}

	.info-section h3 {
		margin-top: 0;
		margin-bottom: 10px;
		font-size: 18px;
		font-weight: 600;
	}

	.info-section p,
	.info-section ul {
		margin: 0;
		line-height: 1.6;
	}

	.info-section ul {
		padding-left: 20px;
		margin-top: 8px;
	}

	.info-section li {
		margin-bottom: 8px;
	}

	.info-section a {
		color: #000000;
		text-decoration: underline;
		font-weight: 600;
	}

	.info-section a:hover {
		color: #333333;
	}
</style>
