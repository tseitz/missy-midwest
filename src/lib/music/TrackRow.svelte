<script lang="ts">
	import { player } from './player.svelte';
	import { formatDuration } from './format-duration';
	import type { Track } from './soundcloud-player';

	let { track }: { track: Pick<Track, 'title' | 'permalinkUrl'> & { durationMs?: number } } =
		$props();
	const isThis = $derived(player.state.currentUrl === track.permalinkUrl);
	const playing = $derived(isThis && player.state.isPlaying);
</script>

<button
	type="button"
	onclick={() => (isThis ? player.toggle() : player.play(track.permalinkUrl))}
	class="hover:bg-surface-sunken border-trim/10 flex w-full items-center gap-4 border-t px-2 py-3 text-left"
	aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
>
	<span
		class={[
			'border-trim/40 text-trim flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs',
			{ 'bg-accent text-on-accent': isThis }
		]}
	>
		{playing ? '❚❚' : '►'}
	</span>
	<span class="min-w-0 flex-1 truncate {isThis ? 'text-fg' : 'text-fg-secondary'}"
		>{track.title}</span
	>
	{#if track.durationMs !== undefined}
		<span class="text-fg-muted shrink-0 text-xs">{formatDuration(track.durationMs)}</span>
	{/if}
</button>
