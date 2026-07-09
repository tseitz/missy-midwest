import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import StockBadge from './StockBadge.svelte';

describe('StockBadge', () => {
	it('shows "Sold out" at zero stock', () => {
		render(StockBadge, { props: { stock: 0 } });
		expect(screen.getByText('Sold out')).toBeInTheDocument();
	});

	it('shows the low-stock count at or below 5', () => {
		render(StockBadge, { props: { stock: 3 } });
		expect(screen.getByText('Only 3 left')).toBeInTheDocument();
	});

	it('shows "In stock" above 5', () => {
		render(StockBadge, { props: { stock: 12 } });
		expect(screen.getByText('In stock')).toBeInTheDocument();
	});

	it('shows "Coming soon" when out of stock and restocking', () => {
		render(StockBadge, { props: { stock: 0, restocking: true } });
		expect(screen.getByText('Coming soon')).toBeInTheDocument();
	});

	it('still shows "Sold out" when out of stock and not restocking', () => {
		render(StockBadge, { props: { stock: 0, restocking: false } });
		expect(screen.getByText('Sold out')).toBeInTheDocument();
	});
});
