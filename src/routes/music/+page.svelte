<script lang="ts">
	import MusicSections from '$lib/music/MusicSections.svelte';
	import Seo from '$lib/seo/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<!-- The players fan out to several origins; warm the render-critical ones. -->
	<link rel="preconnect" href="https://w.soundcloud.com" />
	<link rel="preconnect" href="https://widget.sndcdn.com" />
	<link rel="preconnect" href="https://i1.sndcdn.com" />
	<link rel="preconnect" href="https://api-widget.soundcloud.com" />
	<link rel="dns-prefetch" href="https://cf-hls-media.sndcdn.com" />
</svelte:head>

<Seo
	title="Music — Missy Midwest"
	description="Stream Missy Midwest's latest DJ sets and tracks."
/>

<MusicSections featuredMix={data.featuredMix} />
