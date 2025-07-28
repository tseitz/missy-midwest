<script lang="ts">
	import { goto } from '$app/navigation';

	export let error: Error & { status?: number };
	export let status: number;

	$: errorMessage = error?.message || 'Something went wrong';
	$: is404 = status === 404 || status === undefined;

	console.log('Error object:', error);
	console.log('Status:', status);
	console.log('Is 404:', is404);

	function goHome() {
		goto('/');
	}
</script>

<svelte:head>
	<title>{is404 ? 'Page Not Found' : 'Error'} - Missy Midwest</title>
</svelte:head>

<main class="flex flex-col items-center w-full bg-missy-deep-purple">
	<div class="flex flex-col items-center justify-center flex-1 px-8 md:px-14 py-16 text-center">
		<div class="max-w-2xl mx-auto">
			{#if is404}
				<h1 class="text-6xl md:text-8xl font-bold text-missy-classic-lavender mb-6">404</h1>
				<h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Page Not Found</h2>
				<p class="text-xl text-gray-300 mb-8">
					Oops! The page you're looking for doesn't exist. Maybe it got lost in the music?
				</p>
			{:else}
				<h1 class="text-6xl md:text-8xl font-bold text-missy-classic-lavender mb-6">Error</h1>
				<h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Something Went Wrong</h2>
				<p class="text-xl text-gray-300 mb-8">
					{errorMessage}
				</p>
			{/if}

			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<button
					onclick={goHome}
					class="px-8 py-3 bg-transparent border-2 border-missy-classic-lavender text-missy-classic-lavender font-bold rounded-lg hover:bg-missy-classic-lavender hover:text-white transition-colors duration-200 hover:cursor-pointer"
				>
					Go Home
				</button>
				<button
					onclick={() => window.history.back()}
					class="px-8 py-3 bg-transparent border-2 border-missy-classic-lavender text-missy-classic-lavender font-bold rounded-lg hover:bg-missy-classic-lavender hover:text-white transition-colors duration-200 hover:cursor-pointer"
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
