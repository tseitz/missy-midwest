<script lang="ts">
	import jordanDrinks from './images/jordan-drinks.webp';
</script>

<section
	id="about"
	class="max-w-screen-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 py-12 md:py-16"
>
	<div>
		<h2 class="text-slate-100 text-4xl mb-12 italic">About Missy</h2>
		<p class="text-slate-100">
			A midwestern melting pot of EDM, country, bass, and urban styles; Missy Midwest brings dance
			vibes from all your favorite genres
		</p>
	</div>
	<div>
		<img src={jordanDrinks} alt="Missy Midwest" class="about-img opacity-70 rounded-md" />
	</div>
</section>

<style>
	.about-img {
		max-height: 70vh;
	}
</style>
