<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const routes = [
		{ href: '/music', label: 'MUSIC' },
		{ href: '/shows', label: 'SHOWS' },
		{ href: '/shop', label: 'SHOP' },
		{ href: '/contact', label: 'CONTACT' }
	] as const;

	const menuId = 'mobile-nav-menu';

	// The path the menu was last opened on. The menu is considered open only
	// while the current path still matches it, so navigating away (which
	// changes page.url.pathname) closes the menu without an $effect.
	let openedOnPath = $state<string | null>(null);
	const open = $derived(openedOnPath === page.url.pathname);

	function toggle() {
		openedOnPath = open ? null : page.url.pathname;
	}

	function close() {
		openedOnPath = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

<nav>
	<!-- Desktop nav: inline links, unchanged from the original. -->
	<ul class="hidden items-center gap-5 md:flex lg:gap-8">
		{#each routes as route (route.href)}
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
		class="hamburger md:hidden"
		aria-label={open ? 'Close menu' : 'Open menu'}
		aria-expanded={open}
		aria-controls={menuId}
		onclick={toggle}
	>
		<span aria-hidden="true">{open ? '✕' : '☰'}</span>
	</button>

	<!-- Mobile dropdown panel, full-width below the sticky header. -->
	{#if open}
		<ul
			id={menuId}
			class="bg-missy-deep-purple border-missy-classic-lavender/15 fixed top-16 right-0 left-0 z-20 flex flex-col border-b px-4 py-2 shadow-lg md:hidden"
		>
			{#each routes as route (route.href)}
				<li>
					<a
						href={resolve(route.href)}
						class="nav-link block py-3"
						aria-current={page.url.pathname === route.href ? 'page' : undefined}
						onclick={close}
					>
						{route.label}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</nav>

<style>
	.nav-link {
		font-family: var(--font-cochin);
		font-size: 0.8rem;
		letter-spacing: 0.14em;
		color: var(--color-slate-50);
	}
	.nav-link:hover,
	.nav-link[aria-current='page'] {
		color: var(--color-missy-classic-lavender);
		border-bottom: none;
	}
	.hamburger {
		font-size: 1.25rem;
		line-height: 1;
		color: var(--color-slate-50);
	}
	.hamburger:hover {
		color: var(--color-missy-classic-lavender);
	}
</style>
