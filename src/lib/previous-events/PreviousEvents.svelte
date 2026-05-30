<script lang="ts">
	// Curated past-gig photos already in /static/archive/gig-photos
	const photos = [
		'electric-forest',
		'backwoods-2023',
		'camp-taco',
		'united-groove',
		'her-set-her-sound',
		'paradise',
		'neon-taco',
		'tuckers-shuckers'
	];
</script>

<section class="w-full max-w-screen-2xl px-8 py-16 md:px-14">
	<h3 class="missy-header mb-6 text-2xl">Previous events</h3>
	<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
		{#each photos as slug (slug)}
			<img
				src={`/archive/gig-photos/${slug}.webp`}
				alt={`Missy Midwest live — ${slug.replaceAll('-', ' ')}`}
				loading="lazy"
				class="aspect-square w-full rounded-lg object-cover opacity-90 transition-opacity hover:opacity-100"
			/>
		{/each}
	</div>
</section>
