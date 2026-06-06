import { describe, it, expect, vi, beforeEach } from 'vitest';

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock('resend', () => ({
	Resend: vi.fn(() => ({ emails: { send: sendMock } }))
}));

vi.mock('$env/dynamic/private', () => ({
	env: {
		RESEND_API_KEY: 'test_key',
		RESEND_FROM_EMAIL: 'noreply@missy.test',
		ORDER_NOTIFY_EMAIL: 'orders@missy.test',
		CONTACT_TO_EMAIL: 'contact@missy.test'
	}
}));

import { sendOrderNotification, sendContactMessage } from './email';
import type { OrderEmailData, ContactEmailData } from './email-templates';

function order(): OrderEmailData {
	return {
		lines: [{ description: 'Hat', quantity: 1, amountTotal: 3200 }],
		amountTotal: 3800,
		customerEmail: 'buyer@example.com',
		shippingName: 'Jane',
		shippingAddress: '1 Main St\nUS'
	};
}

function contact(): ContactEmailData {
	return { name: 'Ada', email: 'ada@example.com', phone: '', message: 'Hi' };
}

beforeEach(() => {
	sendMock.mockReset();
	sendMock.mockResolvedValue({ data: { id: 'email_1' }, error: null });
});

describe('sendOrderNotification', () => {
	it('sends from the configured sender to the order inbox', async () => {
		await sendOrderNotification(order());
		const arg = sendMock.mock.calls[0][0];
		expect(arg.from).toBe('noreply@missy.test');
		expect(arg.to).toBe('orders@missy.test');
		expect(arg.subject).toContain('New order');
		expect(arg.html).toContain('Hat');
	});

	it('throws when Resend returns an error', async () => {
		sendMock.mockResolvedValue({ data: null, error: { message: 'bad key' } });
		await expect(sendOrderNotification(order())).rejects.toThrow(/bad key/);
	});
});

describe('sendContactMessage', () => {
	it('sends to the contact inbox with the submitter as reply-to', async () => {
		await sendContactMessage(contact());
		const arg = sendMock.mock.calls[0][0];
		expect(arg.from).toBe('noreply@missy.test');
		expect(arg.to).toBe('contact@missy.test');
		expect(arg.replyTo).toBe('ada@example.com');
		expect(arg.subject).toContain('Contact form');
	});
});
