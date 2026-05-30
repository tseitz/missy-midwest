import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Button from './Button.svelte';

describe('Button', () => {
	it('renders an anchor when href is provided', () => {
		render(Button, { props: { href: '/shop', label: 'Shop' } });
		const link = screen.getByRole('link', { name: 'Shop' });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute('href', '/shop');
	});

	it('renders a button when no href is provided', () => {
		render(Button, { props: { label: 'Submit' } });
		expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
	});

	it('applies the outline variant class', () => {
		render(Button, { props: { label: 'More', variant: 'outline' } });
		expect(screen.getByText('More')).toHaveClass('btn-outline');
	});
});
