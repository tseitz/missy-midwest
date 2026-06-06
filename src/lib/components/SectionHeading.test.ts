import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import SectionHeading from './SectionHeading.svelte';

describe('SectionHeading', () => {
	it('renders the eyebrow label and title', () => {
		render(SectionHeading, { props: { label: 'Shop', title: 'Rep the brand' } });
		expect(screen.getByText('Shop')).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Rep the brand' })).toBeInTheDocument();
	});
});
