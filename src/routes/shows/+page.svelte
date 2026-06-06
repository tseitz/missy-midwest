<script lang="ts">
	import UpcomingDates from '$lib/upcoming-dates/UpcomingDates.svelte';
	import PreviousEvents from '$lib/previous-events/PreviousEvents.svelte';
	import Seo from '$lib/seo/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo
	title="Shows — Missy Midwest"
	description="Upcoming Missy Midwest shows and highlights from past festival sets."
/>

<div class="flex w-full flex-col items-center">
	<UpcomingDates events={data.events} />
	<PreviousEvents />
</div>
