<script lang="ts">
	import missyLogo from './images/missy-midwest-neon-cropped.png';
	export let mobileNav: boolean;
	export let stickyLogo: boolean;
	let y = 0;

	let margin = -3.5;
	let translateX = '0';
	let translateY = '80%';

	$: margin = !stickyLogo && Math.min(0, -3.5 + y / 100);
	$: scale = !stickyLogo && Math.max(1, 5 - y / 125);
	$: translateY = !stickyLogo && Math.max(0, 80 - y / 6.25) + '%';
</script>

<svelte:window bind:scrollY={y} />

<nav class={mobileNav && mobileNav ? 'mobile' : ''}>
	{#if mobileNav}
		<ul>
			<li><a class="text-missy-500 text-lg" href="#music">Music</a></li>
			<li><a class="text-missy-500 text-lg" href="#dates">Dates</a></li>
			<li><a class="text-missy-500 text-lg" href="#about">About</a></li>
			<li><a class="text-missy-500 text-lg" href="#press">Press</a></li>
		</ul>
		<div class="logo {stickyLogo ? 'sticky-logo' : ''}" style="margin: 0 {margin}rem">
			<img
				src={missyLogo}
				alt="Missy Midwest"
				style="transform: scale({scale}) translate({translateX}, {translateY});"
			/>
		</div>
	{:else}
		<ul>
			<li><a class="text-missy-500 text-lg" href="#music">Music</a></li>
			<li>
				<a class="text-missy-500 text-lg" href="#dates">Upcoming Dates</a>
			</li>
			<div class="logo {stickyLogo ? 'sticky-logo' : ''}" style="margin: 0 {margin}rem">
				<img
					src={missyLogo}
					alt="Missy Midwest"
					style="transform: scale({scale}) translate({translateX}, {translateY});"
				/>
			</div>
			<li><a class="text-missy-500 text-lg" href="#about">About</a></li>
			<li><a class="text-missy-500 text-lg" href="#press">Press Kit</a></li>
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
		/* margin-top: 3.75rem; */
		background-color: var(--missy-white-100);
		/* height: calc(100% - 3.75rem); */
		/* min-width: 240px; */
	}
	li {
		z-index: 1;
		padding: 0 1rem;
	}
	.mobile li {
		padding: 1rem;
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
	.sticky-logo {
		margin: 0 1.4rem !important;
	}
	.sticky-logo > img {
		transform: none !important;
	}
</style>
