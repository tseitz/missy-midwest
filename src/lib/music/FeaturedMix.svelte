<script lang="ts">
	import { asset } from '$app/paths';
	import Section from '$lib/components/Section.svelte';
	import { netlifyImage } from '$lib/utils/netlify-image';
	import { getPlayerStore } from './player-context';
	import SoundCloudLink from './SoundCloudLink.svelte';
	import type { FeaturedMix } from '$lib/server/soundcloud';

	let { featuredMix }: { featuredMix: FeaturedMix | null } = $props();

	const FALLBACK = asset('/press-kit/missy-midwest-artist-pic-render.webp');
	const player = getPlayerStore();

	const cover = $derived(featuredMix ? featuredMix.artworkUrl : FALLBACK);
	const isThis = $derived(!!featuredMix && player.state.currentUrl === featuredMix.permalinkUrl);
	const playing = $derived(isThis && player.state.isPlaying);

	function onClick() {
		if (!featuredMix) return;
		if (isThis) player.toggle();
		else player.play(featuredMix.permalinkUrl);
	}
</script>

<Section label="Latest mix" title="Featured" reveal={false}>
	<div class="mt-2 w-full max-w-3xl">
		<button
			type="button"
			onclick={onClick}
			class="group from-missy-neon-lavender to-missy-magenta relative block aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br"
			aria-label={playing ? 'Pause latest mix' : 'Play latest mix'}
		>
			<img
				src={featuredMix ? netlifyImage(cover, { width: 1280 }) : cover}
				alt=""
				aria-hidden="true"
				class="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
			/>
			<span class="absolute inset-0 flex items-center justify-center">
				<span
					class="bg-missy-blush text-missy-ink flex h-16 w-16 items-center justify-center rounded-full text-2xl shadow-lg"
				>
					{playing ? '❚❚' : '►'}
				</span>
			</span>
			{#if featuredMix}
				<span
					class="bg-missy-deep-purple/85 absolute right-0 bottom-0 left-0 px-5 py-3 text-left backdrop-blur-md"
				>
					<span class="missy-header block text-xl">{featuredMix.title}</span>
				</span>
			{/if}
		</button>
		<div class="mt-2"><SoundCloudLink /></div>
	</div>
</Section>
