<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import Music from '$lib/Music.svelte';
	import About from '$lib/about/About.svelte';
	import PressKit from '$lib/press-kit/PressKit.svelte';
	import UpcomingDates from '$lib/upcoming-dates/UpcomingDates.svelte';
	import Landing from '$lib/landing/Landing.svelte';
</script>

<svelte:head>
	<title>Missy Midwest</title>
</svelte:head>

<Landing />

<div class="px-8 md:px-14">
	<Music />

	<UpcomingDates />

	<About />

	<PressKit />
</div>
