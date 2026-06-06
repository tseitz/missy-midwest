<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import CartDrawer from '$lib/shop/CartDrawer.svelte';
	import MusicEngine from '$lib/music/MusicEngine.svelte';
	import NowPlayingBar from '$lib/music/NowPlayingBar.svelte';
	import { player } from '$lib/music/player.svelte';
	import '../app.css';

	let { children } = $props();
	const barVisible = $derived(player.state.currentUrl !== null);
</script>

<Header />

<main class="bg-missy-deep-purple flex min-h-screen w-full flex-col items-center pt-16">
	{@render children()}
</main>

<Footer />
<CartDrawer />

<MusicEngine />
<NowPlayingBar />
{#if barVisible}
	<!-- Reserve room so the fixed player never covers footer content. -->
	<div class="h-24" aria-hidden="true"></div>
{/if}
