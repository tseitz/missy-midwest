<script lang="ts">
	import { resolve } from '$app/paths';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import { formatDate, formatDateTime } from '$lib/utils/date';
	import type { CalendarEvent } from '$lib/types/index';

	interface Props {
		events: CalendarEvent[];
	}
	let { events }: Props = $props();
</script>

<Section label="Live" title="Upcoming shows">
	{#snippet action()}
		<Button href={resolve('/shows')} label="All dates →" variant="outline" />
	{/snippet}

	{#if events.length > 0}
		<div class="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<!-- show.htmlLink is an external Google Calendar URL; resolve() is for internal routes only -->
			<!-- eslint-disable svelte/no-navigation-without-resolve -->
			{#each events as show (show.id)}
				<a
					href={show.htmlLink}
					target="_blank"
					rel="noopener noreferrer"
					class="group panel-glass glow-hover flex flex-col p-5"
				>
					<p class="text-lake-sunrise text-sm font-medium">
						{#if show.start.dateTime}{formatDateTime(show.start.dateTime)}{:else}{formatDate(
								show.start?.date || ''
							)}{/if}
					</p>
					<p class="missy-header mt-2 text-xl">{show.summary}</p>
					<p class="mt-1 text-xs opacity-65">{show.location}</p>
					<span
						class="text-missy-classic-lavender/70 group-hover:text-missy-classic-lavender mt-4 text-xs transition"
						>Details ↗</span
					>
				</a>
			{/each}
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</div>
	{:else}
		<p class="opacity-80">
			No scheduled shows right now — <a href={resolve('/contact')}>book Missy</a>.
		</p>
	{/if}
</Section>
