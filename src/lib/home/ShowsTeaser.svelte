<script lang="ts">
	import { resolve } from '$app/paths';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';
	import { formatDate, formatDateTime } from '$lib/utils/date';
	import type { CalendarEvent } from '$lib/types/index';

	interface Props {
		events: CalendarEvent[];
	}
	let { events }: Props = $props();
</script>

<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
	<div class="flex items-end justify-between">
		<SectionHeading label="Live" title="Upcoming shows" />
		<Button href={resolve('/shows')} label="All dates →" variant="outline" />
	</div>

	{#if events.length > 0}
		<div class="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<!-- show.htmlLink is an external Google Calendar URL; resolve() is for internal routes only -->
			<!-- eslint-disable svelte/no-navigation-without-resolve -->
			{#each events as show (show.id)}
				<a
					href={show.htmlLink}
					target="_blank"
					rel="noopener noreferrer"
					class="border-missy-classic-lavender/15 bg-missy-deep-purple/40 hover:shadow-missy-classic-lavender/20 block rounded-xl border p-5 hover:shadow-lg"
				>
					<p class="text-sm text-violet-200">
						{#if show.start.dateTime}{formatDateTime(show.start.dateTime)}{:else}{formatDate(
								show.start?.date || ''
							)}{/if}
					</p>
					<p class="missy-header mt-2 text-xl">{show.summary}</p>
					<p class="mt-1 text-xs opacity-65">{show.location}</p>
				</a>
			{/each}
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</div>
	{:else}
		<p class="opacity-80">
			No scheduled shows right now — <a href={resolve('/contact')}>book Missy</a>.
		</p>
	{/if}
</section>
