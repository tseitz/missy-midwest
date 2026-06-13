<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import { player } from './player.svelte';
	import PlayPauseIcon from './PlayPauseIcon.svelte';

	const track = $derived(player.tracks[0]);
	const isThis = $derived(!!track && player.state.currentUrl === track.permalinkUrl);
	const playing = $derived(isThis && player.state.isPlaying);

	function onClick() {
		if (!track) return;
		if (isThis) player.toggle();
		else player.play(track.permalinkUrl);
	}
</script>

<div class="w-full">
	<SectionHeading label="Latest track" title="Newest upload" />
	<div class="mt-2 w-full">
		{#if player.status === 'ready' && track}
			<button
				type="button"
				onclick={onClick}
				class="group bg-brand-wash relative block aspect-video w-full overflow-hidden rounded-xl"
				aria-label={playing ? 'Pause newest upload' : 'Play newest upload'}
			>
				{#if track.artworkUrl}
					<img
						src={track.artworkUrl}
						alt=""
						aria-hidden="true"
						class="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
					/>
				{/if}
				<span class="absolute inset-0 flex items-center justify-center">
					<span
						class="bg-missy-blush text-missy-ink flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl shadow-lg"
					>
						<PlayPauseIcon {playing} />
					</span>
				</span>
				<span
					class="bg-missy-deep-purple/85 absolute right-0 bottom-0 left-0 px-5 py-3 text-left backdrop-blur-md"
				>
					<span class="missy-header block text-xl">{track.title}</span>
				</span>
			</button>
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
			<div class="bg-missy-classic-lavender/10 aspect-video w-full animate-pulse rounded-xl"></div>
		{/if}
	</div>
</div>
