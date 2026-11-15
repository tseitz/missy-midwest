<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import CartDrawer from '$lib/shop/CartDrawer.svelte';
	import MusicEngine from '$lib/music/MusicEngine.svelte';
	import NowPlayingBar from '$lib/music/NowPlayingBar.svelte';
	import { player } from '$lib/music/player.svelte';
	import { beforeNavigate, onNavigate } from '$app/navigation';
	import { updated } from '$app/state';
	import '../app.css';

	let { children } = $props();
	const barVisible = $derived(player.state.currentUrl !== null);

	// When a new app version has been deployed, force a full-page navigation so the
	// browser fetches the fresh hashed chunks instead of failing to import a stale,
	// now-missing chunk ("Importing a module script failed").
	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) {
			location.href = to.url.href;
		}
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<Header />

<main class="bg-surface flex min-h-screen w-full flex-col items-center pt-16">
	{@render children()}
</main>

<Footer />
<CartDrawer />

<MusicEngine />
<NowPlayingBar />
{#if barVisible}
	<!-- Reserve room so the fixed player never covers footer content. -->
	<div class="tone-sea bg-surface-deep h-24" aria-hidden="true"></div>
{/if}
