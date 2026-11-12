<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import MixCover from './MixCover.svelte';
	import TrackRow from './TrackRow.svelte';
	import type { FeaturedPlaylist } from './soundcloud';

	let {
		playlist,
		label,
		title
	}: { playlist: FeaturedPlaylist | null; label: string; title: string } = $props();
</script>

<div class="w-full">
	<SectionHeading {label} {title} />
	<div class="mt-2 w-full">
		<MixCover mix={playlist} {title} />
	</div>
	{#if playlist && playlist.tracks.length > 0}
		<div class="mt-4 w-full">
			{#each playlist.tracks as track (track.permalinkUrl)}
				<TrackRow {track} />
			{/each}
		</div>
	{/if}
</div>
