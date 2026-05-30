<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
</script>

<section class="bg-glow-warm relative w-full overflow-hidden" style="min-height: 78vh;">
	<div
		class="absolute inset-0 bg-[url('/landing/missy-fan-crop.webp')] bg-cover bg-center opacity-40 mix-blend-luminosity"
		aria-hidden="true"
	></div>
	<div
		class="hero-rise relative z-10 mx-auto flex max-w-screen-2xl flex-col justify-center px-8 md:px-14"
		style="min-height: 78vh;"
	>
		<div class="label-eyebrow mb-3">Open-Format DJ · Vocalist · Producer</div>
		<h1 class="missy-header text-glow text-6xl leading-[0.86] text-white md:text-8xl lg:text-9xl">
			Missy <span class="text-gradient-sun">Midwest</span>
		</h1>
		<p class="mt-5 max-w-md text-base opacity-90 md:text-lg">
			Genre-blending energy from the Heart of IL to the Lake of the Ozarks and festival stages
			beyond.
		</p>
		<div class="mt-7 flex gap-4">
			<Button href={resolve('/music')} label="▶ Listen now" variant="fill" />
			<Button href={resolve('/shop')} label="Shop the merch" variant="outline" />
		</div>
	</div>
</section>
