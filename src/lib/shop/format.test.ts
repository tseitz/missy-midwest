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
		expect(stockStatus(0)).toEqual({ soldOut: true, low: false, label: 'Sold out' });
		expect(stockStatus(-3)).toEqual({ soldOut: true, low: false, label: 'Sold out' });
	});

	it('reports low stock at or below 5', () => {
		expect(stockStatus(5)).toEqual({ soldOut: false, low: true, label: 'Only 5 left' });
		expect(stockStatus(1)).toEqual({ soldOut: false, low: true, label: 'Only 1 left' });
	});

	it('reports in stock above 5', () => {
		expect(stockStatus(6)).toEqual({ soldOut: false, low: false, label: 'In stock' });
	});
});
