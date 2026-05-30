import { formatPrice } from '$lib/shop/format';

export interface OrderEmailLine {
	description: string;
	quantity: number;
	amountTotal: number; // cents — line total
}

export interface OrderEmailData {
	lines: OrderEmailLine[];
	amountTotal: number; // cents — order grand total (incl. shipping)
	customerEmail: string | null;
	shippingName: string | null;
	shippingAddress: string | null; // newline-joined, e.g. "123 Main St\nChicago, IL 60601\nUS"
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

export function renderOrderNotification(order: OrderEmailData): RenderedEmail {
	const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);
	const rows = order.lines
		.map(
			(line) =>
				`<tr><td style="${CELL}">${escapeHtml(line.description)}</td>` +
				`<td style="${CELL}" align="center">${line.quantity}</td>` +
				`<td style="${CELL}" align="right">${formatPrice(line.amountTotal)}</td></tr>`
		)
		.join('');
	const shippingBlock = order.shippingName
		? `<p style="margin:16px 0 4px"><strong>Ship to:</strong><br>${escapeHtml(order.shippingName)}` +
			`<br>${escapeHtml(order.shippingAddress ?? '').replace(/\n/g, '<br>')}</p>`
		: '';
	const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#1d1830">
<h1 style="font-size:20px">New order — ${itemCount} item(s)</h1>
<table style="border-collapse:collapse;width:100%;max-width:480px"><thead><tr>
<th align="left" style="padding:8px;border-bottom:2px solid #1d1830">Item</th>
<th align="center" style="padding:8px;border-bottom:2px solid #1d1830">Qty</th>
<th align="right" style="padding:8px;border-bottom:2px solid #1d1830">Total</th>
</tr></thead><tbody>${rows}</tbody><tfoot><tr>
<td colspan="2" align="right" style="padding:8px"><strong>Order total</strong></td>
<td align="right" style="padding:8px"><strong>${formatPrice(order.amountTotal)}</strong></td>
</tr></tfoot></table>
${shippingBlock}
<p style="margin:4px 0"><strong>Customer:</strong> ${escapeHtml(order.customerEmail ?? 'unknown')}</p>
</body></html>`;
	const subject = `New order — ${itemCount} item(s), ${formatPrice(order.amountTotal)}`;
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
