<script lang="ts">
	import { asset } from '$app/paths';
	import { fade } from 'svelte/transition';
	import SectionHeading from '$lib/components/SectionHeading.svelte';

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
	<div class="xs:grid-cols-1 mt-8 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
		{#each assets as item, i (item.href)}
			<div class="bg-base-100 w-full rounded-md">
				<a
					class="hover:shadow-missy-classic-lavender/20 relative flex h-full flex-col justify-center hover:shadow-lg"
					href={asset(item.href)}
					onmouseover={() => (active = i)}
					onfocus={() => (active = i)}
					onmouseleave={() => (active = -1)}
					download
				>
					{#if active === i}
						<div
							transition:fade={{ duration: 180 }}
							class="bg-missy-deep-purple/50 absolute inset-0 z-10 flex items-center justify-center rounded-md"
						>
							{@render downloadIcon()}
						</div>
					{/if}
					<img class={item.imgClass} src={asset(item.src)} alt={item.alt} />
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

<style>
	#press a:hover {
		transform: scale(1.02) rotate(-0.1deg);
		transition: all 0.33s ease-out;
	}
</style>
