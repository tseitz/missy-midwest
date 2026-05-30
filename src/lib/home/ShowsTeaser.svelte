<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';
	import { formatDate, formatDateTime } from '$lib/utils/date';
	import type { CalendarEvent } from '$lib/types/index';

	interface Props {
		events: CalendarEvent[];
	}
	let { events }: Props = $props();
</script>

<section class="max-w-screen-2xl w-full px-8 md:px-14 py-16">
	<div class="flex items-end justify-between">
		<SectionHeading label="Live" title="Upcoming shows" />
		<Button href="/shows" label="All dates →" variant="outline" />
	</div>

	{#if events.length > 0}
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-2">
			{#each events as show (show.id)}
				<a
					href={show.htmlLink}
					target="_blank"
					rel="noopener noreferrer"
					class="block rounded-xl border border-missy-classic-lavender/15 bg-missy-deep-purple/40 p-5 hover:shadow-lg hover:shadow-missy-classic-lavender/20"
				>
					<p class="text-violet-200 text-sm">
						{#if show.start.dateTime}{formatDateTime(show.start.dateTime)}{:else}{formatDate(
								show.start?.date || ''
							)}{/if}
					</p>
					<p class="missy-header text-xl mt-2">{show.summary}</p>
					<p class="text-xs opacity-65 mt-1">{show.location}</p>
				</a>
			{/each}
		</div>
	{:else}
		<p class="opacity-80">No scheduled shows right now — <a href="/contact">book Missy</a>.</p>
	{/if}
</section>
