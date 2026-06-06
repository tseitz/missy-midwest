<script lang="ts">
	import { player } from './player.svelte';
	import { formatDuration } from './format-duration';
	import type { Track } from './soundcloud-player';

	let { track }: { track: Track } = $props();
	const isThis = $derived(player.state.currentUrl === track.permalinkUrl);
	const playing = $derived(isThis && player.state.isPlaying);
</script>

<button
	type="button"
	onclick={() => (isThis ? player.toggle() : player.play(track.permalinkUrl))}
	class="hover:bg-missy-plum/15 border-missy-classic-lavender/10 flex w-full items-center gap-4 border-t px-2 py-3 text-left"
	aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
>
	<span
		class="border-missy-classic-lavender/40 text-missy-classic-lavender flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs"
		class:bg-missy-blush={isThis}
		class:text-missy-ink={isThis}
	>
		{playing ? '❚❚' : '►'}
	</span>
	<span class="min-w-0 flex-1 truncate {isThis ? 'text-missy-pearl' : 'text-violet-100'}"
		>{track.title}</span
	>
	<span class="text-missy-classic-lavender shrink-0 text-xs opacity-70"
		>{formatDuration(track.durationMs)}</span
	>
</button>
