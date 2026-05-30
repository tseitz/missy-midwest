<script lang="ts">
	import Hero from '$lib/landing/Hero.svelte';
	import Bio from '$lib/bio/Bio.svelte';
	import ShopTeaser from '$lib/home/ShopTeaser.svelte';
	import ShowsTeaser from '$lib/home/ShowsTeaser.svelte';
	import InstagramFeed from '$lib/home/InstagramFeed.svelte';
	import Seo from '$lib/seo/Seo.svelte';
	import { page } from '$app/state';
	import { musicGroupJsonLd } from '$lib/seo/jsonld';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const jsonld = $derived(
		JSON.stringify(musicGroupJsonLd(page.url.origin)).replace(/</g, '\\u003c')
	);
</script>

<Seo
	title="Missy Midwest — DJ · Vocalist · Producer"
	description="Open-format DJ, vocalist & producer — genre-blending energy from the Heart of IL to festival stages beyond."
/>
<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted self-generated JSON-LD; `<` is escaped to < above -->
	{@html `<script type="application/ld+json">${jsonld}</` + `script>`}
</svelte:head>

<Hero />
<div class="flex w-full flex-col items-center">
	<Bio />
	<ShopTeaser groups={data.shopGroups} />
	<ShowsTeaser events={data.nextShows} />
	<InstagramFeed posts={data.instagramPosts} />
</div>
