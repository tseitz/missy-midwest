import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ProductCard from './ProductCard.svelte';
import type { ShopCard } from './shop-cards';

function card(over: Partial<ShopCard> = {}): ShopCard {
	return {
		id: 'corduroy-hat-blue',
		slug: 'corduroy-hat',
		variantSlug: 'blue',
		name: 'Corduroy Hat',
		variantLabel: 'Blue',
		image: 'https://img/blue.png',
		price: 3500,
		priceVaries: false,
		soldOut: false,
		...over
	};
}

describe('ProductCard', () => {
	it('links to the variant with a ?variant= query param', () => {
		render(ProductCard, { props: { card: card() } });
		expect(screen.getByRole('link')).toHaveAttribute('href', '/shop/corduroy-hat?variant=blue');
	});

	it('shows the name, color subtitle, and exact price for a color card', () => {
		render(ProductCard, { props: { card: card() } });
		expect(screen.getByText('Corduroy Hat')).toBeInTheDocument();
		expect(screen.getByText('Blue')).toBeInTheDocument();
		expect(screen.getByText('$35.00')).toBeInTheDocument();
	});

	it('links to the plain group page and shows a "from" price for a group card', () => {
		render(ProductCard, {
			props: {
				card: card({
					id: 'tour-tee',
					slug: 'tour-tee',
					variantSlug: undefined,
					name: 'Tour Tee',
					variantLabel: undefined,
					price: 2800,
					priceVaries: true
				})
			}
		});
		expect(screen.getByRole('link')).toHaveAttribute('href', '/shop/tour-tee');
		expect(screen.getByText('from $28.00')).toBeInTheDocument();
	});

	it('shows a sold-out marker when the card is sold out', () => {
		render(ProductCard, { props: { card: card({ soldOut: true }) } });
		expect(screen.getByText('Sold out')).toBeInTheDocument();
	});
});
