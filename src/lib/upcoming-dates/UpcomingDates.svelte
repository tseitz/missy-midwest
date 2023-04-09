<script lang="ts">
	import PreviousEvents from '$lib/previous-events/PreviousEvents.svelte';

	export let dates: any;
</script>

<section id="dates" class="max-w-screen-2xl w-full pt-20 pb-16">
	<h2 class="text-slate-100 text-4xl mb-8 md:mb-12 italic">Upcoming Dates!</h2>
	<h3 class="text-slate-100 text-2xl mb-4 md:mb-8 italic">Featured Events</h3>
	<div class="grid xl:grid-cols-3 lg:grid-cols-2 gap-10 text-slate-100 pb-12">
		{#if dates.featuredDates.length > 0}
			{#each dates.featuredDates as featuredShow}
				{@const date = featuredShow.dateTime ? new Date(featuredShow.dateTime) : null}
				{#if featuredShow.link}
					<a
						href={featuredShow.link}
						target="_blank"
						rel="noopener noreferrer prefetch"
						class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end {featuredShow.imageClasses &&
						featuredShow.imageClasses.length > 0
							? featuredShow.imageClasses.join(' ')
							: ''}"
						style="background: url({featuredShow.image}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
					>
						<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
							<p class="text-2xl missy-header">{featuredShow.title}</p>
							{#if featuredShow.dateString}
								<p class="text-md">{featuredShow.dateString}</p>
							{:else}
								<p class="text-md">{featuredShow.localeDate} @ {featuredShow.localeTime}</p>
							{/if}
							<p class="text-sm">{featuredShow.venue}</p>
							<p class="text-sm">{featuredShow.address}</p>
						</div>
					</a>
				{:else}
					<div
						class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
						style="background: url({featuredShow.image}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
					>
						<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
							<p class="text-2xl missy-header">{featuredShow.title}</p>
							{#if featuredShow.dateString}
								<p class="text-md">{featuredShow.dateString}</p>
							{:else}
								<p class="text-md">{featuredShow.localeDate} @ {featuredShow.localeTime}</p>
							{/if}
							<p class="text-sm">{featuredShow.venue}</p>
							<p class="text-sm">{featuredShow.address}</p>
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
	<div class="grid xl:grid-cols-3 lg:grid-cols-2 gap-10 text-slate-100">
		{#if dates.upcomingDates.length > 0}
			{#each dates.upcomingDates as show}
				{#if show.link}
					<a
						href={show.link}
						target="_blank"
						rel="noopener noreferrer prefetch"
						class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end {show.imageClasses &&
						show.imageClasses.length > 0
							? show.imageClasses.join(' ')
							: ''}"
						style="background: url({show.image}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
					>
						<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
							<p class="text-2xl missy-header">{show.title}</p>
							{#if show.dateString}
								<p class="text-md">{show.dateString}</p>
							{:else}
								<p class="text-md">{show.localeDate} @ {show.localeTime}</p>
							{/if}
							<p class="text-sm">{show.venue}</p>
							<p class="text-sm">{show.address}</p>
						</div>
					</a>
				{:else}
					<div
						class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end {show.imageClasses &&
						show.imageClasses.length > 0
							? show.imageClasses.join(' ')
							: ''}"
						style="background: url({show.image}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
					>
						<div class="bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
							<p class="text-2xl missy-header">{show.title}</p>
							{#if show.dateString}
								<p class="text-md">{show.dateString}</p>
							{:else}
								<p class="text-md">{show.localeDate} @ {show.localeTime}</p>
							{/if}
							<p class="text-sm">{show.venue}</p>
							<p class="text-sm">{show.address}</p>
						</div>
					</div>
				{/if}
			{/each}
		{:else}
			No scheduled events at this time. Use the contact form below to book Missy!
		{/if}
	</div>
	<PreviousEvents {dates} />
</section>

<style>
	.event:hover {
		transform: scale(1.02) rotate(-0.1deg);
		transition: transform 0.33s ease-out;
	}
</style>
