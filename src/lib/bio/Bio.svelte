<script lang="ts">
	import missy from './images/missy.webp';
	// import { browser } from '$app/environment';
	// import { onMount } from 'svelte';

	// let carousel; // for calling methods of the carousel instance

	// let Carousel: ConstructorOfATypedSvelteComponent; // for saving Carousel component class
	// onMount(async () => {
	// 	const module = await import('svelte-carousel');
	// 	Carousel = module.default;
	// });

	// const handleNextClick = () => {
	// 	carousel.goToNext();
	// };
</script>

<section
	id="bio"
	class="max-w-screen-2xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 pt-20 pb-12 md:pb-16"
>
	<div>
		<h2 class="text-slate-100 text-4xl mb-8 md:mb-12 italic">Bio</h2>
		<!-- <p class="text-slate-100 mb-6">
			Missy Midwest is no stranger to live music. With her performances starting at as young as
			kindergarten, MissWest has over 20 years of experience being in the spotlight and behind the
			curtain. She has taken 4+ years of voice lessons and over 10 years of piano lessons. Her time
			spent performing in concert halls, clubs, outdoor venues, various religious establishments,
			theaters, schools, and homes has no doubt shaped her into the hard working and dedicated
			artist she is today.
		</p>
		<p class="text-slate-100 mb-6">
			In April of 2020, the pandemic had brought uncertainty and big changes. Through that isolation
			Missy took that as her cue to shake things up. She decided to do all of the things she always
			said she "never had time" for. One of those being to pick up music again. Through that
			decision she decided to go for the professional career she always knew was meant for her. To
			be a music artist.
		</p>
		<p class="text-slate-100 mb-6">
			Currently, you can find Missy DJing at community-centered events in Central & NW Arkansas such
			as Faucette Festivals, Her Set Her Sound 2022 and Sunday Fill-Up. These events focus on
			uplifting under-represented members of the edm community as well as supporting small business
			owners. She's also performed at the iconic Revolution Room in downtown Little Rock where she
			competed for a time slot at Dancefestopia 2022.
		</p>
		<p class="text-slate-100">
			Behind the scenes she is releasing a weekly Missy Mix, song-writing, learning production
			through Abelton, and helping to support and foster the edm community in Arkansas. It is her
			mission and the mission of the entire Missy Midwest Team to sustain positive relationships
			with our fellow music lovers through showing up to community events and supporting the artists
			of those events.
		</p> -->
		<p class="text-slate-100 mb-6">
			Missy Midwest brings you uplifting affirmations, sentimental love ballads and booty shaking
			party beats; with a country flair. She emulates a wide range of genres mixed together; just
			like the Midwest. You can attend her high energy DJ sets in the hottest Lake of the Ozarks
			locations. Missy recently played her hometown music festival, 309fest, as well as
			Fayetteville's "Her Set Her Sound" and proved she was a force to be noticed. She can't wait to
			bring the uplifting and relatable lyrics of her Country Bass anthems to stages in 2023. This
			club season she is writing her own music, competing with other outstanding musicians, fine
			tuning her production skills and supporting her local music scene.
		</p>
		<!-- {#if browser}
			<Carousel bind:this={carousel}>
				<div>1</div>
				<div>2</div>
				<div>3</div>
			</Carousel>
		{/if}

		<button on:click={handleNextClick}>Next</button> -->
	</div>
	<div class="flex justify-center">
		<img src={missy} alt="Missy Midwest" class="bio-img opacity-90 rounded-md" />
	</div>
</section>

<style>
	.bio-img {
		max-height: 60vh;
	}
</style>
