<script lang="ts">
	import spotifyLogo from './images/spotify.svg';
	import soundcloudLogo from './images/soundcloud.svg';
	import appleMusicLogo from './images/apple-music.png';
	import instagramLogo from './images/instagram.svg';
	import facebookLogo from './images/facebook.svg';
	import youtubeLogo from './images/youtube.svg';
	import Nav from '$lib/header/Nav.svelte';

	let navWidth: number;
	let socialSize = 36;

	$: mobileNav = navWidth < 1024;
</script>

<svelte:window bind:innerWidth={navWidth} />

<header class={mobileNav && mobileNav ? 'mobile' : ''}>
	<div class="social-wrap">
		<div class="social">
			<a href="https://soundcloud.com/missymidwest" target="_blank">
				<img src={soundcloudLogo} alt="SoundCloud" height={socialSize} width={socialSize} />
			</a>
		</div>
		<div class="social">
			<a
				href="https://open.spotify.com/artist/6udqUh6VgevnT7z1evE0E0?si=q01wY7yiR8OGr8Sbmc5Kqg"
				target="_blank"
			>
				<img src={spotifyLogo} alt="Spotify" height={socialSize} width={socialSize} />
			</a>
		</div>
		<div class="social">
			<a href="https://kit.svelte.dev" target="_blank">
				<img src={appleMusicLogo} alt="Apple Music" height={socialSize} width={socialSize} />
			</a>
		</div>
	</div>

	<Nav {navWidth} {mobileNav} />

	<div class="social-wrap">
		<div class="social">
			<a href="https://www.instagram.com/missy.midwest/" target="_blank">
				<img src={instagramLogo} alt="Instagram" height={socialSize} width={socialSize} />
			</a>
		</div>
		<div class="social">
			<a href="https://www.facebook.com/MissyMidwest/" target="_blank">
				<img src={facebookLogo} alt="Facebook" height={socialSize} width={socialSize} />
			</a>
		</div>
		<div class="social">
			<a href="https://www.youtube.com/channel/UCG4fK0SGXZpW6FJfGblgIqg" target="_blank">
				<img src={youtubeLogo} alt="YouTube" height={socialSize} width={socialSize} />
			</a>
		</div>
		<!-- <div class="social">
			<a href="https://www.facebook.com/MissyMidwest/" target="_blank">
				<img src={facebookLogo} alt="Facebook" height={socialSize} width={socialSize} />
			</a>
		</div> -->
	</div>
</header>

<style>
	header {
		/* display: grid;
		grid-template-columns: repeat(3, 1fr) 3fr repeat(3, 1fr);
		gap: 0.5rem; */
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex: 1 1 auto;
		background-color: var(--missy-white-100);
		position: sticky;
		top: 0;
		width: 100%;
		height: 3.75rem;
		z-index: 1;
		padding: 0 2rem;
	}

	.mobile {
		padding: 0 1rem;
	}

	.social-wrap {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		max-width: 16rem;
	}

	.mobile > .social-wrap {
		gap: 1rem;
	}

	/* .social {
		padding: 1rem 0;
	} */

	.social:hover {
		transform: scale(1.1);
		transition: transform 0.1s ease-out;
	}
</style>
