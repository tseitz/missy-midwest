<script lang="ts">
	import { resolve, asset } from '$app/paths';
	import Section from '$lib/components/Section.svelte';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';

	const genres = [
		'UKG',
		'House',
		'Hip-Hop',
		'Drum & Bass',
		'Pop',
		'140',
		'Country',
		'Afrobeats',
		'Club Classics'
	];
</script>

<Section id="bio">
	<div
		class="panel-glass glow-feature grid grid-cols-1 items-stretch gap-8 overflow-hidden lg:grid-cols-2 lg:gap-0"
	>
		<div class="lg:min-h-128">
			<picture class="contents">
				<source srcset={asset('/bio/missy-stairs.avif')} type="image/avif" />
				<img
					src={asset('/bio/missy-stairs.webp')}
					alt="Missy Midwest"
					loading="lazy"
					decoding="async"
					class="h-72 w-full object-cover sm:h-96 lg:h-full"
				/>
			</picture>
		</div>
		<div class="flex flex-col justify-center p-2 sm:p-6 lg:p-10">
			<SectionHeading label="ABOUT" title="Missy Midwest" />
			<p class="text-missy-secondary text-lg">✨ Music Artist &amp; Resident DJ ✨</p>
			<p class="mt-6 text-sm leading-relaxed text-missy-pearl/90 md:text-base">
				Hailing from the heart of IL, Missy Midwest is a resident DJ, music producer, and vocalist
				delivering divinely feminine energy, big hip-hop attitude, and unapologetic bad bitch bass.
			</p>
			<p class="mt-4 text-sm leading-relaxed text-missy-pearl/90 md:text-base">
				With residencies in Lake of the Ozarks, MO &amp; on the island of St. Croix, she brings
				feminine energy and versatility to every performance. She seamlessly blends genres like UKG,
				house, hip-hop, drum &amp; bass, pop, 140, country, afrobeats and timeless club classics to
				keep the dance floor alive.
			</p>
			<p class="mt-4 text-sm leading-relaxed text-missy-pearl/90 md:text-base">
				Her journey has been picking up speed as she released her first self-produced EP entitled
				"Bad Bitch Bass Vol. 1" on Halloween of 2026. She’s now taken her brand offshore to the
				island of St. Croix to fulfill a DJ residency with the goal of adding "international" to her
				resume.
			</p>
			<ul class="mt-6 flex flex-wrap gap-2">
				{#each genres as genre (genre)}
					<li
						class="rounded-full border border-missy-classic-lavender/30 px-3 py-1 text-xs tracking-wide text-missy-classic-lavender/90 uppercase"
					>
						{genre}
					</li>
				{/each}
			</ul>
			<div class="mt-8">
				<Button href={resolve('/contact')} label="Book Missy →" variant="fill" />
			</div>
		</div>
	</div>
</Section>
