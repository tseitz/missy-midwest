import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ProductCard from './ProductCard.svelte';
import type { ProductGroup } from './types';

function group(over: Partial<ProductGroup> = {}): ProductGroup {
	return {
		slug: 'classic-trucker',
		name: 'Classic Trucker',
		description: 'A hat',
		variantType: 'color',
		image: 'https://img/trucker.png',
		fromPrice: 3200,
		variants: [
			{
				priceId: 'pr1',
				productId: 'p1',
				label: 'Lavender',
				image: 'https://img/trucker.png',
				price: 3200,
				stock: 8
			}
		],
		...over
	};
}

describe('ProductCard', () => {
	it('links to the group detail page', () => {
		render(ProductCard, { props: { group: group() } });
		expect(screen.getByRole('link')).toHaveAttribute('href', '/shop/classic-trucker');
	});

	it('shows the name and a "from" price for multi-variant groups', () => {
		render(ProductCard, {
			props: {
				group: group({
					variants: [
						{ priceId: 'pr1', productId: 'p1', label: 'A', image: '', price: 3200, stock: 1 },
						{ priceId: 'pr2', productId: 'p2', label: 'B', image: '', price: 3500, stock: 1 }
					]
				})
			}
		});
		expect(screen.getByText('Classic Trucker')).toBeInTheDocument();
		expect(screen.getByText('from $32.00')).toBeInTheDocument();
	});

	it('shows a sold-out marker when every variant is out of stock', () => {
		render(ProductCard, {
			props: {
				group: group({
					variants: [
						{ priceId: 'pr1', productId: 'p1', label: 'A', image: '', price: 3200, stock: 0 }
					]
				})
			}
		});
		expect(screen.getByText('Sold out')).toBeInTheDocument();
	});
});
