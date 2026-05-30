<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	// Phase 3 swaps this gradient grid for the live Behold.so widget.
	const tiles = Array.from({ length: 6 });
</script>

<section class="max-w-screen-2xl w-full px-8 md:px-14 py-16">
	<div class="flex items-end justify-between">
		<SectionHeading label="@missy.midwest" title="From the feed" />
		<Button href="https://www.instagram.com/missy.midwest/" label="Follow →" variant="outline" />
	</div>
	<div class="grid grid-cols-3 md:grid-cols-6 gap-2.5 mt-2">
		{#each tiles as _, i (i)}
			<div
				class="aspect-square rounded-lg bg-gradient-to-br from-missy-neon-lavender to-missy-magenta opacity-80"
			></div>
		{/each}
	</div>
</section>
