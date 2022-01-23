<script lang="ts">
	import Header from '$lib/header/Header.svelte';
	import '../app.css';
</script>

<Header />

<main class="flex-col w-full bg-missy-500">
	<slot />
</main>
