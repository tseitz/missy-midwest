<script lang="ts">
	import missy from './images/missy.webp';
</script>

<section
	id="bio"
	class="max-w-screen-2xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 pt-20 pb-12 md:pb-16"
>
	<div>
		<h2 class="text-base-content text-4xl mb-8 md:mb-12 italic">Bio</h2>
		<p class="text-base-content mb-6">
			Missy Midwest has created a humble following in her newest home-region, Little Rock, AR.
			Currently, she brings you a DJ set with banging subwoofers and your favorite hip-hop tracks.
			Missy will get on the mic though; and sing to you her own original works of musical art that
			contain uplifting affirmations to the beats you know in your heart. If she isn't writing &
			producing; she's hosting parties and curating the atmosphere at some of your favorite regional
			hotspots such as; Backwoods Music Festival, Breakaway - Kansas City, & Her Set Her Sound of
			Fayetteville. She's graced stages at the most historical and legendary venues still operating
			in Little Rock and surrounding areas; The Rev Room, Vino's, Stickyz Rock'n'Roll Chicken Shack,
			West & Watson of Fayetteville, and Canvas of Memphis. Missy Midwest is excited to continue
			sharing her optimistic mindset through music to the masses.
		</p>
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
