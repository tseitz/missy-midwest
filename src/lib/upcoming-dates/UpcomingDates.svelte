<script lang="ts">
	// import PreviousEvents from '$lib/previous-events/PreviousEvents.svelte';
	import type { CalendarEvent } from '$lib/types/index';

	export let events: CalendarEvent[];

	// Helper function to get ordinal suffix
	function getOrdinalSuffix(day: number): string {
		if (day > 3 && day < 21) return 'th';
		switch (day % 10) {
			case 1:
				return 'st';
			case 2:
				return 'nd';
			case 3:
				return 'rd';
			default:
				return 'th';
		}
	}

	// Helper function to format dates as "Month Day, Year"
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const month = date.toLocaleDateString('en-US', { month: 'long' });
		const day = date.getDate();
		const year = date.getFullYear();
		const ordinal = getOrdinalSuffix(day);
		return `${month} ${day}${ordinal} ${year}`;
	}

	// Helper function to format date and time
	function formatDateTime(dateTimeString: string): string {
		const date = new Date(dateTimeString);
		const formattedDate = formatDate(dateTimeString);
		const time = date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
		return `${formattedDate} at ${time}`;
	}
</script>

<section id="dates" class="max-w-screen-2xl w-full pt-12 lg:pt-20 pb-16">
	<h2 class="text-4xl mb-8 md:mb-12">Upcoming Dates!</h2>
	<!-- <h3 class="text-2xl mb-4 md:mb-8">Featured Events</h3> -->
	<p class="text-xl mb-4 md:mb-8">Click the event to add it to your calendar!</p>
	<div class="grid xl:grid-cols-3 lg:grid-cols-2 gap-10">
		{#if events.length > 0}
			{#each events as show}
				{#if show.attachments}
					<a
						href={show.htmlLink}
						target="_blank"
						rel="noopener noreferrer prefetch"
						class="event h-96 w-full bg-missy-deep-purple rounded-md flex flex-col justify-end"
						style="background: url(https://drive.google.com/thumbnail?id={show.attachments[0]
							.fileId}&sz=w1000) rgb(29, 35, 42) no-repeat center;background-size: cover;"
					>
						<div
							class="bg-missy-deep-purple/80 backdrop-blur-md max-h-96 overflow-auto px-8 py-4 rounded-b-md"
						>
							<p class="text-2xl py-1 missy-header">{show.summary}</p>
							{#if show.start.dateTime}
								<p class="text-violet-200">{formatDateTime(show.start.dateTime)}</p>
							{:else}
								<p class="text-violet-200">
									{formatDate(show.start?.date || '')} All Day
								</p>
							{/if}
							<p class="text-sm py-2 text-violet-50">{show.location}</p>
							<!-- {#if show.description}
								<p class="text-sm" style="white-space: pre-line">{show.description}</p>
							{/if} -->
						</div>
					</a>
				{:else}
					<a
						href={show.htmlLink}
						target="_blank"
						rel="noopener noreferrer prefetch"
						class="event h-96 w-full bg-missy-deep-purple rounded-md flex flex-col justify-end"
					>
						<div
							class="bg-missy-deep-purple/80 backdrop-blur-md max-h-96 overflow-auto px-8 py-4 rounded-md"
						>
							<p class="text-2xl py-1 missy-header">{show.summary}</p>
							{#if show.start.dateTime}
								<p class="text-violet-200">{formatDateTime(show.start.dateTime)}</p>
							{:else}
								<p class="text-violet-200">{formatDate(show.start?.date || '')} All Day</p>
							{/if}
							<p class="text-sm py-2">{show.location}</p>
							<!-- {#if show.description}
								<p class="text-sm" style="white-space: pre-line">{show.description}</p>
							{/if} -->
						</div>
					</a>
				{/if}
			{/each}
		{:else}
			No scheduled events at this time. Use the contact form below to book Missy!
		{/if}
	</div>
	<!-- <PreviousEvents {events} /> -->
</section>

<style>
	.event:hover {
		transform: scale(1.02) rotate(-0.1deg);
		transition: transform 0.33s ease-out;
	}
</style>
