<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';

	const events = [
		{ slug: 'electric-forest', caption: 'Electric Forest' },
		{ slug: 'backwoods-2023', caption: 'Backwoods 2023' },
		{ slug: 'camp-taco', caption: 'Camp Taco' },
		{ slug: 'united-groove', caption: 'United Groove' },
		{ slug: 'her-set-her-sound', caption: 'Her Set Her Sound' },
		{ slug: 'paradise', caption: 'Paradise' },
		{ slug: 'neon-taco', caption: 'Neon Taco' },
		{ slug: 'tuckers-shuckers', caption: "Tucker's Shuckers" }
	];
	const photos = events.map((event) => ({
		src: `/archive/gig-photos/${event.slug}.webp`,
		caption: event.caption
	}));

	let open = $state<number | null>(null);
</script>

<Section reveal={false} width="narrow">
	<h3 class="missy-header mb-6 text-2xl">Previous events</h3>
	<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
		{#each photos as photo, i (photo.src)}
			<button
				type="button"
				aria-label={`View ${photo.caption}`}
				onclick={() => (open = i)}
				class="group block overflow-hidden rounded-xl"
			>
				<img
					src={photo.src}
					alt={`Missy Midwest live — ${photo.caption}`}
					loading="lazy"
					class="aspect-square w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
				/>
			</button>
		{/each}
	</div>
</Section>

<Lightbox
	{photos}
	index={open}
	onClose={() => (open = null)}
	onNavigate={(next) => (open = next)}
/>
