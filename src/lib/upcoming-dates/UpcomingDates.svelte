<script lang="ts">
	import { formatDate, formatDateTime } from '$lib/utils/date';
	import type { CalendarEvent } from '$lib/types/index';

	interface Props {
		events: CalendarEvent[];
	}
	let { events }: Props = $props();
</script>

<section id="dates" class="max-w-screen-2xl w-full pt-12 lg:pt-20 pb-16">
	<h2 class="text-4xl mb-8 md:mb-12">Upcoming Dates</h2>
	{#if events.length > 0}<p class="text-base lg:text-xl mb-4 md:mb-8">
			Click the event to add it to your calendar!
		</p>{/if}
	<div class="grid xl:grid-cols-3 lg:grid-cols-2 gap-10">
		{#if events.length > 0}
			{#each events as show (show.id)}
				{#if show.attachments}
					<a
						href={show.htmlLink}
						target="_blank"
						rel="noopener noreferrer prefetch"
						class="event h-96 w-full bg-missy-deep-purple rounded-md flex flex-col justify-end hover:shadow-lg hover:shadow-missy-classic-lavender/20"
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
						class="event h-96 w-full bg-missy-deep-purple rounded-md flex flex-col justify-end hover:shadow-lg hover:shadow-missy-classic-lavender/20"
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
		transition: all 0.33s ease-out;
	}
</style>
