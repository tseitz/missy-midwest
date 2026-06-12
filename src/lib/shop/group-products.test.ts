import { describe, it, expect, vi } from 'vitest';
import { groupProducts } from './group-products';
import type { CatalogProductInput } from './types';

function product(over: Partial<CatalogProductInput> & { id: string }): CatalogProductInput {
	return {
		name: 'Default',
		description: 'desc',
		images: ['https://img/default.png'],
		metadata: {},
		price: { id: `price_${over.id}`, unitAmount: 3000 },
		...over
	};
}

describe('groupProducts', () => {
	it('clusters variants sharing a group slug into one ProductGroup', () => {
		const groups = groupProducts([
			product({
				id: 'p1',
				name: 'Trucker Lavender',
				metadata: {
					group: 'trucker',
					groupName: 'Classic Trucker',
					variant: 'Lavender',
					variantType: 'color',
					stock: '8',
					sort: '1'
				}
			}),
			product({
				id: 'p2',
				name: 'Trucker Black',
				metadata: {
					group: 'trucker',
					groupName: 'Classic Trucker',
					variant: 'Black',
					variantType: 'color',
					stock: '0',
					sort: '2'
				}
			})
		]);
		expect(groups).toHaveLength(1);
		expect(groups[0].slug).toBe('trucker');
		expect(groups[0].name).toBe('Classic Trucker');
		expect(groups[0].variantType).toBe('color');
		expect(groups[0].variants.map((v) => v.label)).toEqual(['Lavender', 'Black']);
	});

	it('sorts variants by sort then label', () => {
		const [group] = groupProducts([
			product({ id: 'b', metadata: { group: 'g', variant: 'B', stock: '1', sort: '2' } }),
			product({ id: 'a', metadata: { group: 'g', variant: 'A', stock: '1', sort: '1' } })
		]);
		expect(group.variants.map((v) => v.label)).toEqual(['A', 'B']);
	});

	it('marks a single-variant group with variantType null', () => {
		const [group] = groupProducts([
			product({
				id: 'solo',
				metadata: { group: 'beanie', variant: 'One', variantType: 'color', stock: '4' }
			})
		]);
		expect(group.variants).toHaveLength(1);
		expect(group.variantType).toBeNull();
	});

	it('picks fromPrice as the minimum variant price', () => {
		const [group] = groupProducts([
			product({
				id: 'p1',
				price: { id: 'pr1', unitAmount: 3200 },
				metadata: { group: 'g', variant: 'A', stock: '2' }
			}),
			product({
				id: 'p2',
				price: { id: 'pr2', unitAmount: 2800 },
				metadata: { group: 'g', variant: 'B', stock: '2' }
			})
		]);
		expect(group.fromPrice).toBe(2800);
	});

	it('uses the first in-stock variant image as the group image', () => {
		const [group] = groupProducts([
			product({
				id: 'p1',
				images: ['https://img/a.png'],
				metadata: { group: 'g', variant: 'A', stock: '0', sort: '1' }
			}),
			product({
				id: 'p2',
				images: ['https://img/b.png'],
				metadata: { group: 'g', variant: 'B', stock: '5', sort: '2' }
			})
		]);
		expect(group.image).toBe('https://img/b.png');
	});

	it('skips products missing a group slug or price', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const groups = groupProducts([
			product({ id: 'no-group', metadata: { variant: 'X', stock: '1' } }),
			product({ id: 'no-price', price: null, metadata: { group: 'g', variant: 'Y', stock: '1' } })
		]);
		expect(groups).toEqual([]);
		expect(warn).toHaveBeenCalledTimes(2);
		warn.mockRestore();
	});

	it('treats invalid stock as zero', () => {
		const [group] = groupProducts([
			product({ id: 'p1', metadata: { group: 'g', variant: 'A', stock: 'oops' } })
		]);
		expect(group.variants[0].stock).toBe(0);
	});

	it('groups size variants and keeps sold-out sizes', () => {
		const [group] = groupProducts([
			product({
				id: 's',
				metadata: {
					group: 'tee',
					groupName: 'Tour Tee',
					variant: 'S',
					variantType: 'size',
					stock: '5',
					sort: '1'
				}
			}),
			product({
				id: 'm',
				metadata: {
					group: 'tee',
					groupName: 'Tour Tee',
					variant: 'M',
					variantType: 'size',
					stock: '0',
					sort: '2'
				}
			}),
			product({
				id: 'l',
				metadata: {
					group: 'tee',
					groupName: 'Tour Tee',
					variant: 'L',
					variantType: 'size',
					stock: '9',
					sort: '3'
				}
			})
		]);
		expect(group.variantType).toBe('size');
		expect(group.variants.map((v) => [v.label, v.stock])).toEqual([
			['S', 5],
			['M', 0],
			['L', 9]
		]);
	});

	it('sorts groups alphabetically by name', () => {
		const groups = groupProducts([
			product({
				id: 'z',
				metadata: { group: 'zed', groupName: 'Zed Hat', variant: 'One', stock: '1' }
			}),
			product({
				id: 'a',
				metadata: { group: 'ace', groupName: 'Ace Tee', variant: 'One', stock: '1' }
			})
		]);
		expect(groups.map((g) => g.name)).toEqual(['Ace Tee', 'Zed Hat']);
	});

	it('orders groups by ascending priority before name', () => {
		const groups = groupProducts([
			product({
				id: 'a',
				metadata: { group: 'ace', groupName: 'Ace Tee', variant: 'One', stock: '1', priority: '20' }
			}),
			product({
				id: 'z',
				metadata: { group: 'zed', groupName: 'Zed Hat', variant: 'One', stock: '1', priority: '10' }
			})
		]);
		// Zed wins despite the later name because its priority is lower.
		expect(groups.map((g) => g.name)).toEqual(['Zed Hat', 'Ace Tee']);
	});

	it('sinks groups with no priority below prioritized ones, keeping them alphabetical', () => {
		const groups = groupProducts([
			product({
				id: 'n1',
				metadata: { group: 'bravo', groupName: 'Bravo', variant: 'One', stock: '1' }
			}),
			product({
				id: 'p',
				metadata: {
					group: 'mike',
					groupName: 'Mike',
					variant: 'One',
					stock: '1',
					priority: '10'
				}
			}),
			product({
				id: 'n2',
				metadata: { group: 'alpha', groupName: 'Alpha', variant: 'One', stock: '1' }
			})
		]);
		// Prioritized "Mike" first; the two unset groups follow, alphabetically.
		expect(groups.map((g) => g.name)).toEqual(['Mike', 'Alpha', 'Bravo']);
	});

	it('uses the lowest variant priority as the group priority', () => {
		const groups = groupProducts([
			product({
				id: 'b-hi',
				metadata: { group: 'beta', groupName: 'Beta', variant: 'A', stock: '1', priority: '30' }
			}),
			product({
				id: 'b-lo',
				metadata: { group: 'beta', groupName: 'Beta', variant: 'B', stock: '1', priority: '5' }
			}),
			product({
				id: 'a',
				metadata: { group: 'alpha', groupName: 'Alpha', variant: 'One', stock: '1', priority: '10' }
			})
		]);
		// Beta's group priority is min(30, 5) = 5, so it beats Alpha's 10.
		expect(groups.map((g) => g.name)).toEqual(['Beta', 'Alpha']);
	});
});
