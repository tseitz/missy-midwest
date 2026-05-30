<script lang="ts">
	// Profile widget: auto-lists Missy's latest uploads — no API key, no manual updates.
	const profile = encodeURIComponent('https://soundcloud.com/missymidwest');
	const color = '%23cbb1fa';
	const src =
		`https://w.soundcloud.com/player/?url=${profile}` +
		`&color=${color}&auto_play=false&hide_related=true&show_comments=false` +
		`&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
</script>

<div class="mx-auto w-full max-w-3xl">
	<iframe
		title="Missy Midwest — latest on SoundCloud"
		width="100%"
		height="450"
		scrolling="no"
		frameborder="no"
		allow="autoplay"
		class="rounded-md"
		{src}
	></iframe>
</div>
