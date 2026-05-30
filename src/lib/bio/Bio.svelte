<script lang="ts">
	import { resolve, asset } from '$app/paths';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Button from '$lib/components/Button.svelte';
	import { reveal } from '$lib/motion/reveal';

	const genres = [
		'UKG',
		'House',
		'Hip-Hop',
		'Drum & Bass',
		'140 Deep Dub',
		'Pop',
		'Country',
		'Club Classics'
	];
</script>

<section id="bio" class="w-full max-w-screen-2xl px-8 py-16 md:px-14" use:reveal>
	<div
		class="panel-glass glow-feature grid grid-cols-1 items-stretch gap-8 overflow-hidden lg:grid-cols-2 lg:gap-0"
	>
		<div class="lg:min-h-128">
			<img
				src={asset('/bio/missy-stairs.webp')}
				alt="Missy Midwest"
				class="h-72 w-full object-cover sm:h-96 lg:h-full"
			/>
		</div>
		<div class="flex flex-col justify-center p-2 sm:p-6 lg:p-10">
			<SectionHeading label="ABOUT" title="Missy Midwest" />
			<p class="text-lg text-violet-200">✨ Music Artist &amp; Resident DJ ✨</p>
			<p class="mt-6 text-sm leading-relaxed text-missy-classic-lavender/90 md:text-base">
				Hailing from a melting pot of music, the Heart of IL, Missy Midwest (she/her) is a
				multitalented open-format DJ, vocalist, and music producer who has been captivating crowds
				since 2021. With a residency in Lake of the Ozarks, MO, she brings unmatched energy and
				versatility to every performance, seamlessly blending genres like UKG, house, hip-hop, drum
				and bass, 140 deep dub, pop, country, and timeless club classics to keep the dance floor
				alive.
			</p>
			<p class="mt-4 text-sm leading-relaxed text-missy-classic-lavender/90 md:text-base">
				Her journey has been picking up speed as she releases mixes and original tracks each month.
				As a vocalist and producer, Missy Midwest infuses her sets with original flair and takes
				pride in crafting immersive experiences tailored to each event. Ready to ignite the festival
				stages this fall, Missy Midwest is set to deliver performance after performance meant to
				induce confidence &amp; creative living.
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
</section>
