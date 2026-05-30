<script lang="ts">
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import SoundCloudFeed from '$lib/music/SoundCloudFeed.svelte';

	// Curated featured track/mix (swap the track id anytime).
	const featuredTrack = '2107042845';
	const featuredSrc =
		`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${featuredTrack}` +
		`&color=%23cbb1fa&auto_play=false&hide_related=true&show_comments=false&show_user=true&visual=true`;
</script>

<svelte:head>
	<title>Music — Missy Midwest</title>
</svelte:head>

<div class="max-w-screen-2xl w-full px-8 md:px-14 py-16 flex flex-col items-center">
	<div class="w-full">
		<SectionHeading label="Featured" title="Latest mix" />
		<div class="w-full max-w-3xl mx-auto mb-16">
			<iframe
				title="Featured mix"
				width="100%"
				height="450"
				scrolling="no"
				frameborder="no"
				allow="autoplay"
				class="rounded-md"
				src={featuredSrc}
			></iframe>
		</div>

		<SectionHeading label="SoundCloud" title="Everything she's posted" />
		<SoundCloudFeed />
	</div>
</div>
