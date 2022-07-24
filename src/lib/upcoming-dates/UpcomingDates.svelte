<script lang="ts">
	import westAndWatson from './images/west-and-watson.webp';
	import frankyAndLouies from './images/franky-and-louies.webp';
	import neonTaco from './images/neon-taco.webp';
	import paradise from './images/paradise.webp';
	import islandParty from './images/island-party.webp';
	import unitedGroove from './images/united-groove.webp';
</script>

<section id="dates" class="max-w-screen-2xl w-full pt-20 pb-16">
	<h2 class="text-slate-100 text-4xl mb-8 md:mb-12 italic">Upcoming Dates!</h2>
	<div class="grid xl:grid-cols-3 lg:grid-cols-2 gap-10">
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background: url({westAndWatson}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">West & Watson Open Decks</p>
				<p class="text-md">Thursday, July 28th 9pm-12am</p>
				<p class="text-sm">326 N West Ave STE 4, Fayetteville, AR 72701</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background: url({frankyAndLouies}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">Franky & Louie's</p>
				<p class="text-md">Saturday, July 30th 1pm-5pm</p>
				<p class="text-sm">Franky & Louie's 1028 Deer Valley Rd, Sunrise Beach, MO 65079</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({neonTaco});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">Neon Taco</p>
				<p class="text-md">Sunday, July 31st 9am-12pm</p>
				<p class="text-sm">1076 Bagnell Dam Blvd, Lake Ozark, MO 65049</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({paradise});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">Paradise</p>
				<p class="text-md">Sunday, June 12th 1pm-5pm</p>
				<p class="text-sm">430 Tropical Trail Rd, Sunrise Beach, MO 65079</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({islandParty});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">Island Party</p>
				<p class="text-md">August 19th-21st</p>
				<p class="text-sm">Lake Ouachita</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({unitedGroove});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">United Groove Presents</p>
				<p class="text-md">August 27th</p>
				<p class="text-sm">TBD</p>
			</div>
		</div>
	</div>
</section>

<style>
	.event:hover {
		transform: scale(1.01) rotate(-0.1deg);
		transition: transform 0.33s ease-out;
	}
</style>
