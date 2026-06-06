<script lang="ts">
	import { resolve } from '$app/paths';
	import { player } from './player.svelte';
	import { formatDuration } from './format-duration';
	import ProgressBar from './ProgressBar.svelte';

	const visible = $derived(player.state.currentUrl !== null);
	const playing = $derived(player.state.isPlaying);
</script>

{#if visible}
	<div
		class="border-missy-classic-lavender/15 bg-missy-deep-purple/90 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md"
		style="padding-bottom:env(safe-area-inset-bottom)"
	>
		<ProgressBar
			positionMs={player.state.positionMs}
			durationMs={player.state.durationMs}
			onSeek={(ms) => player.seek(ms)}
		/>
		<div class="mx-auto flex w-full max-w-screen-2xl items-center gap-3 px-4 py-3">
			<button
				type="button"
				onclick={() => player.toggle()}
				class="bg-missy-blush text-missy-ink flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg"
				aria-label={playing ? 'Pause' : 'Play'}
			>
				{playing ? '❚❚' : '►'}
			</button>
			{#if player.state.artworkUrl}
				<img
					src={player.state.artworkUrl}
					alt=""
					aria-hidden="true"
					class="h-10 w-10 shrink-0 rounded object-cover"
				/>
			{/if}
			<a href={resolve('/music')} class="text-missy-pearl min-w-0 flex-1 truncate text-sm">
				{player.state.title ?? 'Loading…'}
			</a>
			<span class="text-missy-classic-lavender shrink-0 text-xs tabular-nums opacity-80">
				{formatDuration(player.state.positionMs)} / {formatDuration(player.state.durationMs)}
			</span>
		</div>
	</div>
{/if}
