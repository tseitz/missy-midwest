import { describe, it, expect } from 'vitest';
import {
	escapeHtml,
	renderOrderNotification,
	renderOrderConfirmation,
	renderContactMessage,
	type OrderEmailData,
	type ContactEmailData
} from './email-templates';

function order(over: Partial<OrderEmailData> = {}): OrderEmailData {
	return {
		lines: [
			{ description: 'Classic Trucker — Lavender', quantity: 2, amountTotal: 6400 },
			{ description: 'Tour Tee — L', quantity: 1, amountTotal: 2800 }
		],
		amountTotal: 9800,
		customerEmail: 'buyer@example.com',
		shippingName: 'Jane Buyer',
		shippingAddress: '123 Main St\nChicago, IL 60601\nUS',
		...over
	};
}

describe('escapeHtml', () => {
	it('escapes the five HTML-significant characters', () => {
		expect(escapeHtml(`<script>"&'`)).toBe('&lt;script&gt;&quot;&amp;&#39;');
	});
});

describe('renderOrderNotification', () => {
	it('summarizes item count and grand total in the subject', () => {
		const { subject } = renderOrderNotification(order());
		expect(subject).toBe('New order — 3 item(s), $98.00');
	});

	it('lists each line with formatted price, plus shipping and customer', () => {
		const { html } = renderOrderNotification(order());
		expect(html).toContain('Classic Trucker — Lavender');
		expect(html).toContain('$64.00');
		expect(html).toContain('Tour Tee — L');
		expect(html).toContain('$98.00'); // grand total
		expect(html).toContain('Jane Buyer');
		expect(html).toContain('123 Main St');
		expect(html).toContain('buyer@example.com');
	});

	it('omits the shipping block when there is no shipping name', () => {
		const { html } = renderOrderNotification(order({ shippingName: null, shippingAddress: null }));
		expect(html).not.toContain('Ship to:');
	});
});

describe('renderOrderConfirmation', () => {
	it('greets the buyer by first name and totals the order in the subject', () => {
		const { subject, html } = renderOrderConfirmation(order());
		expect(subject).toBe('Your Missy Midwest order is confirmed — $98.00');
		expect(html).toContain('Thanks for your order, Jane!');
	});

	it('lists the items and total but no internal customer/ship-to block', () => {
		const { html } = renderOrderConfirmation(order());
		expect(html).toContain('Classic Trucker — Lavender');
		expect(html).toContain('$98.00');
		expect(html).not.toContain('Ship to:');
		expect(html).not.toContain('Customer:');
	});

	it('falls back to a generic greeting when there is no name', () => {
		const { html } = renderOrderConfirmation(order({ shippingName: null }));
		expect(html).toContain('Thanks for your order, there!');
	});
});

describe('renderContactMessage', () => {
	function contact(over: Partial<ContactEmailData> = {}): ContactEmailData {
		return { name: 'Ada', email: 'ada@example.com', phone: '', message: 'Hello there', ...over };
	}

	it('puts the sender name in the subject', () => {
		expect(renderContactMessage(contact()).subject).toBe('Contact form — Ada');
	});

	it('renders name, email, message, and a dash for a missing phone', () => {
		const { html } = renderContactMessage(contact());
		expect(html).toContain('Ada');
		expect(html).toContain('ada@example.com');
		expect(html).toContain('Hello there');
		expect(html).toContain('—'); // empty phone fallback
	});

	it('escapes HTML in user-supplied fields to prevent injection', () => {
		const { html } = renderContactMessage(contact({ message: '<script>alert(1)</script>' }));
		expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
		expect(html).not.toContain('<script>alert(1)</script>');
	});
});
