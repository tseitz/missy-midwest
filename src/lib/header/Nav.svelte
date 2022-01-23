<script lang="ts">
	import missyLogo from './missy-midwest-neon-cropped.png';
	let y = 0;

	let margin = -3;
	let scale = 5;
	let translateX = '0';
	let translateY = '80%';

	$: margin = Math.min(0, -3 + y / 100);
	$: scale = Math.max(1, 5 - y / 125);
	$: translateY = Math.max(0, 80 - y / 6.25) + '%';
</script>

<svelte:window bind:scrollY={y} />

<nav>
	<ul class="flex items-center list-none">
		<li class="my-4 mx-4"><a class="text-missy-500 text-lg" href="#music">Music</a></li>
		<li class="my-4 mx-4"><a class="text-missy-500 text-lg" href="#dates">Upcoming Dates</a></li>
		<div class="logo" style="margin: 0 {margin}rem">
			<img
				src={missyLogo}
				alt="Missy Midwest"
				class="h-12 w-24"
				style="transform: scale({scale}) translate({translateX}, {translateY});"
			/>
		</div>
		<li class="my-4 mx-4"><a class="text-missy-500 text-lg" href="#about">About</a></li>
		<li class="my-4 mx-4"><a class="text-missy-500 text-lg" href="#press">Press Kit</a></li>
	</ul>
</nav>

<style>
	li {
		z-index: 1;
	}
	.logo {
		transition: margin 0.03s ease-out;
	}
	.logo img {
		object-fit: contain;
		transition: transform 0.03s ease-out;
	}
</style>
