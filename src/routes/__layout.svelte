<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../app.css';
	// import side from './side-test-removebg.png';
</script>

<Header />

<main class="flex flex-col items-center w-full bg-missy-500">
	<slot />
	<!-- <div class="side-secret fixed flex justify-between">
		<img src={side} alt="Missy Midwest Hi Left" class="relative opacity-70 h-screen" />
		<img src={side} alt="Missy Midwest Hi Right" class="relative opacity-70 h-screen" />
	</div> -->
</main>

<style>
	/* .side-secret {
		width: 100vw;
		min-width: 3300px;
		z-index: -1;
	}
	.side-secret img:first-child {
		left: -220px;
		transform: rotate(29deg);
	}
	.side-secret img:nth-child(2) {
		right: -220px;
		transform: scaleX(-1) rotate(36deg);
	} */
</style>
