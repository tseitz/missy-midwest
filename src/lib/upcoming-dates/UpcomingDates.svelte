<script lang="ts">
	// import PreviousEvents from '$lib/previous-events/PreviousEvents.svelte';
	import type { CalendarEvent } from '$lib/types/index';

	export let events: CalendarEvent[];
</script>

<section id="dates" class="max-w-screen-2xl w-full pt-20 pb-16">
	<h2 class="text-slate-100 text-4xl mb-8 md:mb-12 italic">Upcoming Dates!</h2>
	<h3 class="text-slate-100 text-2xl mb-4 md:mb-8 italic">Featured Events</h3>
	<div class="grid xl:grid-cols-3 lg:grid-cols-2 gap-10 text-slate-100">
		{#if events.length > 0}
			{#each events as show}
				{#if show.attachments}
					<a
						href={show.htmlLink}
						target="_blank"
						rel="noopener noreferrer prefetch"
						class="event h-96 overflow-scroll w-full bg-slate-100 rounded-md flex flex-col justify-end"
						style="background: url(https://drive.google.com/uc?id={show.attachments[0]
							.fileId}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
					>
						<div
							class="bg-slate-100 max-h-96 overflow-scroll px-8 py-4 rounded-b-md text-missy-500"
						>
							<p class="text-2xl missy-header">{show.summary}</p>
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
						class="event h-96 overflow-scroll w-full bg-slate-100 rounded-md flex flex-col justify-end"
					>
						<div class="bg-slate-100 max-h-96 overflow-scroll px-8 py-4 rounded-md text-missy-500">
							<p class="text-2xl missy-header">{show.summary}</p>
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
