<script lang="ts">
	import Button from '$lib/components/Button.svelte';
</script>

<section class="relative w-full overflow-hidden bg-glow-warm" style="min-height: 78vh;">
	<div
		class="absolute inset-0 bg-[url('/landing/missy-fan-crop.webp')] bg-cover bg-center opacity-40 mix-blend-luminosity"
		aria-hidden="true"
	></div>
	<div
		class="relative z-10 max-w-screen-2xl mx-auto px-8 md:px-14 flex flex-col justify-center"
		style="min-height: 78vh;"
	>
		<div class="label-eyebrow mb-3">Open-Format DJ · Vocalist · Producer</div>
		<h1 class="missy-header text-glow text-6xl md:text-8xl lg:text-9xl leading-[0.86] text-white">
			Missy <span class="text-gradient-sun">Midwest</span>
		</h1>
		<p class="mt-5 max-w-md text-base md:text-lg opacity-90">
			Genre-blending energy from the Heart of IL to the Lake of the Ozarks and festival stages
			beyond.
		</p>
		<div class="mt-7 flex gap-4">
			<Button href="/music" label="▶ Listen now" variant="fill" />
			<Button href="/shop" label="Shop the merch" variant="outline" />
		</div>
	</div>
</section>
