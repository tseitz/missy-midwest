<script lang="ts">
	import Hero from '$lib/landing/Hero.svelte';
	import Bio from '$lib/bio/Bio.svelte';
	import ShopTeaser from '$lib/home/ShopTeaser.svelte';
	import ShowsTeaser from '$lib/home/ShowsTeaser.svelte';
	import InstagramFeed from '$lib/home/InstagramFeed.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Missy Midwest — DJ · Vocalist · Producer</title>
</svelte:head>

<Hero />
<div class="w-full flex flex-col items-center">
	<Bio />
	<ShopTeaser />
	<ShowsTeaser events={data.nextShows} />
	<InstagramFeed />
</div>
