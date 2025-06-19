<script lang="ts">
	export let navWidth: number;
	export let mobileNav: boolean;

	let y = 0;

	// Navigation routes configuration
	const routes = [
		{ href: '#music', label: 'MUSIC' },
		{ href: '#bio', label: 'BIO' },
		{ href: '#dates', label: 'DATES' },
		{ href: '#contact', label: 'CONTACT' },
		{ href: '#support', label: 'SUPPORT' },
		{ href: '#press', label: 'PRESS KIT' }
	];

	// Computed values
	$: mobileLogo = navWidth < 480;
	$: margin = mobileNav ? 0 : Math.min(0, -4.7 + y / 100);
	$: scale = mobileNav ? Math.max(1, 2.8 - y / 125) : Math.max(1.06, 5.5 - y / 100);
	$: translateY = mobileNav ? Math.max(0, 400 - y / 0.5) + '%' : Math.max(0, 380 - y / 1.2) + '%';

	// Split routes for desktop layout (logo in center)
	$: leftRoutes = routes.slice(0, 3);
	$: rightRoutes = routes.slice(3);
</script>

<svelte:window bind:scrollY={y} />

<nav class={mobileNav ? 'mobile' : ''}>
	{#if mobileNav}
		<!-- Mobile Navigation -->
		<ul class="bg-base-100">
			{#each routes as route}
				<li class="px-1 lg:px-4 2xl:px-8">
					<a class="text-base-content text-md" href={route.href}>
						{route.label}
					</a>
				</li>
			{/each}
		</ul>

		<!-- Mobile Logo -->
		<div class="logo {mobileLogo ? 'mobile-logo' : ''}" style="margin: 0 {margin}rem">
			<img
				src="/header/missy-midwest-main.png"
				alt="Missy Midwest"
				style="transform: scale({scale}) translate(0, {translateY});"
			/>
		</div>
	{:else}
		<!-- Desktop Navigation -->
		<ul>
			<!-- Left side routes -->
			{#each leftRoutes as route}
				<li class="px-1 lg:px-4 2xl:px-8">
					<a class="text-base-content text-md xl:text-lg" href={route.href}>
						{route.label}
					</a>
				</li>
			{/each}

			<!-- Center logo -->
			<div class="logo {mobileLogo ? 'mobile-logo' : ''}" style="margin: 0 {margin}rem">
				<img
					src="/header/missy-midwest-main.png"
					alt="Missy Midwest"
					style="transform: scale({scale}) translate(0, {translateY});"
				/>
			</div>

			<!-- Right side routes -->
			{#each rightRoutes as route}
				<li class="px-1 lg:px-4 2xl:px-8 {route.href === '#contact' ? '2xl:pl-12' : ''}">
					<a class="text-base-content text-md xl:text-lg" href={route.href}>
						{route.label}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</nav>

<style>
	ul {
		display: flex;
		align-items: center;
		justify-content: space-between;
		list-style: none;
		font-family: var(--missy-cochin);
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
</style>
