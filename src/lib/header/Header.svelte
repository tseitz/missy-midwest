<script lang="ts">
	import { resolve } from '$app/paths';
	import Nav from '$lib/header/Nav.svelte';
	import { cart } from '$lib/shop/cart.svelte';

	// Transparent over the hero at the top of the page; condenses to a solid
	// glass bar once the user scrolls past the threshold.
	let scrolled = $state(false);
</script>

<svelte:window onscroll={() => (scrolled = window.scrollY > 16)} />

<header class="site-header fixed top-0 z-30 w-full" data-scrolled={scrolled}>
	<div class="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 md:px-8">
		<a href={resolve('/')} class="missy-header text-lg tracking-wide text-white md:text-xl">
			MISSY MIDWEST
		</a>
		<div class="flex items-center gap-4">
			<Nav />
			<button
				type="button"
				aria-label="Open cart"
				class="relative order-first text-lake-sunrise transition hover:text-lake-sunset md:order-none"
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
						class="bg-missy-magenta absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
					>
						{cart.count}
					</span>
				{/if}
			</button>
		</div>
	</div>
</header>

<style>
	.site-header {
		border-bottom: 1px solid transparent;
		transition:
			background-color 0.3s ease,
			border-color 0.3s ease,
			box-shadow 0.3s ease;
	}
	/* Legibility scrim while transparent over the hero; fades as the solid bar takes over. */
	.site-header::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(180deg, rgba(20, 10, 50, 0.5), transparent);
		opacity: 1;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}
	.site-header[data-scrolled='true'] {
		background-color: color-mix(in srgb, var(--color-missy-deep-purple) 82%, transparent);
		border-bottom-color: color-mix(in srgb, var(--color-missy-classic-lavender) 15%, transparent);
		box-shadow: 0 10px 30px -14px rgba(0, 0, 0, 0.65);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}
	.site-header[data-scrolled='true']::before {
		opacity: 0;
	}
</style>
