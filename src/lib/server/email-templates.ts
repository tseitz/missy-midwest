import { formatPrice } from '$lib/shop/format';

export interface OrderEmailLine {
	description: string;
	quantity: number;
	amountTotal: number; // cents — line total
}

/** Which fulfillment the buyer chose at checkout — drives the confirmation copy. */
export type DeliveryMethod = 'pickup' | 'shipping';

export interface OrderEmailData {
	lines: OrderEmailLine[];
	amountTotal: number; // cents — order grand total (incl. shipping)
	customerEmail: string | null;
	shippingName: string | null;
	shippingAddress: string | null; // newline-joined, e.g. "123 Main St\nChicago, IL 60601\nUS"
	deliveryMethod: DeliveryMethod;
}

export interface ContactEmailData {
	name: string;
	email: string;
	phone: string;
	message: string;
}

export interface RenderedEmail {
	subject: string;
	html: string;
}

/** Escape the five HTML-significant characters so user input can't inject markup into an email. */
export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

const CELL = 'padding:8px;border-bottom:1px solid #eee';
const HEAD = 'padding:8px;border-bottom:2px solid #1d1830';

/** Shared itemized table (line items + grand total) used by both order emails. */
function itemTable(order: OrderEmailData): string {
	const rows = order.lines
		.map(
			(line) =>
				`<tr><td style="${CELL}">${escapeHtml(line.description)}</td>` +
				`<td style="${CELL}" align="center">${line.quantity}</td>` +
				`<td style="${CELL}" align="right">${formatPrice(line.amountTotal)}</td></tr>`
		)
		.join('');
	return (
		`<table style="border-collapse:collapse;width:100%;max-width:480px"><thead><tr>` +
		`<th align="left" style="${HEAD}">Item</th>` +
		`<th align="center" style="${HEAD}">Qty</th>` +
		`<th align="right" style="${HEAD}">Total</th>` +
		`</tr></thead><tbody>${rows}</tbody><tfoot><tr>` +
		`<td colspan="2" align="right" style="padding:8px"><strong>Order total</strong></td>` +
		`<td align="right" style="padding:8px"><strong>${formatPrice(order.amountTotal)}</strong></td>` +
		`</tr></tfoot></table>`
	);
}

/** Merchant notification — sent to Missy when an order completes. */
export function renderOrderNotification(order: OrderEmailData): RenderedEmail {
	const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);
	const name = order.shippingName ? escapeHtml(order.shippingName) : '';
	// Pickup orders still collect an address at checkout, but it's noise for Missy —
	// show the method + who's collecting, and only print the address when shipping.
	const deliveryBlock =
		order.deliveryMethod === 'pickup'
			? `<p style="margin:16px 0 4px"><strong>Local pickup</strong>${name ? ` — ${name}` : ''}</p>`
			: name
				? `<p style="margin:16px 0 4px"><strong>Ship to:</strong><br>${name}` +
					`<br>${escapeHtml(order.shippingAddress ?? '').replace(/\n/g, '<br>')}</p>`
				: '';
	const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#1d1830">
<h1 style="font-size:20px">New order — ${itemCount} item(s)</h1>
${itemTable(order)}
${deliveryBlock}
<p style="margin:4px 0"><strong>Customer:</strong> ${escapeHtml(order.customerEmail ?? 'unknown')}</p>
</body></html>`;
	const subject = `New order — ${itemCount} item(s), ${formatPrice(order.amountTotal)}`;
	return { subject, html };
}

/** Buyer-facing order confirmation — warm, branded, itemized. */
export function renderOrderConfirmation(order: OrderEmailData): RenderedEmail {
	const firstName = order.shippingName?.trim().split(/\s+/)[0];
	const greeting = firstName ? `, ${escapeHtml(firstName)}` : '';
	const whatsNext =
		order.deliveryMethod === 'shipping'
			? 'Missy will be in touch with your shipping details.'
			: 'Picking up in person? Head up to the treehouse or otherwise find Missy to get your stuff.';
	const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#1d1830">
<h1 style="font-size:20px">Thanks for your order${greeting}! 🏖️</h1>
<p style="margin:4px 0 16px">Your Missy Midwest order is confirmed — here's what you grabbed:</p>
${itemTable(order)}
<p style="margin:16px 0 4px">${whatsNext}</p>
<p style="margin:4px 0">Catch you at the lake!</p>
<p style="margin:16px 0 0;color:#6b6480;font-size:13px">Missy Midwest</p>
</body></html>`;
	const subject = `Your Missy Midwest order is confirmed — ${formatPrice(order.amountTotal)}`;
	return { subject, html };
}

export function renderContactMessage(msg: ContactEmailData): RenderedEmail {
	const phone = msg.phone.trim() ? escapeHtml(msg.phone) : '—';
	const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#1d1830">
<h1 style="font-size:20px">New contact-form message</h1>
<p style="margin:4px 0"><strong>Name:</strong> ${escapeHtml(msg.name)}</p>
<p style="margin:4px 0"><strong>Email:</strong> ${escapeHtml(msg.email)}</p>
<p style="margin:4px 0"><strong>Phone:</strong> ${phone}</p>
<p style="margin:12px 0 4px"><strong>Message:</strong></p>
<p style="margin:0;white-space:pre-wrap">${escapeHtml(msg.message)}</p>
</body></html>`;
	// Subject is a plain-text header, not HTML — do not escape it.
	const subject = `Contact form — ${msg.name}`;
	return { subject, html };
}
