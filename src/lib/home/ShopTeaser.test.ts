import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ProductGroup } from '$lib/shop/types';

const { shopConfig } = vi.hoisted(() => ({ shopConfig: { enabled: true } }));
vi.mock('$lib/shop/config', () => ({
	get SHOP_ENABLED() {
		return shopConfig.enabled;
	}
}));

import ShopTeaser from './ShopTeaser.svelte';

function group(): ProductGroup {
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
		]
	};
}

beforeEach(() => {
	shopConfig.enabled = true;
});

describe('ShopTeaser', () => {
	it('shows the Coming Soon variant when the shop is gated', () => {
		shopConfig.enabled = false;
		render(ShopTeaser, { props: { groups: [] } });
		expect(screen.getByText('Coming soon')).toBeInTheDocument();
		expect(screen.queryByText('Classic Trucker')).not.toBeInTheDocument();
		expect(screen.queryByText('View all →')).not.toBeInTheDocument();
	});

	it('renders the product grid with per-color cards when live', () => {
		render(ShopTeaser, { props: { groups: [group()] } });
		expect(screen.getByText('Rep the brand')).toBeInTheDocument();
		expect(screen.getByText('Classic Trucker')).toBeInTheDocument();
		// The single color variant ("Lavender") now shows as its own subtitle.
		expect(screen.getByText('Lavender')).toBeInTheDocument();
	});

	it('renders no section when live with no groups', () => {
		render(ShopTeaser, { props: { groups: [] } });
		expect(screen.queryByText('Coming soon')).not.toBeInTheDocument();
		expect(screen.queryByText('Rep the brand')).not.toBeInTheDocument();
	});
});
