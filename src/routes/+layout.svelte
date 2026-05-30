<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<Header />

<main class="flex flex-col items-center w-full min-h-screen bg-missy-deep-purple">
	{@render children()}
</main>

<Footer />
