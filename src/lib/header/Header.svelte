<script lang="ts">
	import Nav from '$lib/header/Nav.svelte';
	import {
		SiSoundcloud,
		SiTiktok,
		SiTwitch,
		SiInstagram,
		SiFacebook,
		SiYoutube
	} from '@icons-pack/svelte-simple-icons';

	let navWidth: number;
	let socialSize = 26;

	$: mobileNav = navWidth < 1024;
</script>

<svelte:window bind:innerWidth={navWidth} />

<header
	class={mobileNav && mobileNav
		? 'mobile bg-missy-deep-purple shadow-lg shadow-missy-classic-lavender/20 px-2 md:px-4 lg:px-8'
		: 'bg-missy-deep-purple shadow-lg shadow-missy-classic-lavender/20 px-2 md:px-4 lg:px-6'}
>
	<div class="social-wrap gap-2 md:gap-4 xl:gap-10 2xl:gap-12">
		<div class="social">
			<a href="https://soundcloud.com/missymidwest" target="_blank" rel="noreferrer">
				<SiSoundcloud size={socialSize} color="var(--color-missy-classic-lavender)" />
			</a>
		</div>
		<div class="social m-auto">
			<a href="https://www.tiktok.com/@missy.midwestofficial" target="_blank" rel="noreferrer">
				<SiTiktok size={socialSize} color="var(--color-missy-classic-lavender)" />
			</a>
		</div>
		<div class="social">
			<a href="https://www.twitch.tv/missymidwest" target="_blank" rel="noreferrer">
				<SiTwitch size={socialSize} color="var(--color-missy-classic-lavender)" />
			</a>
		</div>
	</div>

	<Nav {navWidth} {mobileNav} />

	<div class="social-wrap gap-2 md:gap-6 xl:gap-10 2xl:gap-12">
		<div class="social">
			<a href="https://www.instagram.com/missy.midwest/" target="_blank" rel="noreferrer">
				<SiInstagram size={socialSize} color="var(--color-missy-classic-lavender)" />
			</a>
		</div>
		<div class="social">
			<a href="https://www.facebook.com/MissyMidwest/" target="_blank" rel="noreferrer">
				<SiFacebook size={socialSize} color="var(--color-missy-classic-lavender)" />
			</a>
		</div>
		<div class="social">
			<a
				href="https://www.youtube.com/channel/UCG4fK0SGXZpW6FJfGblgIqg"
				target="_blank"
				rel="noreferrer"
			>
				<SiYoutube size={socialSize + 5} color="var(--color-missy-classic-lavender)" />
			</a>
		</div>
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
		/* background-color: var(--missy-white-100); */
		position: sticky;
		top: 0;
		width: 100%;
		height: 4rem;
		z-index: 10;
	}

	.mobile {
		padding: 0 1rem;
	}

	.social-wrap {
		display: grid;
		align-items: center;
		grid-template-columns: repeat(3, 1fr);
		max-width: 16rem;
	}

	.mobile > .social-wrap {
		gap: 0.5rem;
	}

	/* .social {
		padding: 1rem 0;
	} */

	.social:hover {
		transform: scale(1.1);
		transition: transform 0.1s ease-out;
	}
</style>
