<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { getPlayerStore } from './player-context';
	import TrackRow from './TrackRow.svelte';
	import SkeletonRows from './SkeletonRows.svelte';
	import SoundCloudLink from './SoundCloudLink.svelte';

	const player = getPlayerStore();
	// Latest track is featured separately; list the rest.
	const rest = $derived(player.tracks.slice(1));
</script>

<Section label="SoundCloud" title="The full catalog">
	<div class="mt-2 w-full max-w-3xl">
		{#if player.status === 'ready'}
			{#each rest as track (track.id)}
				<TrackRow {track} />
			{/each}
			<div class="mt-4"><SoundCloudLink /></div>
		{:else if player.status === 'error'}
			<p class="opacity-80">
				Browse everything on
				<a
					class="text-missy-blush"
					href="https://soundcloud.com/missymidwest"
					target="_blank"
					rel="noopener noreferrer">SoundCloud ↗</a
				>
			</p>
		{:else}
			<SkeletonRows rows={6} />
		{/if}
	</div>
</Section>
