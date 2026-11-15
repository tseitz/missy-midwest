<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Nav from '$lib/header/Nav.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { cart } from '$lib/shop/cart.svelte';
	import { SHOP_ENABLED } from '$lib/shop/config';

	// Transparent (and dark-scoped) only over the home hero photo; a solid cream
	// bar everywhere else and once the user scrolls.
	let scrolled = $state(false);
	const overHero = $derived(page.route.id === '/' && !scrolled);
	function syncScrolled() {
		scrolled = window.scrollY > 16;
	}
	onMount(syncScrolled);
</script>

<svelte:window onscroll={syncScrolled} />

<svelte:head>
	<!-- Hex copies of --color-surface (.tone-sea / :root) in app.css: meta tags can't read CSS vars. -->
	<meta name="theme-color" content={overHero ? '#0b3a42' : '#fff8ec'} />
</svelte:head>

<header
	class={['site-header fixed top-0 z-30 w-full', overHero && 'tone-sea']}
	data-solid={!overHero}
>
	<div class="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 md:px-8">
		<a href={resolve('/')} class="brand" aria-label="Missy Midwest — home">
			<Logo class="text-fg h-7 md:h-8" />
		</a>
		<div class="flex items-center gap-4">
			<Nav />
			{#if SHOP_ENABLED}
				<button
					type="button"
					aria-label={cart.count > 0
						? `Open cart, ${cart.count} item${cart.count === 1 ? '' : 's'}`
						: 'Open cart'}
					class={[
						'relative order-first transition md:order-none',
						cart.count > 0
							? 'text-highlight hover:text-highlight-soft'
							: 'text-fg hover:text-accent'
					]}
					onclick={() => (cart.open = true)}
				>
					<svg
						class="h-6 w-6"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="6" cy="19" r="2" />
						<circle cx="17" cy="19" r="2" />
						<path d="M17 17H6V3H4" />
						<path d="M6 5l14 1-1 7H6" />
					</svg>
					{#if cart.count > 0}
						<span
							class="bg-accent absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-on-accent text-[10px] font-bold"
						>
							{cart.count}
						</span>
					{/if}
				</button>
			{/if}
		</div>
	</div>
</header>

<style>
	.brand {
		display: inline-flex;
		align-items: center;
		transition: opacity 0.2s ease;
	}
	.brand:hover {
		border-bottom: none;
		opacity: 0.85;
	}
	.site-header {
		border-bottom: 1px solid transparent;
		transition:
			background-color 0.3s ease,
			border-color 0.3s ease,
			box-shadow 0.3s ease;
	}
	/* Legibility scrim while transparent over the hero photo; fades as the solid bar takes over. */
	.site-header::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--color-surface-deep) 50%, transparent),
			transparent
		);
		opacity: 1;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}
	.site-header[data-solid='true'] {
		background-color: color-mix(in srgb, var(--color-surface) 90%, transparent);
		border-bottom-color: color-mix(in srgb, var(--color-fg) 10%, transparent);
		box-shadow: 0 10px 30px -20px color-mix(in srgb, var(--color-surface-deep) 45%, transparent);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}
	.site-header[data-solid='true']::before {
		opacity: 0;
	}
</style>
