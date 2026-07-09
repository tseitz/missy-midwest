import { describe, it, expect } from 'vitest';
import { formatPrice, stockStatus } from './format';

describe('formatPrice', () => {
	it('formats cents as a dollar string', () => {
		expect(formatPrice(3200)).toBe('$32.00');
		expect(formatPrice(2850)).toBe('$28.50');
		expect(formatPrice(0)).toBe('$0.00');
	});
});

describe('stockStatus', () => {
	it('reports sold out at zero or below', () => {
		expect(stockStatus(0)).toEqual({
			soldOut: true,
			low: false,
			comingSoon: false,
			label: 'Sold out'
		});
		expect(stockStatus(-3)).toEqual({
			soldOut: true,
			low: false,
			comingSoon: false,
			label: 'Sold out'
		});
	});

	it('reports low stock at or below 5', () => {
		expect(stockStatus(5)).toEqual({
			soldOut: false,
			low: true,
			comingSoon: false,
			label: 'Only 5 left'
		});
		expect(stockStatus(1)).toEqual({
			soldOut: false,
			low: true,
			comingSoon: false,
			label: 'Only 1 left'
		});
	});

	it('reports in stock above 5', () => {
		expect(stockStatus(6)).toEqual({
			soldOut: false,
			low: false,
			comingSoon: false,
			label: 'In stock'
		});
	});

	it('reports "Coming soon" when out of stock and restocking, still sold out', () => {
		expect(stockStatus(0, true)).toEqual({
			soldOut: true,
			low: false,
			comingSoon: true,
			label: 'Coming soon'
		});
	});

	it('ignores the restocking flag while stock remains', () => {
		expect(stockStatus(3, true)).toEqual({
			soldOut: false,
			low: true,
			comingSoon: false,
			label: 'Only 3 left'
		});
	});
});
