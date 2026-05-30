import { describe, it, expect, vi, beforeEach } from 'vitest';

const { constructEventMock, retrieveMock, updateMock, sendOrderMock } = vi.hoisted(() => ({
	constructEventMock: vi.fn(),
	retrieveMock: vi.fn(),
	updateMock: vi.fn(),
	sendOrderMock: vi.fn()
}));

vi.mock('$lib/server/stripe', () => ({
	stripe: {
		webhooks: { constructEvent: constructEventMock },
		checkout: { sessions: { retrieve: retrieveMock } },
		products: { update: updateMock }
	}
}));

vi.mock('$lib/server/email', () => ({ sendOrderNotification: sendOrderMock }));

vi.mock('$env/dynamic/private', () => ({ env: { STRIPE_WEBHOOK_SECRET: 'whsec_test' } }));

import { POST } from './+server';

function event(body = '{}', signature = 'sig') {
	return {
		request: new Request('http://localhost/api/stripe/webhook', {
			method: 'POST',
			headers: { 'stripe-signature': signature },
			body
		})
	} as unknown as Parameters<typeof POST>[0];
}

beforeEach(() => {
	constructEventMock.mockReset();
	retrieveMock.mockReset();
	updateMock.mockReset();
	sendOrderMock.mockReset();
	updateMock.mockResolvedValue({});
	sendOrderMock.mockResolvedValue(undefined);
});

describe('POST /api/stripe/webhook', () => {
	it('rejects an invalid signature with 400 and does no processing', async () => {
		constructEventMock.mockImplementation(() => {
			throw new Error('bad sig');
		});
		await expect(POST(event())).rejects.toMatchObject({ status: 400 });
		expect(retrieveMock).not.toHaveBeenCalled();
		expect(updateMock).not.toHaveBeenCalled();
		expect(sendOrderMock).not.toHaveBeenCalled();
	});

	it('ignores non-checkout events with 200', async () => {
		constructEventMock.mockReturnValue({ id: 'evt_1', type: 'payment_intent.succeeded' });
		const res = await POST(event());
		expect(res.status).toBe(200);
		expect(retrieveMock).not.toHaveBeenCalled();
	});

	it('decrements stock and emails on checkout.session.completed', async () => {
		constructEventMock.mockReturnValue({
			id: 'evt_2',
			type: 'checkout.session.completed',
			data: { object: { id: 'cs_123' } }
		});
		retrieveMock.mockResolvedValue({
			id: 'cs_123',
			amount_total: 3800,
			customer_details: { email: 'b@example.com' },
			collected_information: null,
			line_items: {
				data: [
					{
						description: 'Hat',
						quantity: 2,
						amount_total: 6400,
						price: { product: { id: 'prod_a', metadata: { stock: '8' } } }
					}
				]
			}
		});

		const res = await POST(event());
		expect(res.status).toBe(200);
		expect(retrieveMock).toHaveBeenCalledWith('cs_123', {
			expand: ['line_items.data.price.product']
		});
		expect(updateMock).toHaveBeenCalledWith('prod_a', { metadata: { stock: '6' } });
		expect(sendOrderMock).toHaveBeenCalledTimes(1);
	});

	it('still returns 200 if the order email throws', async () => {
		constructEventMock.mockReturnValue({
			id: 'evt_3',
			type: 'checkout.session.completed',
			data: { object: { id: 'cs_9' } }
		});
		retrieveMock.mockResolvedValue({ id: 'cs_9', line_items: { data: [] } });
		sendOrderMock.mockRejectedValue(new Error('resend down'));
		const res = await POST(event());
		expect(res.status).toBe(200);
	});
});
