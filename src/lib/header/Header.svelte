<script lang="ts">
	import spotifyLogo from './spotify.svg';
	import soundcloudLogo from './soundcloud.svg';
	import appleMusicLogo from './apple-music.png';
	import instagramLogo from './instagram.svg';
	import facebookLogo from './facebook.svg';
	import youtubeLogo from './youtube.svg';
	import Nav from '$lib/header/Nav.svelte';
</script>

<header class="sticky top-0 w-full h-16">
	<div class="flex justify-between items-center w-full bg-slate-100">
		<div class="flex">
			<div class="social rounded-full h-12 w-12 my-2 mx-4">
				<a href="https://soundcloud.com/missymidwest" target="_blank">
					<img src={soundcloudLogo} alt="SoundCloud" />
				</a>
			</div>
			<div class="social rounded-full h-12 w-12 my-2 mx-4">
				<a
					href="https://open.spotify.com/artist/6udqUh6VgevnT7z1evE0E0?si=q01wY7yiR8OGr8Sbmc5Kqg"
					target="_blank"
				>
					<img src={spotifyLogo} alt="Spotify" />
				</a>
			</div>
			<div class="social rounded-full h-12 w-12 my-2 mx-4">
				<a href="https://kit.svelte.dev" target="_blank">
					<img src={appleMusicLogo} alt="Apple Music" />
				</a>
			</div>
		</div>

		<Nav />

		<div class="flex">
			<div class="social rounded-full h-12 w-12 my-2 mx-4">
				<a href="https://www.instagram.com/missy.midwest/" target="_blank">
					<img src={instagramLogo} alt="Instagram" />
				</a>
			</div>
			<div class="social rounded-full h-12 w-12 my-2 mx-4">
				<a href="https://www.facebook.com/MissyMidwest/" target="_blank">
					<img src={facebookLogo} alt="Facebook" />
				</a>
			</div>
			<div class="social rounded-full h-12 w-12 my-2 mx-4">
				<a href="https://kit.svelte.dev" target="_blank">
					<img src={youtubeLogo} alt="YouTube" />
				</a>
			</div>
		</div>
	</div>
</header>

<style>
	header {
		z-index: 1;
	}

	.social:hover {
		transform: scale(1.05) rotate(-0.5deg);
		transition: transform 0.2s ease-out;
	}
</style>
