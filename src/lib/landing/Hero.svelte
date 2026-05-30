<script lang="ts">
	import { resolve, asset } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
</script>

<section class="bg-glow-warm relative -mt-16 w-full overflow-hidden" style="min-height: 78vh;">
	<div
		class="absolute inset-0 bg-cover opacity-40 mix-blend-luminosity"
		style="background-image: url({asset(
			'/landing/missy-fan-crop.webp'
		)}); background-position: 50% 20%;"
		aria-hidden="true"
	></div>
	<div
		class="hero-rise relative z-10 mx-auto flex max-w-screen-2xl flex-col justify-center px-8 md:px-14"
		style="min-height: 78vh;"
	>
		<div class="label-eyebrow mb-3">DJ · Producer · Vocalist</div>
		<h1 class="missy-header text-glow text-6xl leading-[0.86] text-white md:text-8xl lg:text-9xl">
			Missy <span class="text-gradient-sun">Midwest</span>
		</h1>
		<p class="hero-subcopy mt-5 max-w-lg text-base text-white/95 md:text-lg">
			Bad bitch bass for Midwest baddies. Genre-bending sets from the Lake of the Ozarks to the
			festival main stage.
		</p>
		<div class="mt-7 flex flex-wrap gap-4">
			<Button href={resolve('/music')} label="▶ Listen now" variant="fill" />
			<Button href={resolve('/shop')} label="Shop the merch" variant="outline" />
		</div>
	</div>
</section>

<style>
	/* Keep the subcopy legible where it crosses the brighter middle of the photo. */
	.hero-subcopy {
		text-shadow: 0 1px 12px rgba(45, 28, 127, 0.55);
	}
</style>
