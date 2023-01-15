<script lang="ts">
	import missy from './images/missy.webp';
	// import area51 from '../upcoming-dates/images/archive/area-51.jpg';
	// import campTaco from '../upcoming-dates/images/archive/camp-taco.webp';

	export let dates: any;
</script>

<section
	id="bio"
	class="max-w-screen-2xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 pt-20 pb-12 md:pb-16"
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
					{#each dates.pastDates as date, i}
						<button
							type="button"
							data-bs-target="#carouselExampleIndicators"
							data-bs-slide-to={i}
							class="active !bg-missy-400"
							aria-current="true"
							aria-label={date.title}
						/>
					{/each}
				</div>
				<div class="carousel-inner relative w-full overflow-hidden">
					{#each dates.pastDates as date, i}
						<div class="carousel-item {i === 0 ? 'active' : ''} float-left w-full">
							<!-- <img src={date.image} class="block w-full" alt={date.title} /> -->
							<div
								class="event h-96 w-full bg-slate-100 rounded-md flex flex-col justify-end"
								style="background: url({date.image}) rgb(241 245 249) no-repeat center 36%;opacity:0.98;background-size: 100%;"
							>
								<div class="description bg-slate-100 px-8 py-4 rounded-b-md text-missy-500">
									<p class="text-2xl missy-header">{date.title}</p>
									<p class="text-lg">
										{new Date(date.dateTime).toLocaleDateString()}
									</p>
									<p class="text-sm">{date.venue}</p>
									<!-- <p class="text-sm">{date.address}</p> -->
								</div>
							</div>
						</div>
					{/each}
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
</style>
