<script lang="ts">
	import { page } from '$app/state';
	import { asset, resolve } from '$app/paths';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import Button from '$lib/components/Button.svelte';
	import { trapFocus } from '$lib/a11y/focus-trap';
	import { HEADER_NAV_LINKS } from '$lib/nav';

	const menuId = 'mobile-nav-menu';

	// The path the menu was last opened on. The menu is considered open only
	// while the current path still matches it, so navigating away closes it.
	let openedOnPath = $state<string | null>(null);
	const open = $derived(openedOnPath === page.url.pathname);

	function toggle() {
		openedOnPath = open ? null : page.url.pathname;
	}

	function close() {
		openedOnPath = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}

	// Lock background scroll while the full-screen menu is open.
	$effect(() => {
		if (!open) return;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

<nav>
	<!-- Desktop: inline links on the right. -->
	<ul class="hidden items-center gap-6 md:flex lg:gap-9">
		{#each HEADER_NAV_LINKS as route (route.href)}
			<li>
				<a
					href={resolve(route.href)}
					class="nav-link"
					aria-current={page.url.pathname === route.href ? 'page' : undefined}
				>
					{route.label}
				</a>
			</li>
		{/each}
	</ul>

	<!-- Mobile: hamburger toggle. -->
	<button
		type="button"
		class="icon-btn md:hidden"
		aria-label="Open menu"
		aria-expanded={open}
		aria-controls={menuId}
		onclick={toggle}
	>
		<svg
			class="h-6 w-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			aria-hidden="true"
		>
			<path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
		</svg>
	</button>

	<!-- Mobile: full-screen overlay menu. -->
	{#if open}
		<div
			id={menuId}
			{@attach trapFocus}
			class="mobile-menu fixed inset-0 z-40 flex flex-col md:hidden"
		>
			<div class="flex h-16 items-center justify-between px-4">
				<img
					src={asset('/header/missy-midwest-logo-white.png')}
					alt="Missy Midwest"
					width="2551"
					height="375"
					class="h-7 w-auto"
				/>
				<button type="button" class="icon-btn" aria-label="Close menu" onclick={close}>
					<svg
						class="h-6 w-6"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						aria-hidden="true"
					>
						<path d="M6 6l12 12M18 6 6 18" />
					</svg>
				</button>
			</div>

			<ul class="flex flex-1 flex-col items-center justify-center gap-8">
				{#each HEADER_NAV_LINKS as route (route.href)}
					<li>
						<a
							href={resolve(route.href)}
							class="mobile-link"
							aria-current={page.url.pathname === route.href ? 'page' : undefined}
							onclick={close}
						>
							{route.label}
						</a>
					</li>
				{/each}
			</ul>

			<div class="flex flex-col items-center gap-6 px-4 pb-12">
				<Button href={resolve('/contact')} label="Book Missy →" variant="fill" />
				<SocialLinks size={24} />
			</div>
		</div>
	{/if}
</nav>

<style>
	.nav-link {
		font-family: var(--font-cochin);
		font-size: 0.8rem;
		letter-spacing: 0.14em;
		color: var(--color-slate-50);
		transition: color 0.2s ease;
		text-transform: uppercase;
	}
	.nav-link:hover,
	.nav-link[aria-current='page'] {
		color: var(--color-missy-blush);
		border-bottom: none;
	}
	.icon-btn {
		color: var(--color-slate-50);
		transition: color 0.2s ease;
	}
	.icon-btn:hover {
		color: var(--color-missy-blush);
	}
	.mobile-link {
		font-family: var(--font-cochin);
		font-size: 2rem;
		letter-spacing: 0.08em;
		color: var(--color-slate-50);
		transition: color 0.2s ease;
		text-transform: uppercase;
	}
	.mobile-link:hover,
	.mobile-link[aria-current='page'] {
		color: var(--color-missy-blush);
		border-bottom: none;
	}
	/* Cohesive purple menu with a warm-pink glow — no clashing orange wash. */
	.mobile-menu {
		background:
			radial-gradient(
				120% 75% at 82% 0%,
				color-mix(in srgb, var(--color-missy-blush) 36%, transparent) 0%,
				transparent 58%
			),
			linear-gradient(180deg, var(--color-missy-deep-purple) 0%, var(--color-missy-plum) 100%);
	}
	@media (prefers-reduced-motion: no-preference) {
		.mobile-menu {
			animation: menu-in 0.25s ease-out both;
		}
	}
	@keyframes menu-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
