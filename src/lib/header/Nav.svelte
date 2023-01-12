<script lang="ts">
	import missyLogo from './images/missy-midwest-neon-cropped.png';
	export let navWidth: number;
	export let mobileNav: boolean;
	let y = 0;

	let margin = -3.5;
	let translateX = '0';
	let translateY = '80%';

	$: mobileLogo = navWidth < 480;
	$: margin = mobileNav ? 0 : Math.min(0, -3.5 + y / 100);
	$: scale = mobileNav ? Math.max(1, 3.5 - y / 125) : Math.max(1, 5 - y / 125);
	$: translateY = mobileNav ? Math.max(0, 110 - y / 3) + '%' : Math.max(0, 80 - y / 6.25) + '%';
</script>

<svelte:window bind:scrollY={y} />

<nav class={mobileNav && mobileNav ? 'mobile' : ''}>
	{#if mobileNav}
		<ul>
			<li><a class="text-missy-500 text-md md:text-lg" href="#music">Music</a></li>
			<li><a class="text-missy-500 text-md md:text-lg" href="#bio">Bio</a></li>
			<li><a class="text-missy-500 text-md md:text-lg" href="#dates">Dates</a></li>
			<li><a class="text-missy-500 text-md md:text-lg" href="#contact">Contact</a></li>
			<li><a class="text-missy-500 text-md md:text-lg" href="#support">Support</a></li>
			<li><a class="text-missy-500 text-md md:text-lg" href="#press">Press Kit</a></li>
		</ul>
		<div class="logo {mobileLogo ? 'mobile-logo' : ''}" style="margin: 0 {margin}rem">
			<img
				src={missyLogo}
				alt="Missy Midwest"
				style="transform: scale({scale}) translate({translateX}, {translateY});"
			/>
		</div>
	{:else}
		<ul>
			<li><a class="text-missy-500 text-lg md:text-xl" href="#music">Music</a></li>
			<li><a class="text-missy-500 text-lg md:text-xl" href="#bio">Bio</a></li>
			<li>
				<a class="text-missy-500 text-lg md:text-xl" href="#dates">Dates</a>
			</li>
			<div class="logo {mobileLogo ? 'mobile-logo' : ''}" style="margin: 0 {margin}rem">
				<img
					src={missyLogo}
					alt="Missy Midwest"
					style="transform: scale({scale}) translate({translateX}, {translateY});"
				/>
			</div>
			<li><a class="text-missy-500 text-lg md:text-xl" href="#contact">Contact</a></li>
			<li><a class="text-missy-500 text-lg md:text-xl" href="#support">Support</a></li>
			<li><a class="text-missy-500 text-lg md:text-xl" href="#press">Press Kit</a></li>
		</ul>
	{/if}
</nav>

<style>
	ul {
		display: flex;
		align-items: center;
		justify-content: space-between;
		list-style: none;
	}
	.mobile > ul {
		position: fixed;
		/* align-items: flex-start;
		justify-content: flex-start; */
		left: 0;
		width: 100%;
		bottom: 0;
		height: 4rem;
		/* margin-top: 3.75rem; */
		background-color: var(--missy-white-100);
		/* height: calc(100% - 3.75rem); */
		/* min-width: 240px; */
	}
	li {
		z-index: 1;
		padding: 0 1rem;
	}
	/* li > a:hover,
	li > a:focus {
		background: linear-gradient(to right, rgb(236 72 153), rgb(79, 36, 73));
		background-size: 100% 0.1em, 0 0.1em;
		background-position: 100% 100%, 0 100%;
		background-repeat: no-repeat;
		transition: background-size 400ms;
		background-size: 0 0.1em, 100% 0.1em;
	} */
	.mobile li {
		padding: 1rem 0.5rem;
		text-align: center;
	}
	.logo {
		transition: margin 0.05s ease-out;
		min-width: 3rem;
		max-width: 7.5rem;
	}
	.logo img {
		object-fit: contain;
		transition: transform 0.05s ease-out;
	}
	.mobile-logo {
		margin: 0 1.4rem !important;
	}
	/* .sticky-logo > img {
		transform: none !important;
	} */
</style>
