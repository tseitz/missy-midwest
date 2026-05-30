<script lang="ts">
	import { formatDate, formatDateTime } from '$lib/utils/date';
	import type { CalendarEvent } from '$lib/types/index';

	interface Props {
		events: CalendarEvent[];
	}
	let { events }: Props = $props();
</script>

<section id="dates" class="w-full max-w-screen-2xl pt-12 pb-16 lg:pt-20">
	<h2 class="mb-8 text-4xl md:mb-12">Upcoming Dates</h2>
	{#if events.length > 0}<p class="mb-4 text-base md:mb-8 lg:text-xl">
			Click the event to add it to your calendar!
		</p>{/if}
	<div class="grid gap-10 lg:grid-cols-2 xl:grid-cols-3">
		{#if events.length > 0}
			<!-- show.htmlLink is an external Google Calendar URL; resolve() is for internal routes only -->
			<!-- eslint-disable svelte/no-navigation-without-resolve -->
			{#each events as show (show.id)}
				{#if show.attachments}
					<a
						href={show.htmlLink}
						target="_blank"
						rel="noopener noreferrer prefetch"
						class="event bg-missy-deep-purple hover:shadow-missy-classic-lavender/20 flex h-96 w-full flex-col justify-end rounded-md hover:shadow-lg"
						style="background: url(https://drive.google.com/thumbnail?id={show.attachments[0]
							.fileId}&sz=w1000) rgb(29, 35, 42) no-repeat center;background-size: cover;"
					>
						<div
							class="bg-missy-deep-purple/80 max-h-96 overflow-auto rounded-b-md px-8 py-4 backdrop-blur-md"
						>
							<p class="missy-header py-1 text-2xl">{show.summary}</p>
							{#if show.start.dateTime}
								<p class="text-violet-200">{formatDateTime(show.start.dateTime)}</p>
							{:else}
								<p class="text-violet-200">
									{formatDate(show.start?.date || '')} All Day
								</p>
							{/if}
							<p class="py-2 text-sm text-violet-50">{show.location}</p>
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
						class="event bg-missy-deep-purple hover:shadow-missy-classic-lavender/20 flex h-96 w-full flex-col justify-end rounded-md hover:shadow-lg"
					>
						<div
							class="bg-missy-deep-purple/80 max-h-96 overflow-auto rounded-md px-8 py-4 backdrop-blur-md"
						>
							<p class="missy-header py-1 text-2xl">{show.summary}</p>
							{#if show.start.dateTime}
								<p class="text-violet-200">{formatDateTime(show.start.dateTime)}</p>
							{:else}
								<p class="text-violet-200">{formatDate(show.start?.date || '')} All Day</p>
							{/if}
							<p class="py-2 text-sm">{show.location}</p>
							<!-- {#if show.description}
								<p class="text-sm" style="white-space: pre-line">{show.description}</p>
							{/if} -->
						</div>
					</a>
				{/if}
			{/each}
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
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
