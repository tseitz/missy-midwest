<section id="landing" class="w-full"></section>

<style>
	#landing {
		background: url('/landing/missy-fan-crop.webp') no-repeat top center fixed;
		background-size: cover;
		transition: background-size 0.5s ease-out;
		filter: blur(5px);
		height: 94vh;
	}
	#landing::after {
		content: '';
		height: 100%;
		width: 100%;
		display: block;
		background-color: var(--missy-purple-500);
		opacity: 48%;
	}
</style>
