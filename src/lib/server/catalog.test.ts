import { describe, it, expect, vi, beforeEach } from 'vitest';

const { listMock, captureMessage } = vi.hoisted(() => ({
	listMock: vi.fn(),
	captureMessage: vi.fn()
}));

vi.mock('$lib/server/stripe', () => ({
	stripe: { products: { list: listMock } }
}));

vi.mock('@sentry/sveltekit', () => ({ captureMessage }));

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

beforeEach(() => {
	listMock.mockReset();
	captureMessage.mockClear();
});

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

	it('returns an empty catalog and an error message on failure, and alerts', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		listMock.mockRejectedValue(new Error('stripe down'));
		const { groups, error } = await listGroups();
		expect(groups).toEqual([]);
		expect(error).toBe('stripe down');
		expect(captureMessage).toHaveBeenCalledWith(expect.stringMatching(/stripe down/), 'error');
	});

	it('warns when Stripe reports more products than one page', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		listMock.mockResolvedValue({
			has_more: true,
			data: [stripeProduct({ id: 'p1', group: 'g', variant: 'A', stock: '1' })]
		});
		await listGroups();
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('more than 100'));
		warn.mockRestore();
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
