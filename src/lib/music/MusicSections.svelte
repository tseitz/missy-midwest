<script lang="ts">
	import { onMount } from 'svelte';
	import type { FeaturedMix as FeaturedMixData } from './soundcloud';
	import { player } from './player.svelte';
	import FeaturedMix from './FeaturedMix.svelte';
	import LatestTrack from './LatestTrack.svelte';
	import CatalogList from './CatalogList.svelte';

	let { featuredMix }: { featuredMix: FeaturedMixData | null } = $props();

	onMount(() => {
		// Warm the engine after first paint so the catalog is ready when viewed,
		// without blocking the page render.
		const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
			.requestIdleCallback;
		if (ric) ric(() => player.warm());
		else setTimeout(() => player.warm(), 1200);
	});
</script>

<div class="flex w-full flex-col items-center">
	<!-- The two featured players sit side-by-side on desktop (a tidy 2-up that
	     keeps them card-sized) and stack on mobile. The grid shares the catalog's
	     narrow column so the whole page lines up. -->
	<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
		<div class="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
			<LatestTrack />
			<FeaturedMix {featuredMix} />
		</div>
	</section>
	<CatalogList />
</div>
