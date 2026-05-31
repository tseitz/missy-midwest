/**
 * The site's primary navigation links — the single source for both the header
 * (`Nav.svelte`) and the footer (`Footer.svelte`). The header renders the labels
 * uppercased via CSS, so the canonical casing here is Title case.
 */
export const NAV_LINKS = [
	{ href: '/music', label: 'Music' },
	{ href: '/shows', label: 'Shows' },
	{ href: '/shop', label: 'Shop' },
	{ href: '/contact', label: 'Contact' }
] as const;
