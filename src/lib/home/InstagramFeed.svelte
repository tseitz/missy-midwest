<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { reveal } from '$lib/motion/reveal';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	const feedId = env.PUBLIC_BEHOLD_FEED_ID;
	const tiles = Array.from({ length: 6 }, (_, i) => i);

	onMount(() => {
		if (!feedId) return;
		const src = 'https://w.behold.so/widget.js';
		if (document.querySelector(`script[src="${src}"]`)) return;
		const script = document.createElement('script');
		script.type = 'module';
		script.src = src;
		document.head.appendChild(script);
	});
</script>

<section use:reveal class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
	<div class="flex items-end justify-between">
		<SectionHeading label="@missy.midwest" title="From the feed" />
		<Button href="https://www.instagram.com/missy.midwest/" label="Follow →" variant="outline" />
	</div>
	{#if feedId}
		<div class="mt-2">
			<behold-widget feed-id={feedId}></behold-widget>
		</div>
	{:else}
		<div class="mt-2 grid grid-cols-3 gap-2.5 md:grid-cols-6">
			{#each tiles as i (i)}
				<div
					class="from-missy-neon-lavender to-missy-magenta aspect-square rounded-lg bg-gradient-to-br opacity-80"
				></div>
			{/each}
		</div>
	{/if}
</section>
