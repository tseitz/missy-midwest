<script lang="ts">
	import { page } from '$app/state';

	const routes = [
		{ href: '/music', label: 'MUSIC' },
		{ href: '/shows', label: 'SHOWS' },
		{ href: '/shop', label: 'SHOP' },
		{ href: '/contact', label: 'CONTACT' }
	];
</script>

<nav>
	<ul class="flex items-center gap-5 lg:gap-8">
		{#each routes as route (route.href)}
			<li>
				<a
					href={route.href}
					class="nav-link"
					aria-current={page.url.pathname === route.href ? 'page' : undefined}
				>
					{route.label}
				</a>
			</li>
		{/each}
	</ul>
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
</style>
