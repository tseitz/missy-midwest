import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CartDrawer from './CartDrawer.svelte';
import { cart } from './cart.svelte';

beforeEach(() => {
	cart.clear();
	cart.open = true;
});

function seed() {
	cart.add(
		{ priceId: 'price_a', productId: 'p1', label: 'Lavender', image: '', price: 3200, stock: 8 },
		{
			slug: 'trucker',
			name: 'Classic Trucker',
			description: '',
			variantType: 'color',
			image: '',
			fromPrice: 3200,
			variants: []
		}
	);
}

describe('CartDrawer', () => {
	it('shows an empty message when the cart has no lines', () => {
		render(CartDrawer);
		expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
	});

	it('renders a line and an aggregated subtotal when items are present', () => {
		seed();
		seed(); // qty 2 → subtotal ($64.00) differs from the unit price ($32.00)
		render(CartDrawer);
		expect(screen.getByText('Classic Trucker — Lavender')).toBeInTheDocument();
		expect(screen.getByText('$32.00')).toBeInTheDocument(); // unit price
		expect(screen.getByText('$64.00')).toBeInTheDocument(); // subtotal
	});

	it('removes a line when its remove button is clicked', async () => {
		seed();
		render(CartDrawer);
		await screen.getByRole('button', { name: /remove/i }).click();
		expect(cart.lines).toHaveLength(0);
	});

	it('POSTs cart lines to the checkout endpoint and redirects', async () => {
		seed();
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ url: 'https://checkout.stripe.com/x' })
		});
		vi.stubGlobal('fetch', fetchMock);
		const location = { href: '' };
		vi.stubGlobal('location', location as Location);

		render(CartDrawer);
		await screen.getByRole('button', { name: /checkout/i }).click();
		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());

		const [path, init] = fetchMock.mock.calls[0];
		expect(path).toBe('/shop/checkout');
		expect(JSON.parse(init.body)).toEqual([{ priceId: 'price_a', quantity: 1 }]);

		vi.unstubAllGlobals();
	});
});
