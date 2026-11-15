<script lang="ts">
	import { resolve, asset } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { BAD_BITCH_BASS_URL } from '$lib/music/soundcloud';
</script>

<section
	class="bg-glow-warm tone-sea relative -mt-16 w-full overflow-hidden"
	style="min-height: 78vh;"
>
	<picture class="contents">
		<source srcset={asset('/landing/missy-fan-crop.avif')} type="image/avif" />
		<img
			src={asset('/landing/missy-fan-crop.webp')}
			alt=""
			fetchpriority="high"
			decoding="async"
			class="absolute inset-0 h-full w-full object-cover"
			style="object-position: 50% 20%;"
		/>
	</picture>
	<div class="hero-scrim absolute inset-0" aria-hidden="true"></div>
	<div
		class="hero-rise relative z-10 mx-auto flex max-w-screen-2xl flex-col justify-center px-8 md:px-14"
		style="min-height: 78vh;"
	>
		<div class="label-eyebrow mb-3">DJ · Producer · Vocalist</div>
		<h1>
			<Logo class="w-full max-w-sm md:max-w-2xl lg:max-w-3xl" />
		</h1>
		<p class="hero-subcopy mt-5 max-w-lg text-base text-fg md:text-lg">
			Bad Bitch Bass Volume 1 out now!
		</p>
		<div class="mt-7 flex flex-wrap gap-4">
			<Button href={BAD_BITCH_BASS_URL} label="▶ Listen now" variant="fill" external />
			<Button href={resolve('/shop')} label="Shop the merch" variant="outline" />
		</div>
	</div>
</section>

<style>
	.hero-scrim {
		background:
			linear-gradient(
				90deg,
				color-mix(in srgb, var(--color-surface-deep) 70%, transparent) 0%,
				color-mix(in srgb, var(--color-surface-deep) 25%, transparent) 55%,
				transparent 80%
			),
			linear-gradient(
				0deg,
				color-mix(in srgb, var(--color-surface-deep) 55%, transparent) 0%,
				transparent 45%
			);
	}
	@media (max-width: 767px) {
		.hero-scrim {
			background: linear-gradient(
				180deg,
				color-mix(in srgb, var(--color-surface-deep) 30%, transparent) 0%,
				color-mix(in srgb, var(--color-surface-deep) 60%, transparent) 40%,
				color-mix(in srgb, var(--color-surface-deep) 60%, transparent) 70%,
				color-mix(in srgb, var(--color-surface-deep) 20%, transparent) 100%
			);
		}
	}
	.hero-subcopy {
		text-shadow: 0 1px 12px color-mix(in srgb, var(--color-surface-deep) 55%, transparent);
	}
</style>
