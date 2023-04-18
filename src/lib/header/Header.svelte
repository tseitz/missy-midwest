<script lang="ts">
	import tikTokLogo from './images/tik-tok.png';
	import soundcloudLogo from './images/soundcloud.png';
	import twitchLogo from './images/twitch.png';
	import instagramLogo from './images/instagram.png';
	import facebookLogo from './images/facebook.png';
	import youtubeLogo from './images/youtube.png';
	import Nav from '$lib/header/Nav.svelte';

	let navWidth: number;
	let socialSize = 42;

	$: mobileNav = navWidth < 1024;
</script>

<svelte:window bind:innerWidth={navWidth} />

<header class={mobileNav && mobileNav ? 'mobile' : ''}>
	<div class="social-wrap">
		<div class="social">
			<a href="https://soundcloud.com/missymidwest" target="_blank" rel="noreferrer">
				<img src={soundcloudLogo} alt="SoundCloud" height={socialSize} width={socialSize} />
			</a>
		</div>
		<div class="social m-auto">
			<a href="https://www.tiktok.com/@missy.midwestofficial" target="_blank" rel="noreferrer">
				<img src={tikTokLogo} alt="TikTok" height={socialSize - 12} width={socialSize - 12} />
			</a>
		</div>
		<div class="social">
			<a href="https://www.twitch.tv/missymidwest" target="_blank" rel="noreferrer">
				<img src={twitchLogo} alt="Twitch" height={socialSize} width={socialSize} />
			</a>
		</div>
	</div>

	<Nav {navWidth} {mobileNav} />

	<div class="social-wrap">
		<div class="social">
			<a href="https://www.instagram.com/missy.midwest/" target="_blank" rel="noreferrer">
				<img src={instagramLogo} alt="Instagram" height={socialSize} width={socialSize} />
			</a>
		</div>
		<div class="social">
			<a href="https://www.facebook.com/MissyMidwest/" target="_blank" rel="noreferrer">
				<img src={facebookLogo} alt="Facebook" height={socialSize} width={socialSize} />
			</a>
		</div>
		<div class="social">
			<a
				href="https://www.youtube.com/channel/UCG4fK0SGXZpW6FJfGblgIqg"
				target="_blank"
				rel="noreferrer"
			>
				<img src={youtubeLogo} alt="YouTube" height={socialSize} width={socialSize} />
			</a>
		</div>
		<!-- <div class="social">
			<a href="https://www.facebook.com/MissyMidwest/" target="_blank"  rel="noreferrer">
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
		z-index: 10;
		padding: 0 2rem;
	}

	.mobile {
		padding: 0 1rem;
	}

	.social-wrap {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.2rem;
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
