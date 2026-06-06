/**
 * The site's primary section links — the single source for the footer's
 * "Explore" column (`Footer.svelte`) and the basis for the header nav
 * (`Nav.svelte`). The header renders the labels uppercased via CSS, so the
 * canonical casing here is Title case.
 */
export const NAV_LINKS = [
	{ href: '/music', label: 'Music' },
	{ href: '/shows', label: 'Shows' },
	{ href: '/shop', label: 'Shop' },
	{ href: '/contact', label: 'Contact' }
] as const;

/**
 * Header navigation — the section links with an explicit Home entry up front,
 * so visitors don't have to rely on the logo to get back home. The footer
 * intentionally omits Home, so it keeps using `NAV_LINKS` directly.
 */
export const HEADER_NAV_LINKS = [{ href: '/', label: 'Home' }, ...NAV_LINKS] as const;
