<script lang="ts">
	import campTaco from './images/camp-taco.webp';
	// import faucetteFestival from './images/faucette.webp';
	// import area51 from './images/area-51.jpg';
	import dftOnTheRoad from './images/DFT-on-the-road-2022.webp';
</script>

<section id="dates" class="max-w-screen-2xl w-full pt-20 pb-16">
	<h2 class="text-slate-100 text-4xl mb-8 md:mb-12 italic">See Missy</h2>
	<div class="grid xl:grid-cols-3 lg:grid-cols-2 gap-10">
		<!-- <a
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
		</a> -->
		<!-- <div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({faucetteFestival});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">March 5th 12pm</p>
				<p class="text-md">Faucette Festival @ Faucette Brothers Park</p>
				<p class="text-sm">Little Rock, AR</p>
			</div>
		</div> -->
		<!-- <div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({area51});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">March 5th 9pm</p>
				<p class="text-md">Area 51 Faucette Festival After Party</p>
				<p class="text-sm">Little Rock, AR</p>
			</div>
		</div> -->
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background: url({dftOnTheRoad}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">April 22th</p>
				<p class="text-md">Yellow Brick Road Tour @ The Rev Room</p>
				<p class="text-sm">Little Rock, AR</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({campTaco});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md">
				<p class="text-2xl">Summer 2022</p>
				<p class="text-md">Camp Taco</p>
				<p class="text-sm">Little Rock, AR</p>
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
