<script context="module" lang="ts">
	export const prerender = true;
	import Music from '$lib/Music.svelte';
</script>

<script lang="ts">
	import About from '$lib/about/About.svelte';
	import PressKit from '$lib/PressKit.svelte';
	import UpcomingDates from '$lib/upcoming-dates/UpcomingDates.svelte';
	import Landing from '$lib/landing/Landing.svelte';
</script>

<svelte:head>
	<title>Missy Midwest</title>
</svelte:head>

<Landing />

<Music />

<UpcomingDates />

<About />

<PressKit />
