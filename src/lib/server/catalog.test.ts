import { describe, it, expect, vi, beforeEach } from 'vitest';

const { listMock } = vi.hoisted(() => ({ listMock: vi.fn() }));

vi.mock('$lib/server/stripe', () => ({
	stripe: { products: { list: listMock } }
}));

import { listGroups, getGroup } from './catalog';

function stripeProduct(over: {
	id: string;
	group: string;
	variant: string;
	stock: string;
	amount?: number;
}) {
	return {
		id: over.id,
		name: `${over.group} ${over.variant}`,
		description: 'A nice thing',
		images: [`https://img/${over.id}.png`],
		metadata: {
			group: over.group,
			groupName: over.group,
			variant: over.variant,
			stock: over.stock
		},
		default_price: { id: `price_${over.id}`, unit_amount: over.amount ?? 3000 }
	};
}

beforeEach(() => listMock.mockReset());

describe('listGroups', () => {
	it('maps and groups active Stripe products', async () => {
		listMock.mockResolvedValue({
			data: [
				stripeProduct({ id: 'p1', group: 'trucker', variant: 'Lavender', stock: '8' }),
				stripeProduct({ id: 'p2', group: 'trucker', variant: 'Black', stock: '0' })
			]
		});
		const { groups, error } = await listGroups();
		expect(error).toBeUndefined();
		expect(groups).toHaveLength(1);
		expect(groups[0].variants).toHaveLength(2);
		expect(listMock).toHaveBeenCalledWith(
			expect.objectContaining({ active: true, expand: ['data.default_price'] })
		);
	});

	it('returns an empty catalog and an error message on failure', async () => {
		listMock.mockRejectedValue(new Error('stripe down'));
		const { groups, error } = await listGroups();
		expect(groups).toEqual([]);
		expect(error).toBe('stripe down');
	});

	it('handles an unexpanded (string) default_price by skipping the variant', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		listMock.mockResolvedValue({
			data: [
				{
					...stripeProduct({ id: 'p1', group: 'g', variant: 'A', stock: '1' }),
					default_price: 'price_unexpanded'
				}
			]
		});
		const { groups } = await listGroups();
		expect(groups).toEqual([]);
		warn.mockRestore();
	});
});

describe('getGroup', () => {
	it('returns the matching group', async () => {
		listMock.mockResolvedValue({
			data: [stripeProduct({ id: 'p1', group: 'trucker', variant: 'Lavender', stock: '8' })]
		});
		const group = await getGroup('trucker');
		expect(group?.slug).toBe('trucker');
	});

	it('returns null when the slug is not found', async () => {
		listMock.mockResolvedValue({ data: [] });
		expect(await getGroup('nope')).toBeNull();
	});
});
