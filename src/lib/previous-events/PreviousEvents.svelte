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

<section class="max-w-screen-2xl w-full px-8 md:px-14 py-16">
	<h3 class="missy-header text-2xl mb-6">Previous events</h3>
	<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
		{#each photos as slug (slug)}
			<img
				src={`/archive/gig-photos/${slug}.webp`}
				alt={`Missy Midwest live — ${slug.replaceAll('-', ' ')}`}
				loading="lazy"
				class="aspect-square w-full object-cover rounded-lg opacity-90 hover:opacity-100 transition-opacity"
			/>
		{/each}
	</div>
</section>
