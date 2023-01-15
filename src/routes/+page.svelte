<script lang="ts">
	import Music from '$lib/Music.svelte';
	import Bio from '$lib/bio/Bio.svelte';
	import PressKit from '$lib/press-kit/PressKit.svelte';
	import UpcomingDates from '$lib/upcoming-dates/UpcomingDates.svelte';
	import Landing from '$lib/landing/Landing.svelte';
	import Contact from '$lib/contact/Contact.svelte';
	import Support from '$lib/support/Support.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Missy Midwest</title>
</svelte:head>

<Landing />

<div class="px-8 md:px-14">
	<Music />

	<Bio />

	<UpcomingDates dates={data} />

	<Contact />

	<Support />

	<PressKit />
</div>
