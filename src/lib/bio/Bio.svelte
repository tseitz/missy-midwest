<script lang="ts">
	import missy from './images/missy-bio.jpeg';
</script>

<section
	id="bio"
	class="max-w-screen-2xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 pt-12 lg:pt-20 pb-12 md:pb-16"
>
	<div>
		<h2 class="text-secondary text-4xl mb-8 md:mb-12 italic">Bio</h2>
		<!-- <p class="text-base-content mb-6">
			Missy Midwest is an electronic & open-format DJ gathering a humble following throughout her
			tour of the Southern Midwest. She brings your favorite pop & hip-hop tracks with a twist of
			edm to clubs, music festivals and party coves across the Midwest. She creates a captivating
			experience and uses smooth mixing & hot cue play to keep her audience's attention and their
			energy high. You'll be singing & dancing along before the first song is over.
			<br /><br />
			Missy's strengths involve professionalism, clear communication, preparedness and the ability to
			make a new friend in any setting. Her business savvy is apparent once you've worked alongside her
			for any event she is involved in. Her sets are well-thought out and curated according to the theme/genre
			requested by the venue and promoter. It is important to Missy that your business & attendees feel
			safe & heard and that she has helped you accomplish your best event possible. The little things
			matter!
			<br /><br />
			You can find Team Missy at events and venues such as Dancfestopia & Breakaway (Kansas City), Her
			Set Her Sound & West & Watson (Fayetteville), Stickyz & The Rev Room (Little Rock), Canvas of Memphis,
			The Momentary (Bentonville) and many more.
			<br /><br />
			Missy Midwest is passionate about continuing to project her optimistic mindset through music to
			the masses.
		</p> -->
		<p class="text-base-content mb-6">
			Missy Midwest is a music artist & DJ hailing from Central Arkansas. Her song choice, smooth
			mixing & hot cue play has gathered her a humble following throughout her tour of the Southern
			Midwest. Missy combines booty bouncing hip-hop tracks with sub bass you can feel. She makes
			sure everyone is dancing, shakin' it and feeling bold as ever. You can find her at your
			favorite clubs, music festivals and party coves across the Midwest.
		</p>
	</div>
	<div class="flex justify-center">
		<img src={missy} alt="Missy Midwest" class="bio-img opacity-90 rounded-md" />
	</div>
</section>

<style>
	.bio-img {
		max-height: 60vh;
		opacity: 80%;
	}
</style>
