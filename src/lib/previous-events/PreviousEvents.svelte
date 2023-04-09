<script lang="ts">
	import Carousel from 'svelte-carousel';
	import { browser } from '$app/environment';

	export let dates: any;
	let innerWidth;

	$: particles = innerWidth > 1600 ? 3 : innerWidth > 1200 ? 2 : 1;
</script>

<svelte:window bind:innerWidth />

<div class="grid grid-cols-1 gap-10 text-slate-100 pb-12">
	<h3 class="text-slate-100 text-2xl mt-8 mb-4 md:mb-6 italic">Previous Events</h3>
	{#if browser}
		<Carousel
			autoplay
			duration={1000}
			autoplayDuration={4000}
			pauseOnFocus
			particlesToShow={particles}
			class="rounded-md"
		>
			{#each dates.pastDates as date, i}
				<div
					class="h-96 w-full bg-slate-100 flex flex-col justify-end {date.imageClasses &&
					date.imageClasses.length > 0
						? date.imageClasses.join(' ')
						: ''}"
					style="background: url({date.image}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
				>
					<div class="bg-slate-100 px-8 py-4 text-missy-500">
						<p class="text-2xl missy-header">{date.title}</p>
						<p class="text-lg">
							{date.localeDate}
						</p>
						<p class="text-sm">{date.venue}</p>
					</div>
				</div>
			{/each}
		</Carousel>
	{/if}
</div>
