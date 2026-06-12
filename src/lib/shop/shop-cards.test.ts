import { describe, it, expect } from 'vitest';
import { variantSlug, toShopCards } from './shop-cards';
import type { ProductGroup, Variant } from './types';

function variant(over: Partial<Variant> = {}): Variant {
	return {
		priceId: 'pr1',
		productId: 'p1',
		label: 'Blue',
		image: 'https://img/blue.png',
		price: 3500,
		stock: 4,
		...over
	};
}

function group(over: Partial<ProductGroup> = {}): ProductGroup {
	return {
		slug: 'corduroy-hat',
		name: 'Corduroy Hat',
		description: 'A hat',
		variantType: 'color',
		image: 'https://img/blue.png',
		fromPrice: 3500,
		variants: [variant()],
		...over
	};
}

describe('variantSlug', () => {
	it('lowercases and hyphenates', () => {
		expect(variantSlug('Sky Blue')).toBe('sky-blue');
	});

	it('strips non-alphanumeric characters', () => {
		expect(variantSlug('Off-White / Cream!')).toBe('off-white-cream');
	});
});

describe('toShopCards', () => {
	it('expands a color group into one card per variant', () => {
		const cards = toShopCards([
			group({
				variants: [
					variant({ priceId: 'pr1', label: 'Blue', image: 'https://img/blue.png', stock: 4 }),
					variant({ priceId: 'pr2', label: 'Purple', image: 'https://img/purple.png', stock: 0 })
				]
			})
		]);
		expect(cards).toHaveLength(2);
		expect(cards[0]).toMatchObject({
			id: 'corduroy-hat-blue',
			slug: 'corduroy-hat',
			variantSlug: 'blue',
			name: 'Corduroy Hat',
			variantLabel: 'Blue',
			image: 'https://img/blue.png',
			price: 3500,
			priceVaries: false,
			soldOut: false
		});
		expect(cards[1]).toMatchObject({
			id: 'corduroy-hat-purple',
			variantSlug: 'purple',
			variantLabel: 'Purple',
			soldOut: true
		});
	});

	it('preserves the group variant order', () => {
		const cards = toShopCards([
			group({
				variants: [
					variant({ priceId: 'pr1', label: 'Purple' }),
					variant({ priceId: 'pr2', label: 'Blue' })
				]
			})
		]);
		expect(cards.map((c) => c.variantLabel)).toEqual(['Purple', 'Blue']);
	});

	it('keeps a size group as a single group card with a "from" flag', () => {
		const cards = toShopCards([
			group({
				slug: 'tour-tee',
				name: 'Tour Tee',
				variantType: 'size',
				image: 'https://img/tee.png',
				fromPrice: 2800,
				variants: [
					variant({ priceId: 'pr1', label: 'S', price: 2800, stock: 5 }),
					variant({ priceId: 'pr2', label: 'M', price: 3000, stock: 0 })
				]
			})
		]);
		expect(cards).toHaveLength(1);
		expect(cards[0]).toMatchObject({
			id: 'tour-tee',
			slug: 'tour-tee',
			name: 'Tour Tee',
			image: 'https://img/tee.png',
			price: 2800,
			priceVaries: true,
			soldOut: false
		});
		expect(cards[0].variantSlug).toBeUndefined();
		expect(cards[0].variantLabel).toBeUndefined();
	});

	it('keeps a single-variant group as one group card without a "from" flag', () => {
		const cards = toShopCards([
			group({
				slug: 'beanie',
				name: 'Beanie',
				variantType: null,
				fromPrice: 2500,
				variants: [variant({ label: 'One', price: 2500, stock: 3 })]
			})
		]);
		expect(cards).toHaveLength(1);
		expect(cards[0]).toMatchObject({ id: 'beanie', price: 2500, priceVaries: false });
		expect(cards[0].variantSlug).toBeUndefined();
	});

	it('marks a group card sold out only when every variant is out of stock', () => {
		const [card] = toShopCards([
			group({
				slug: 'tour-tee',
				variantType: 'size',
				variants: [variant({ stock: 0 }), variant({ priceId: 'pr2', stock: 0 })]
			})
		]);
		expect(card.soldOut).toBe(true);
	});
});
