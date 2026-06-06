<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import SoundCloudFeed from '$lib/music/SoundCloudFeed.svelte';
	import Seo from '$lib/seo/Seo.svelte';

	// Curated featured track/mix (swap the track id anytime).
	const featuredTrack = '2107042845';
	const featuredSrc =
		`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${featuredTrack}` +
		`&color=%23cbb1fa&auto_play=false&hide_related=true&show_comments=false&show_user=true&visual=true`;
</script>

<svelte:head>
	<!-- The SoundCloud players are this page's primary content; the embeds fan
	     out to several origins, each needing its own handshake before the player
	     paints. Warm the render-critical ones up front to cut the blank "pop-in". -->
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

<Section label="Featured" title="Latest mix" reveal={false}>
	<div class="mt-2 w-full max-w-5xl">
		<iframe
			title="Featured mix"
			width="100%"
			height="450"
			scrolling="no"
			frameborder="no"
			allow="autoplay; encrypted-media"
			class="rounded-md"
			src={featuredSrc}
		></iframe>
	</div>
</Section>

<Section label="SoundCloud" title="The full catalog">
	<div class="mt-2">
		<SoundCloudFeed />
	</div>
</Section>
