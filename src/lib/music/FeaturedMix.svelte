<script lang="ts">
	import { asset } from '$app/paths';
	import Section from '$lib/components/Section.svelte';
	import { netlifyImage } from '$lib/utils/netlify-image';
	import PlayPauseIcon from './PlayPauseIcon.svelte';
	import { player } from './player.svelte';
	import type { FeaturedMix } from './soundcloud';

	let { featuredMix }: { featuredMix: FeaturedMix | null } = $props();

	const FALLBACK = asset('/press-kit/missy-midwest-artist-pic-render.webp');

	const cover = $derived(featuredMix ? featuredMix.artworkUrl : FALLBACK);
	const isThis = $derived(!!featuredMix && player.state.currentUrl === featuredMix.permalinkUrl);
	const playing = $derived(isThis && player.state.isPlaying);

	function onClick() {
		if (!featuredMix) return;
		if (isThis) player.toggle();
		else player.play(featuredMix.permalinkUrl);
	}
</script>

<Section label="Featured" title="Highlighted mix" reveal={false} width="narrow">
	<div class="mt-2 w-full">
		<button
			type="button"
			onclick={onClick}
			class="group bg-brand-wash relative block aspect-video w-full overflow-hidden rounded-xl"
			aria-label={playing ? 'Pause highlighted mix' : 'Play highlighted mix'}
		>
			<img
				src={featuredMix ? cover : netlifyImage(cover, { width: 1280 })}
				alt=""
				aria-hidden="true"
				class="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105"
			/>
			<span class="absolute inset-0 flex items-center justify-center">
				<span
					class="bg-missy-blush text-missy-ink flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl shadow-lg"
				>
					<PlayPauseIcon {playing} />
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
	</div>
</Section>
