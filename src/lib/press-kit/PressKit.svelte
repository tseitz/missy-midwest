<script lang="ts">
	import { asset } from '$app/paths';
	import { fade } from 'svelte/transition';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import { netlifyImage } from '$lib/utils/netlify-image';

	let active = $state(-1);

	const assets = [
		{
			href: '/press-kit/missy-midwest-press-kit.pdf',
			src: '/press-kit/missy-midwest-press-kit.png',
			alt: 'Missy Press Kit',
			imgClass: 'm-auto w-full'
		},
		{
			href: '/press-kit/missy-presskit-bio.txt',
			src: '/press-kit/missy-presskit-bio.webp',
			alt: 'Missy Bio',
			imgClass: 'm-auto w-full'
		},
		{
			href: '/header/missy-midwest-logo.png',
			src: '/header/missy-midwest-logo.png',
			alt: 'Missy Logo',
			imgClass: 'my-auto w-full'
		},
		{
			href: '/press-kit/missy-fan.jpg',
			src: '/press-kit/missy-fan.webp',
			alt: 'Missy Artist Pic',
			imgClass: 'w-full rounded-md'
		},
		{
			href: '/press-kit/missy-profile.jpg',
			src: '/press-kit/missy-profile.webp',
			alt: 'Missy Artist Pic 2',
			imgClass: 'w-full rounded-md'
		}
	];
</script>

<section id="press" class="w-full max-w-screen-2xl pt-12 pb-24 lg:pt-20">
	<SectionHeading label="Press" title="Download the kit" />
	<div class="xs:grid-cols-1 mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
		{#each assets as item, i (item.href)}
			<!-- Mat every asset in the standard panel so light document scans (the bio
			     one-sheet) read as framed thumbnails instead of raw white blocks. -->
			<div class="panel-glass glow-hover w-full p-3">
				<a
					class="relative flex h-full items-center justify-center overflow-hidden rounded-xl"
					href={asset(item.href)}
					onmouseover={() => (active = i)}
					onfocus={() => (active = i)}
					onmouseleave={() => (active = -1)}
					download
				>
					{#if active === i}
						<div
							transition:fade={{ duration: 180 }}
							class="bg-missy-deep-purple/60 absolute inset-0 z-10 flex items-center justify-center"
						>
							{@render downloadIcon()}
						</div>
					{/if}
					<img
						class={item.imgClass}
						src={netlifyImage(asset(item.src), { width: 700 })}
						alt={item.alt}
						loading="lazy"
						decoding="async"
					/>
				</a>
			</div>
		{/each}
	</div>
</section>

{#snippet downloadIcon()}
	<svg class="text-missy-classic-lavender h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-5 4h10v-2H7v2z" />
	</svg>
{/snippet}
