<script lang="ts">
	import missy from './images/missy.webp';
	import area51 from '../upcoming-dates/images/archive/area-51.jpg';
	import campTaco from '../upcoming-dates/images/archive/camp-taco.webp';
	import electricForest from '../upcoming-dates/images/archive/electric-forest.webp';
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
		<div class="p-4">
			<div id="carouselExampleIndicators" class="carousel slide relative" data-bs-ride="carousel">
				<div
					class="carousel-indicators absolute right-0 bottom-0 left-0 flex justify-center p-0 mb-4"
				>
					<button
						type="button"
						data-bs-target="#carouselExampleIndicators"
						data-bs-slide-to="0"
						class="active"
						aria-current="true"
						aria-label="Slide 1"
					/>
					<button
						type="button"
						data-bs-target="#carouselExampleIndicators"
						data-bs-slide-to="1"
						aria-label="Slide 2"
					/>
					<button
						type="button"
						data-bs-target="#carouselExampleIndicators"
						data-bs-slide-to="2"
						aria-label="Slide 3"
					/>
				</div>
				<div class="carousel-inner relative w-full overflow-hidden">
					<div class="carousel-item active float-left w-full">
						<img src={area51} class="block w-full" alt="Wild Landscape" />
					</div>
					<div class="carousel-item float-left w-full">
						<img src={campTaco} class="block w-full" alt="Camera" />
					</div>
					<div class="carousel-item float-left w-full">
						<img src={electricForest} class="block w-full" alt="Exotic Fruits" />
					</div>
				</div>
				<button
					class="carousel-control-prev absolute top-0 bottom-0 flex items-center justify-center p-0 text-center border-0 hover:outline-none hover:no-underline focus:outline-none focus:no-underline left-0"
					type="button"
					data-bs-target="#carouselExampleIndicators"
					data-bs-slide="prev"
				>
					<span class="carousel-control-prev-icon inline-block bg-no-repeat" aria-hidden="true" />
					<span class="visually-hidden">Previous</span>
				</button>
				<button
					class="carousel-control-next absolute top-0 bottom-0 flex items-center justify-center p-0 text-center border-0 hover:outline-none hover:no-underline focus:outline-none focus:no-underline right-0"
					type="button"
					data-bs-target="#carouselExampleIndicators"
					data-bs-slide="next"
				>
					<span class="carousel-control-next-icon inline-block bg-no-repeat" aria-hidden="true" />
					<span class="visually-hidden">Next</span>
				</button>
			</div>
		</div>
	</div>
	<div class="flex justify-center">
		<img src={missy} alt="Missy Midwest" class="bio-img opacity-90 rounded-md" />
	</div>
</section>

<style>
	.bio-img {
		max-height: 60vh;
	}
	/* 
	.carousel-indicators {
		z-index: 2;
		margin-right: 15%;
		margin-left: 15%;
		list-style: none;
	}

	.carousel-item.active {
		display: block;
	}

	.carousel-item {
		display: none;
		margin-right: -100%;
		backface-visibility: hidden;
		transition: transform 0.6s ease-in-out;
	} */
</style>
