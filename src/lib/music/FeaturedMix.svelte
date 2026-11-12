<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import MixCover from './MixCover.svelte';
	import type { FeaturedMix } from './soundcloud';

	let {
		featuredMix,
		label,
		title
	}: { featuredMix: FeaturedMix | null; label: string; title: string } = $props();
</script>

<div class="w-full">
	<SectionHeading {label} {title} />
	<div class="mt-2 w-full">
		<MixCover mix={featuredMix} {title} />
	</div>
</div>
