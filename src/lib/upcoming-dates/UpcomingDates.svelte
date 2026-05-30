<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { resolve } from '$app/paths';
	import {
		eventStartDate,
		formatWeekdayShort,
		formatTime,
		formatDateTime,
		formatDate,
		groupEventsByMonth
	} from '$lib/utils/date';
	import type { CalendarEvent } from '$lib/types/index';

	interface Props {
		events: CalendarEvent[];
	}
	let { events }: Props = $props();

	// The next one or two shows are featured poster-forward; the rest become a
	// month-grouped agenda. The feed already arrives sorted ascending by start.
	const featured = $derived(events.slice(0, 2));
	const months = $derived(groupEventsByMonth(events.slice(2), (event) => event.start));

	/** Google Drive poster thumbnail, or null to fall back to the brand gradient. */
	function posterUrl(event: CalendarEvent): string | null {
		const fileId = event.attachments?.[0]?.fileId;
		return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000` : null;
	}

	function dayNumber(event: CalendarEvent): string {
		const date = eventStartDate(event.start);
		return date ? String(date.getDate()) : '';
	}

	function weekday(event: CalendarEvent): string {
		const date = eventStartDate(event.start);
		return date ? formatWeekdayShort(date) : '';
	}

	/** Full human date line, e.g. "June 14th 2026 at 8:00 PM" or "June 14th 2026 · All Day". */
	function fullDate(event: CalendarEvent): string {
		if (event.start.dateTime) return formatDateTime(event.start.dateTime);
		if (event.start.date) return `${formatDate(event.start.date)} · All Day`;
		return '';
	}

	function timeLabel(event: CalendarEvent): string {
		return event.start.dateTime ? formatTime(event.start.dateTime) : 'All Day';
	}
</script>

<Section id="dates" label="Live" title="Upcoming shows" reveal={false}>
	{#if events.length === 0}
		<p class="mt-2 opacity-80">
			No scheduled shows right now — <a href={resolve('/contact')}>book Missy</a>.
		</p>
	{:else}
		<p class="mt-2 opacity-80">Tap any show to add it to your calendar.</p>

		<!-- event.htmlLink is an external Google Calendar URL; resolve() is for internal routes only -->
		<!-- eslint-disable svelte/no-navigation-without-resolve -->

		<!-- Featured: the next one or two shows, poster-forward -->
		<div class="mt-6 grid gap-5 sm:grid-cols-2">
			{#each featured as event (event.id)}
				{@const poster = posterUrl(event)}
				<a
					href={event.htmlLink}
					target="_blank"
					rel="noopener noreferrer"
					class="group from-missy-neon-lavender to-missy-magenta hover:shadow-missy-magenta/20 relative flex h-80 flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br transition hover:shadow-lg"
				>
					{#if poster}
						<div
							class="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
							style="background-image: url({poster})"
						></div>
					{/if}
					<div
						class="absolute top-3 left-3 rounded-lg bg-black/40 px-3 py-1.5 text-center leading-none backdrop-blur-sm"
					>
						<span class="font-cochin block text-2xl font-semibold text-white"
							>{dayNumber(event)}</span
						>
						<span class="block text-xs tracking-widest text-white/85">{weekday(event)}</span>
					</div>
					<div class="bg-missy-deep-purple/85 relative px-6 py-4 backdrop-blur-md">
						<p class="missy-header text-2xl">{event.summary}</p>
						<p class="mt-1 text-sm text-violet-200">{fullDate(event)}</p>
						{#if event.location}<p class="mt-1 text-xs opacity-70">{event.location}</p>{/if}
					</div>
				</a>
			{/each}
		</div>

		<!-- Agenda: the remaining shows, grouped by month -->
		{#each months as group (group.label)}
			<div class="mt-10">
				<p class="label-eyebrow">{group.label}</p>
				<ul class="mt-2">
					{#each group.events as event (event.id)}
						<li>
							<a
								href={event.htmlLink}
								target="_blank"
								rel="noopener noreferrer"
								class="border-missy-classic-lavender/15 hover:bg-missy-plum/15 flex items-center gap-4 rounded-lg border-t px-2 py-4 sm:gap-5"
							>
								<div class="text-missy-classic-lavender w-12 shrink-0 text-center leading-none">
									<span class="missy-header block text-2xl">{dayNumber(event)}</span>
									<span class="block text-xs tracking-widest opacity-70">{weekday(event)}</span>
								</div>
								<div
									class="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
								>
									<div class="min-w-0">
										<p class="missy-header text-xl">{event.summary}</p>
										{#if event.location}<p
												class="mt-0.5 truncate text-sm text-violet-200 opacity-90"
											>
												{event.location}
											</p>{/if}
									</div>
									<div
										class="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-0.5 sm:text-right"
									>
										<span class="text-sm text-violet-100">{timeLabel(event)}</span>
										<span class="text-lake-sunrise text-xs">Add to calendar ↗</span>
									</div>
								</div>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}

		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	{/if}
</Section>
