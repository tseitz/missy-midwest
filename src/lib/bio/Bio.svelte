<script lang="ts">
	import missy from './images/missy.webp';
</script>

<section
	id="bio"
	class="max-w-screen-2xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 pt-20 pb-12 md:pb-16"
>
	<div>
		<h2 class="text-slate-100 text-4xl mb-8 md:mb-12 italic">Bio</h2>
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
