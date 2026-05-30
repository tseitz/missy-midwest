<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	// Phase 3 swaps this gradient grid for the live Behold.so widget.
	const tiles = Array.from({ length: 6 }, (_, i) => i);
</script>

<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
	<div class="flex items-end justify-between">
		<SectionHeading label="@missy.midwest" title="From the feed" />
		<Button href="https://www.instagram.com/missy.midwest/" label="Follow →" variant="outline" />
	</div>
	<div class="mt-2 grid grid-cols-3 gap-2.5 md:grid-cols-6">
		{#each tiles as i (i)}
			<div
				class="from-missy-neon-lavender to-missy-magenta aspect-square rounded-lg bg-gradient-to-br opacity-80"
			></div>
		{/each}
	</div>
</section>
