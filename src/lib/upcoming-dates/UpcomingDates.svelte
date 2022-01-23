<script lang="ts">
	import jordanLove from './images/jordan-falls-in-love.jpg';
	import tuckersShuckers from './images/tuckers-shuckers.jpg';
	import faucetteFestivals from './images/faucette.jpg';
	import smokeWeed from './images/420.jpg';
</script>

<section id="dates" class="w-full px-14 py-20 bg-missy-500">
	<h2 class="text-slate-100 text-4xl mb-12 italic">Upcoming Dates</h2>
	<div class="grid xl:grid-cols-4 lg:grid-cols-2 gap-8">
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({jordanLove});background-repeat: no-repeat;background-size:cover;opacity:0.98;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">Friday, February 11th</p>
				<p class="text-md">Missy Mix Vol.19 - Missy in Love</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({tuckersShuckers});background-repeat: no-repeat;background-size:cover;opacity:0.98;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">Saturday, February 19th 3pm-12pm</p>
				<p class="text-md">Tuckers Shuckers Oysters & Tap</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({faucetteFestivals});background-repeat: no-repeat;background-size:cover;opacity:0.98;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">Saturday, March 5th</p>
				<p class="text-md">Faucette Festivals Little Rock, AR</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({smokeWeed});background-repeat: no-repeat;background-size:cover;opacity:0.98;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">Wednesday, April 20th</p>
				<p class="text-md">Live From Austin, Missy Mix Vol. 420</p>
			</div>
		</div>
	</div>
</section>

<style>
	.event:hover {
		transform: scale(1.01) rotate(-0.5deg);
		transition: transform 0.2s ease-out;
	}
</style>
