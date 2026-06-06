<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import CartDrawer from '$lib/shop/CartDrawer.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<Header />

<main class="bg-missy-deep-purple flex min-h-screen w-full flex-col items-center pt-16">
	{@render children()}
</main>

<Footer />
<CartDrawer />
