<section id="landing" class="w-full" />

<style>
	#landing {
		background: url('guitar.jpg') no-repeat center center fixed;
		background-size: cover;
		transition: background-size 0.5s ease-out;
		filter: blur(6px);
		height: 84vh;
	}
	#landing::after {
		content: '';
		height: 100%;
		width: 100%;
		display: block;
		background-color: purple;
		opacity: 75%;
	}
</style>
