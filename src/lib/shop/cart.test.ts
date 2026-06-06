import { describe, it, expect, beforeEach } from 'vitest';
import { Cart } from './cart.svelte';
import type { ProductGroup, Variant } from './types';

function variant(over: Partial<Variant> = {}): Variant {
	return {
		priceId: 'price_a',
		productId: 'prod_a',
		label: 'Lavender',
		image: 'https://img/a.png',
		price: 3200,
		stock: 8,
		...over
	};
}

function group(over: Partial<ProductGroup> = {}): ProductGroup {
	return {
		slug: 'classic-trucker',
		name: 'Classic Trucker',
		description: '',
		variantType: 'color',
		image: '',
		fromPrice: 3200,
		variants: [variant()],
		...over
	};
}

describe('Cart', () => {
	let cart: Cart;
	beforeEach(() => {
		cart = new Cart();
	});

	it('adds a variant as a new line with qty 1', () => {
		cart.add(variant(), group());
		expect(cart.lines).toHaveLength(1);
		expect(cart.lines[0]).toMatchObject({
			priceId: 'price_a',
			productId: 'prod_a',
			groupSlug: 'classic-trucker',
			label: 'Classic Trucker — Lavender',
			unitPrice: 3200,
			qty: 1
		});
	});

	it('increments qty when the same variant is added again', () => {
		cart.add(variant(), group());
		cart.add(variant(), group());
		expect(cart.lines).toHaveLength(1);
		expect(cart.lines[0].qty).toBe(2);
	});

	it('clamps qty to available stock when adding', () => {
		const v = variant({ stock: 2 });
		cart.add(v, group());
		cart.add(v, group());
		cart.add(v, group());
		expect(cart.lines[0].qty).toBe(2);
	});

	it('setQty clamps between 1 and stock', () => {
		cart.add(variant({ stock: 5 }), group());
		cart.setQty('price_a', 99);
		expect(cart.lines[0].qty).toBe(5);
		cart.setQty('price_a', 0);
		expect(cart.lines[0].qty).toBe(1);
	});

	it('removes a line by priceId', () => {
		cart.add(variant(), group());
		cart.remove('price_a');
		expect(cart.lines).toHaveLength(0);
	});

	it('clears all lines', () => {
		cart.add(variant(), group());
		cart.add(variant({ priceId: 'price_b' }), group());
		cart.clear();
		expect(cart.lines).toHaveLength(0);
	});

	it('computes count and subtotal across lines', () => {
		cart.add(variant({ priceId: 'price_a', price: 3200, stock: 9 }), group());
		cart.add(variant({ priceId: 'price_a', price: 3200, stock: 9 }), group());
		cart.add(variant({ priceId: 'price_b', price: 2800, stock: 9 }), group());
		expect(cart.count).toBe(3);
		expect(cart.subtotal).toBe(3200 * 2 + 2800);
	});

	it('exposes an open flag for the drawer', () => {
		expect(cart.open).toBe(false);
		cart.open = true;
		expect(cart.open).toBe(true);
	});
});
