<script lang="ts">
	export let navWidth: number;
	export let mobileNav: boolean;
	let y = 0;

	let margin = -4.5;
	let translateX = '0';
	let translateY = '340%';

	$: mobileLogo = navWidth < 480;
	$: margin = mobileNav ? 0 : Math.min(0, -4.7 + y / 100);
	$: scale = mobileNav ? Math.max(1, 2.8 - y / 125) : Math.max(1.06, 5.5 - y / 100);
	$: translateY = mobileNav ? Math.max(0, 400 - y / 0.5) + '%' : Math.max(0, 380 - y / 1.2) + '%';
</script>

<svelte:window bind:scrollY={y} />

<nav class={mobileNav && mobileNav ? 'mobile' : ''}>
	{#if mobileNav}
		<ul class="bg-base-100">
			<li class="px-1 lg:px-4 2xl:px-8">
				<a class="text-base-content text-md md:text-lg" href="#music">Music</a>
			</li>
			<li class="px-1 lg:px-4 2xl:px-8">
				<a class="text-base-content text-md md:text-lg" href="#bio">Bio</a>
			</li>
			<li class="px-1 lg:px-4 2xl:px-8">
				<a class="text-base-content text-md md:text-lg" href="#dates">Dates</a>
			</li>
			<li class="px-1 lg:px-4 2xl:px-8">
				<a class="text-base-content text-md md:text-lg" href="#contact">Contact</a>
			</li>
			<li class="px-1 lg:px-4 2xl:px-8">
				<a class="text-base-content text-md md:text-lg" href="#support">Support</a>
			</li>
			<li class="px-1 lg:px-4 2xl:px-8">
				<a class="text-base-content text-md md:text-lg" href="#press">Press Kit</a>
			</li>
		</ul>
		<div class="logo {mobileLogo ? 'mobile-logo' : ''}" style="margin: 0 {margin}rem">
			<img
				src="/header/missy-midwest-main.png"
				alt="Missy Midwest"
				style="transform: scale({scale}) translate({translateX}, {translateY});"
			/>
		</div>
	{:else}
		<ul>
			<li class="px-1 lg:px-4 2xl:px-8">
				<a class="text-base-content text-lg xl:text-xl" href="#music">Music</a>
			</li>
			<li class="px-1 lg:px-4 2xl:px-8">
				<a class="text-base-content text-lg xl:text-xl" href="#bio">Bio</a>
			</li>
			<li class="px-1 lg:px-4 2xl:px-8 2xl:pr-12">
				<a class="text-base-content text-lg xl:text-xl" href="#dates">Dates</a>
			</li>
			<div class="logo {mobileLogo ? 'mobile-logo' : ''}" style="margin: 0 {margin}rem">
				<img
					src="/header/missy-midwest-main.png"
					alt="Missy Midwest"
					style="transform: scale({scale}) translate({translateX}, {translateY});"
				/>
			</div>
			<li class="px-1 lg:px-4 2xl:px-8 2xl:pl-12">
				<a class="text-base-content text-lg xl:text-xl" href="#contact">Contact</a>
			</li>
			<li class="px-1 lg:px-4 2xl:px-8">
				<a class="text-base-content text-lg xl:text-xl" href="#support">Support</a>
			</li>
			<li class="px-1 lg:px-4 2xl:px-8">
				<a class="text-base-content text-lg xl:text-xl" href="#press">Press Kit</a>
			</li>
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
		left: 0;
		width: 100%;
		bottom: 0;
		height: 4rem;
	}
	li {
		z-index: 1;
		/* padding: 0 1rem; */
	}
	.mobile li {
		padding: 1rem 0.5rem;
		text-align: center;
	}
	.logo {
		transition: margin 0.05s ease-out;
		min-width: 3rem;
		max-width: 9.5rem;
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
