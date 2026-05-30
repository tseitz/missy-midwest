<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	const errorMessage = $derived(page.error?.message || 'Something went wrong');
	const is404 = $derived(page.status === 404);

	function goHome() {
		goto(resolve('/'));
	}
</script>

<svelte:head>
	<title>{is404 ? 'Page Not Found' : 'Error'} - Missy Midwest</title>
</svelte:head>

<main class="bg-missy-deep-purple flex w-full flex-col items-center">
	<div class="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center md:px-14">
		<div class="mx-auto max-w-2xl">
			{#if is404}
				<h1 class="text-missy-classic-lavender mb-6 text-6xl font-bold md:text-8xl">404</h1>
				<h2 class="mb-4 text-3xl font-bold text-white md:text-4xl">Page Not Found</h2>
				<p class="mb-8 text-xl text-gray-300">
					Oops! The page you're looking for doesn't exist. Maybe it got lost in the music?
				</p>
			{:else}
				<h1 class="text-missy-classic-lavender mb-6 text-6xl font-bold md:text-8xl">Error</h1>
				<h2 class="mb-4 text-3xl font-bold text-white md:text-4xl">Something Went Wrong</h2>
				<p class="mb-8 text-xl text-gray-300">
					{errorMessage}
				</p>
			{/if}

			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<button
					onclick={goHome}
					class="border-missy-classic-lavender text-missy-classic-lavender hover:bg-missy-classic-lavender rounded-lg border-2 bg-transparent px-8 py-3 font-bold transition-colors duration-200 hover:cursor-pointer hover:text-white"
				>
					Go Home
				</button>
				<button
					onclick={() => window.history.back()}
					class="border-missy-classic-lavender text-missy-classic-lavender hover:bg-missy-classic-lavender rounded-lg border-2 bg-transparent px-8 py-3 font-bold transition-colors duration-200 hover:cursor-pointer hover:text-white"
				>
					Go Back
				</button>
			</div>
		</div>
	</div>
</main>

<style>
	main {
		height: calc(100vh - 4rem);
	}
</style>
