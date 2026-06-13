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

// --- Brand kit (mirrors the $theme tokens in src/app.css) ---------------------
// Email can't load Cochin/Obviously or use asset(), so we hardcode web-safe
// stacks and absolute logo URLs. The site is live, so these resolve in prod AND
// in local test sends.
const SITE_URL = 'https://missymidwest.com';
const LOGO_WHITE = `${SITE_URL}/header/missy-midwest-logo-white.png`; // for the dark band
const LOGO_LILAC = `${SITE_URL}/header/missy-midwest-logo.png`; // for the light signature

const BRAND = {
	band: '#0b1f4c', // missy-deep-purple — header band
	ink: '#0a1438', // missy-ink — body text
	lilac: '#c9a8ff', // missy-classic-lavender — rules / signature
	magenta: '#e23f93', // missy-magenta — total accent
	muted: '#6b6480', // secondary text on white
	wash: '#f4f2f7', // page wash behind the card
	hairline: '#ece7f3' // faint cell border
} as const;

const SERIF = "Georgia,'Times New Roman',serif"; // echoes the Cochin headings
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const CELL = `padding:10px 8px;border-bottom:1px solid ${BRAND.hairline}`;
const HEAD = `padding:10px 8px;border-bottom:2px solid ${BRAND.ink}`;

/** A serif H1 in brand ink — echoes the site's Cochin headings. */
function heading(text: string): string {
	return `<h1 style="margin:0 0 8px;font-family:${SERIF};font-size:24px;line-height:1.2;font-weight:700;color:${BRAND.ink}">${text}</h1>`;
}

/**
 * Wrap body HTML in the branded shell: a white card on a soft wash, led by the
 * dark navy band with the white wordmark. Table-based + inline styles + bgcolor
 * attribute so it survives Outlook and dark-mode clients. `preheader` sets the
 * hidden inbox-preview text.
 */
function shell(inner: string, preheader = ''): string {
	const pre = preheader
		? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>`
		: '';
	return (
		`<!doctype html><html><head><meta charset="utf-8">` +
		`<meta name="viewport" content="width=device-width,initial-scale=1"></head>` +
		`<body style="margin:0;padding:0;background:${BRAND.wash};font-family:${SANS};color:${BRAND.ink}">${pre}` +
		`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.wash}">` +
		`<tr><td align="center" style="padding:24px 12px">` +
		`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden">` +
		`<tr><td align="center" bgcolor="${BRAND.band}" style="background:${BRAND.band};padding:26px 24px">` +
		`<img src="${LOGO_WHITE}" width="220" alt="Missy Midwest" style="display:block;width:220px;max-width:62%;height:auto;border:0">` +
		`</td></tr>` +
		`<tr><td style="padding:28px 28px 30px;color:${BRAND.ink};font-family:${SANS};font-size:15px;line-height:1.5">${inner}</td></tr>` +
		`</table></td></tr></table></body></html>`
	);
}

/** Lilac wordmark signature on the light card — closes the buyer email. */
function signature(): string {
	return (
		`<hr style="border:0;border-top:1px solid ${BRAND.lilac};margin:24px 0 18px">` +
		`<img src="${LOGO_LILAC}" width="150" alt="Missy Midwest" style="display:block;width:150px;max-width:50%;height:auto;border:0">`
	);
}

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
		`<table style="border-collapse:collapse;width:100%"><thead><tr>` +
		`<th align="left" style="${HEAD}">Item</th>` +
		`<th align="center" style="${HEAD}">Qty</th>` +
		`<th align="right" style="${HEAD}">Total</th>` +
		`</tr></thead><tbody>${rows}</tbody><tfoot><tr>` +
		`<td colspan="2" align="right" style="padding:10px 8px"><strong>Order total</strong></td>` +
		`<td align="right" style="padding:10px 8px"><strong style="color:${BRAND.magenta}">${formatPrice(order.amountTotal)}</strong></td>` +
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
	const inner =
		heading(`New order — ${itemCount} item(s)`) +
		itemTable(order) +
		deliveryBlock +
		`<p style="margin:4px 0"><strong>Customer:</strong> ${escapeHtml(order.customerEmail ?? 'unknown')}</p>`;
	const html = shell(inner);
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
			: 'Picking up in person? Head up to the treehouse or contact Missy to get your stuff.';
	const inner =
		heading(`Thanks for your order${greeting}! 🏖️`) +
		`<p style="margin:0 0 18px">Your Missy Midwest order is confirmed — here's what you grabbed:</p>` +
		itemTable(order) +
		`<p style="margin:18px 0 4px">${whatsNext}</p>` +
		`<p style="margin:4px 0 0">Catch you at the lake!</p>` +
		signature();
	const html = shell(inner, "Your order's confirmed — here's what you grabbed.");
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
