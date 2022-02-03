<script lang="ts">
	import jordanLove from './images/jordan-falls-in-love.jpg';
	import tuckersShuckers from './images/tuckers-shuckers.png';
	import faucetteFestival from './images/faucette.jpg';
	import area51 from './images/area-51.jpg';
	import smokeWeed from './images/420.jpg';
</script>

<section id="dates" class="max-w-screen-2xl w-full py-20">
	<h2 class="text-slate-100 text-4xl mb-12 italic">Upcoming Dates</h2>
	<div class="grid xl:grid-cols-3 lg:grid-cols-2 gap-8">
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({jordanLove});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">February 11th</p>
				<p class="text-md">Missy Mix Vol.19 - Missy in Love</p>
			</div>
		</div>
		<a
			href="https://www.lakepubcrawl.com/bands.html"
			target="_blank"
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({tuckersShuckers});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">February 19th 3pm-12pm</p>
				<p class="text-md">Tuckers Shuckers Oysters & Tap</p>
				<p class="text-sm">Lake Ozark, MO</p>
			</div>
		</a>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({faucetteFestival});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">March 5th 12pm</p>
				<p class="text-md">Faucette Festival @ Faucette Brothers Park</p>
				<p class="text-sm">Little Rock, AR</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({area51});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">March 5th 9pm</p>
				<p class="text-md">Area 51 Faucette Festival After Party</p>
				<p class="text-sm">Little Rock, AR</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({smokeWeed});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">April 20th</p>
				<p class="text-md">Missy Mix Vol. 420 - Cannibas Cures</p>
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
