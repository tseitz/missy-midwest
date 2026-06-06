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
	<LatestTrack />
	<FeaturedMix {featuredMix} />
	<CatalogList />
</div>
