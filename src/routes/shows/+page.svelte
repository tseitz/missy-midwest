<script lang="ts">
	import UpcomingDates from '$lib/upcoming-dates/UpcomingDates.svelte';
	import PreviousEvents from '$lib/previous-events/PreviousEvents.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Shows — Missy Midwest</title>
</svelte:head>

<div class="w-full flex flex-col items-center">
	<UpcomingDates events={data.events} />
	<PreviousEvents />
</div>
