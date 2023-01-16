<script lang="ts">
	export let dates: any;
</script>

<section id="dates" class="max-w-screen-2xl w-full pt-20 pb-16">
	<h2 class="text-slate-100 text-4xl mb-8 md:mb-12 italic">Upcoming Dates!</h2>
	<div class="grid xl:grid-cols-3 lg:grid-cols-2 gap-10 text-slate-100">
		{#if dates.upcomingDates.length > 0}
			{#each dates.upcomingDates as show}
				{@const date = new Date(show.dateTime)}
				{#if show.link}
					<a
						href={show.link}
						target="_blank"
						rel="noopener noreferrer prefetch"
						class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end {show.imageClasses &&
						show.imageClasses.length > 0
							? show.imageClasses
							: ''}"
						style="background: url({show.image}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
					>
						<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
							<p class="text-2xl missy-header">{show.title}</p>
							<p class="text-md">{date.toLocaleDateString()} @ {date.toLocaleTimeString()}</p>
							<p class="text-sm">{show.venue}</p>
							<p class="text-sm">{show.address}</p>
						</div>
					</a>
				{:else}
					<div
						class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end {show.imageClasses &&
						show.imageClasses.length > 0
							? show.imageClasses
							: ''}"
						style="background: url({show.image}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
					>
						<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
							<p class="text-2xl missy-header">{show.title}</p>
							<p class="text-md">{date.toLocaleDateString()} @ {date.toLocaleTimeString()}</p>
							<p class="text-sm">{show.venue}</p>
							<p class="text-sm">{show.address}</p>
						</div>
					</div>
				{/if}
			{/each}
		{:else}
			No scheduled events at this time. Use the contact form below to book Missy!
		{/if}
		<!-- <div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background: url({faucette}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;background-position:bottom"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">Faucette Festival</p>
				<p class="text-md">Saturday, October 22nd 12-8pm</p>
				<p class="text-sm">Faucette Park</p>
				<p class="text-sm">100 Riverfront Pl, North Little Rock, AR 72114</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background: url({halloween}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;background-position:top"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">Missy Mix: The Spooky Special Vol. II</p>
				<p class="text-md">Monday, October 24th</p>
				<p class="text-sm">Soundcloud</p>
			</div>
		</div> -->
		<!-- <div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background: url('./gig-photos/backwoods.webp') rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">Backwoods On The Road Tour</p>
				<p class="text-lg">Friday, October 28th 8pm-12am</p>
				<p class="text-sm">Stickyz Rock'n'Roll Chicken</p>
				<p class="text-sm">107 River Market Ave, Little Rock, AR 72201</p>
			</div>
		</div> -->
		<!-- <div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({anniversary});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">Missy Mix: 1 Year Anniversary!</p>
				<p class="text-md">Friday, November 4th</p>
				<p class="text-sm">Soundcloud</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({subSessions});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:top;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">SUB SESSIONS</p>
				<p class="text-md">Saturday, November 5th 9pm</p>
				<p class="text-sm">Hopkins Icehouse</p>
				<p class="text-sm">301 E 3rd St, Texarkana, AR 71854</p>
			</div>
		</div> -->
	</div>
</section>

<style>
	.event:hover {
		transform: scale(1.02) rotate(-0.1deg);
		transition: transform 0.33s ease-out;
	}
</style>
