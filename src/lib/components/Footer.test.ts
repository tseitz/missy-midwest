import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Footer from './Footer.svelte';

describe('Footer', () => {
	it('shows the booking CTA and tip links', () => {
		render(Footer);
		expect(screen.getByRole('link', { name: /book missy/i })).toHaveAttribute('href', '/contact');
		expect(screen.getByText(/@missymidwest/i)).toBeInTheDocument();
	});

	it('links to the four primary pages', () => {
		render(Footer);
		for (const name of ['Music', 'Shows', 'Shop', 'Contact']) {
			expect(screen.getByRole('link', { name })).toBeInTheDocument();
		}
	});
});
