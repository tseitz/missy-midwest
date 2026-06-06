<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { getPlayerStore } from './player-context';

	const player = getPlayerStore();
	const track = $derived(player.tracks[0]);
	const isThis = $derived(!!track && player.state.currentUrl === track.permalinkUrl);
	const playing = $derived(isThis && player.state.isPlaying);
</script>

<Section label="Latest track" title="Newest upload" reveal={false}>
	<div class="mt-2 flex w-full max-w-3xl items-center gap-4">
		{#if player.status === 'ready' && track}
			<button
				type="button"
				onclick={() => (isThis ? player.toggle() : player.play(track.permalinkUrl))}
				class="bg-missy-blush text-missy-ink flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl"
				aria-label={playing ? 'Pause latest track' : 'Play latest track'}
				>{playing ? '❚❚' : '►'}</button
			>
			{#if track.artworkUrl}
				<img src={track.artworkUrl} alt="" class="h-20 w-20 rounded-lg object-cover" />
			{/if}
			<p class="missy-header text-lg">{track.title}</p>
		{:else if player.status === 'error'}
			<p class="opacity-80">
				New uploads live on
				<a
					class="text-missy-blush"
					href="https://soundcloud.com/missymidwest"
					target="_blank"
					rel="noopener noreferrer">SoundCloud ↗</a
				>
			</p>
		{:else}
			<div class="bg-missy-classic-lavender/10 h-20 w-full animate-pulse rounded-lg"></div>
		{/if}
	</div>
</Section>
