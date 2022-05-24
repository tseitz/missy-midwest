<script lang="ts">
	import herSetHerSound from './images/her-set-her-sound.webp';
	import sundayFillUp from './images/sunday-fill-up.webp';
	import punchy from './images/punchy.webp';
	import electricForest from './images/electric-forest.webp';
</script>

<section id="dates" class="max-w-screen-2xl w-full pt-20 pb-16">
	<h2 class="text-slate-100 text-4xl mb-8 md:mb-12 italic">Upcoming Dates!</h2>
	<div class="grid xl:grid-cols-3 lg:grid-cols-2 gap-10">
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background: url({herSetHerSound}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">Her Set Her Sound</p>
				<p class="text-md">Friday, June 3rd 6:30pm-7pm</p>
				<p class="text-sm">Prairie Street Live, 509 W. Prairie St, Fayetteville, AR 72701</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({punchy});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">Punchy Event</p>
				<p class="text-md">Saturday, June 11th 12pm-3pm</p>
				<p class="text-sm">Lost Forty Taproom Little Rock, AR</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({sundayFillUp});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">Sunday Fill-Up</p>
				<p class="text-md">Sunday, June 12th 1pm-5pm</p>
				<p class="text-sm">The Filling Station NLR on JFK Blvd.</p>
			</div>
		</div>
		<div
			class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
			style="background-image: url({electricForest});background-repeat: no-repeat;background-size:cover;opacity:0.98;background-position:center;"
		>
			<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
				<p class="text-2xl missy-header">Electric Forest</p>
				<p class="text-md">Thursday, June 23rd-26th</p>
				<p class="text-sm">Rothbury, Michigan</p>
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
