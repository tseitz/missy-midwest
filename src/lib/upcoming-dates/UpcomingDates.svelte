<script lang="ts">
	// import PreviousEvents from '$lib/previous-events/PreviousEvents.svelte';
	import type { CalendarEvent } from '$lib/types/index';

	export let events: CalendarEvent[];
</script>

<section id="dates" class="max-w-screen-2xl w-full pt-12 lg:pt-20 pb-16">
	<h2 class="text-secondary text-4xl mb-8 md:mb-12 italic">Upcoming Dates!</h2>
	<!-- <h3 class="text-base-content text-2xl mb-4 md:mb-8 italic">Featured Events</h3> -->
	<div class="grid xl:grid-cols-3 lg:grid-cols-2 gap-10 text-secondary">
		{#if events.length > 0}
			{#each events as show}
				{#if show.attachments}
					<a
						href={show.htmlLink}
						target="_blank"
						rel="noopener noreferrer prefetch"
						class="event h-96 w-full bg-neutral rounded-md flex flex-col justify-end"
						style="background: url(https://drive.google.com/uc?id={show.attachments[0]
							.fileId}) rgb(29, 35, 42) no-repeat top;opacity:0.98;background-size: 100%;"
					>
						<div class="bg-neutral max-h-96 overflow-auto px-8 py-4 rounded-b-md text-base-content">
							<p class="text-2xl missy-header text-secondary">{show.summary}</p>
							{#if show.start.dateTime}
								<p class="text-md">{new Date(show.start.dateTime).toLocaleString()}</p>
							{:else}
								<p class="text-md">{show.start.date} - {show.end.date}</p>
							{/if}
							<p class="text-sm">{show.location}</p>
							{#if show.description}
								<p class="text-sm" style="white-space: pre-line">{show.description}</p>
							{/if}
						</div>
					</a>
				{:else}
					<a
						href={show.htmlLink}
						target="_blank"
						rel="noopener noreferrer prefetch"
						class="event h-96 w-full bg-neutral rounded-md flex flex-col justify-end"
					>
						<div class="bg-neutral max-h-96 overflow-auto px-8 py-4 rounded-md text-base-content">
							<p class="text-2xl missy-header text-secondary">{show.summary}</p>
							{#if show.start.dateTime}
								<p class="text-md">{new Date(show.start.dateTime).toLocaleString()}</p>
							{:else}
								<p class="text-md">{show.start.date} - {show.end.date}</p>
							{/if}
							<p class="text-sm">{show.location}</p>
							{#if show.description}
								<p class="text-sm" style="white-space: pre-line">{show.description}</p>
							{/if}
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
