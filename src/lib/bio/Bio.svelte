<script lang="ts">
	import missy from '/bio/missy-bio.webp';
</script>

<section
	id="bio"
	class="max-w-screen-2xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 pt-12 lg:pt-20 pb-12 md:pb-16"
>
	<div>
		<h2 class="text-secondary text-4xl mb-8 md:mb-12 italic">Bio</h2>
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
