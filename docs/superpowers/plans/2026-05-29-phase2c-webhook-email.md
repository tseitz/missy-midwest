# Phase 2c — Webhook + Order Email + Contact Resend Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Svelte files:** every `.svelte` / `.svelte.ts` file MUST be created/edited via the `svelte-file-editor` subagent and validated with `svelte-autofixer` (per CLAUDE.md).
>
> **Branch:** all work happens on `phase2-fulfillment`, branched from `redesign` (NOT `main` — `main` auto-deploys to production). Merge back to `redesign` at the end via superpowers:finishing-a-development-branch.

**Goal:** Add a signature-verified Stripe webhook that decrements stock and emails Missy an order notification (Resend), and migrate the contact form from client-side EmailJS to a server-side Resend send with inline status feedback — completing Phase 2.

**Architecture:** A Resend wrapper (`src/lib/server/email.ts`) sends two emails rendered by pure functions in `src/lib/server/email-templates.ts` (unit-tested, user input HTML-escaped). Pure helpers in `src/lib/server/fulfillment.ts` map a completed Stripe Checkout Session to floored stock updates and an order-email payload. The webhook (`src/routes/api/stripe/webhook/+server.ts`) verifies the signature, retrieves the session with line items expanded, applies stock updates via `products.update` (metadata merges per-key), and fires the order email — all best-effort so a partial failure still returns 200. The contact action moves the send server-side and `Contact.svelte` shows an inline status instead of `alert()`.

**Tech Stack:** SvelteKit 2 + Svelte 5 runes, `stripe` Node SDK (v22), `resend` SDK, Cloudflare Turnstile (existing), Vitest 3 + @testing-library/svelte, Playwright.

**Spec:** `docs/superpowers/specs/2026-05-29-missy-midwest-phase2-shop-design.md` (§8 Webhook, §9 Order email + contact swap, §10 Env/security).

**Builds on 2a/2b:** `src/lib/server/stripe.ts` (`stripe` client), `src/lib/shop/format.ts` (`formatPrice`), `src/lib/server/turnstile.ts` (`validateTurnstileToken`). The contact route (`src/routes/contact/+page.server.ts`, `src/lib/contact/Contact.svelte`) and `src/lib/email.ts` (EmailJS) already exist and are reworked/removed here.

**Env decision:** the new secrets (`STRIPE_WEBHOOK_SECRET`, `RESEND_*`, `*_EMAIL`) are read via **`$env/dynamic/private`** (runtime), NOT `$env/static/private` (build-time). Rationale: the user has not provisioned Resend/webhook secrets yet (go-live checklist), and `$env/static/private` throws at build for any unset referenced var — dynamic access lets the branch build and ship before secrets exist. The existing `stripe.ts`/`turnstile.ts` keep their static imports (those vars are already set).

---

## File Structure

**Create:**

- `src/lib/server/email-templates.ts` — pure `renderOrderNotification` + `renderContactMessage` + `escapeHtml`; no I/O, no SDK. Owns all email HTML.
- `src/lib/server/email-templates.test.ts` — unit tests for the renderers + escaping.
- `src/lib/server/email.ts` — Resend client wrapper: `sendOrderNotification` + `sendContactMessage`. Thin; delegates HTML to email-templates.
- `src/lib/server/email.test.ts` — wiring tests (from/to/replyTo/subject, throw-on-error) with mocked `resend` + env.
- `src/lib/server/fulfillment.ts` — pure `stockUpdatesFromLineItems` + `orderFromSession`. Maps Stripe shapes → our types.
- `src/lib/server/fulfillment.test.ts` — unit tests with Stripe fixtures.
- `src/routes/api/stripe/webhook/+server.ts` — POST webhook (verify → retrieve → decrement → email → 200).
- `src/routes/api/stripe/webhook/server.test.ts` — handler tests with mocked stripe + email + env.

**Modify:**

- `src/routes/contact/+page.server.ts` — validate fields + Turnstile, send via Resend server-side.
- `src/routes/contact/server.test.ts` — NEW test for the action (mock turnstile + email).
- `src/lib/contact/Contact.svelte` — drop EmailJS client send; inline status message instead of `alert()`.
- `.env.example` — activate the 2c vars; remove the EmailJS block.
- `package.json` — add `resend`, remove `@emailjs/browser` (done via npm in Tasks 1 + 7).
- `e2e/smoke.spec.ts` — add a contact-page render smoke.

**Delete:**

- `src/lib/email.ts` — the EmailJS client send (Task 7).

**Note on test filenames:** server endpoint tests are named `server.test.ts` (a sibling of `+server.ts`), never `+server.test.ts`.

---

## Task 1: Install Resend + activate env scaffolding

**Files:**

- Modify: `package.json` (via npm)
- Modify: `.env.example`

- [ ] **Step 1: Install the Resend SDK**

The command sandbox blocks the npm registry, so run with the sandbox disabled:

Run: `npm install resend`
Expected: `resend` added to `dependencies`; lockfile updated.

- [ ] **Step 2: Activate the 2c env vars in `.env.example`**

In `.env.example`, replace this commented block:

```
# Set in 2b/2c:
# STRIPE_WEBHOOK_SECRET=
# RESEND_API_KEY=
# RESEND_FROM_EMAIL=noreply@yourdomain.com
# ORDER_NOTIFY_EMAIL=
# CONTACT_TO_EMAIL=
```

with:

```
# Webhook signature secret (Stripe CLI `stripe listen` prints one for local dev).
STRIPE_WEBHOOK_SECRET=whsec_...
# Resend transactional email.
RESEND_API_KEY=re_...
# From address — must be on a Resend-verified domain.
RESEND_FROM_EMAIL=noreply@yourdomain.com
# Where order notifications go (Missy).
ORDER_NOTIFY_EMAIL=missy@example.com
# Where contact-form messages go (may be the same inbox).
CONTACT_TO_EMAIL=missy@example.com
```

(The `VITE_EMAILJS_*` block is removed in Task 7 alongside the code that uses it.)

- [ ] **Step 3: Verify the build still passes**

Run: `npm run build`
Expected: build succeeds (the adapter-auto "Could not detect a supported production environment" warning is normal locally).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore(shop): add resend dependency and 2c env scaffolding"
```

---

## Task 2: Email templates (pure renderers) — TDD

**Files:**

- Create: `src/lib/server/email-templates.test.ts`
- Create: `src/lib/server/email-templates.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/server/email-templates.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
	escapeHtml,
	renderOrderNotification,
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/server/email-templates.test.ts`
Expected: FAIL — cannot find `./email-templates`.

- [ ] **Step 3: Implement `email-templates.ts`**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/server/email-templates.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/email-templates.ts src/lib/server/email-templates.test.ts
git commit -m "feat(shop): add order + contact email templates with html escaping"
```

---

## Task 3: Resend sender wrapper — TDD

**Files:**

- Create: `src/lib/server/email.test.ts`
- Create: `src/lib/server/email.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/server/email.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/server/email.test.ts`
Expected: FAIL — cannot find `./email`.

- [ ] **Step 3: Implement `email.ts`**

```ts
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import {
	renderOrderNotification,
	renderContactMessage,
	type OrderEmailData,
	type ContactEmailData
} from './email-templates';

const resend = new Resend(env.RESEND_API_KEY ?? '');

/** Email Missy a notification for a completed order. Throws if Resend reports an error. */
export async function sendOrderNotification(order: OrderEmailData): Promise<void> {
	const { subject, html } = renderOrderNotification(order);
	const { error } = await resend.emails.send({
		from: env.RESEND_FROM_EMAIL ?? '',
		to: env.ORDER_NOTIFY_EMAIL ?? '',
		subject,
		html
	});
	if (error) throw new Error(`Resend order email failed: ${error.message}`);
}

/** Forward a contact-form message to Missy with the submitter set as reply-to. */
export async function sendContactMessage(msg: ContactEmailData): Promise<void> {
	const { subject, html } = renderContactMessage(msg);
	const { error } = await resend.emails.send({
		from: env.RESEND_FROM_EMAIL ?? '',
		to: env.CONTACT_TO_EMAIL ?? '',
		replyTo: msg.email,
		subject,
		html
	});
	if (error) throw new Error(`Resend contact email failed: ${error.message}`);
}
```

> If `npm run check` flags `replyTo`, the installed Resend version uses `reply_to` — switch that one key. (Resend SDK v4+ uses `replyTo`.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/server/email.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Typecheck + commit**

Run: `npm run check`
Expected: 0 errors.

```bash
git add src/lib/server/email.ts src/lib/server/email.test.ts
git commit -m "feat(shop): add resend email sender wrapper"
```

---

## Task 4: Fulfillment helpers (pure) — TDD

**Files:**

- Create: `src/lib/server/fulfillment.test.ts`
- Create: `src/lib/server/fulfillment.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/server/fulfillment.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import type Stripe from 'stripe';
import { stockUpdatesFromLineItems, orderFromSession } from './fulfillment';

function lineItem(over: {
	productId?: string;
	stock?: string;
	quantity?: number;
	description?: string;
	amountTotal?: number;
	productExpanded?: boolean;
}): Stripe.LineItem {
	const product =
		over.productExpanded === false
			? 'prod_str'
			: { id: over.productId ?? 'prod_a', metadata: { stock: over.stock ?? '8' } };
	return {
		description: over.description ?? 'Hat',
		quantity: over.quantity ?? 1,
		amount_total: over.amountTotal ?? 3200,
		price: { product }
	} as unknown as Stripe.LineItem;
}

describe('stockUpdatesFromLineItems', () => {
	it('subtracts purchased quantity from current stock', () => {
		const updates = stockUpdatesFromLineItems([lineItem({ stock: '8', quantity: 2 })]);
		expect(updates).toEqual([{ productId: 'prod_a', stock: 6 }]);
	});

	it('floors stock at zero (never negative)', () => {
		const updates = stockUpdatesFromLineItems([lineItem({ stock: '1', quantity: 5 })]);
		expect(updates).toEqual([{ productId: 'prod_a', stock: 0 }]);
	});

	it('skips line items whose product was not expanded', () => {
		const updates = stockUpdatesFromLineItems([lineItem({ productExpanded: false })]);
		expect(updates).toEqual([]);
	});

	it('treats missing stock metadata as zero', () => {
		const item = lineItem({ quantity: 1 });
		// remove stock from metadata
		(item.price!.product as { metadata: Record<string, string> }).metadata = {};
		expect(stockUpdatesFromLineItems([item])).toEqual([{ productId: 'prod_a', stock: 0 }]);
	});
});

describe('orderFromSession', () => {
	function session(): Stripe.Checkout.Session {
		return {
			amount_total: 9800,
			customer_details: { email: 'buyer@example.com' },
			collected_information: {
				shipping_details: {
					name: 'Jane Buyer',
					address: {
						line1: '123 Main St',
						line2: null,
						city: 'Chicago',
						state: 'IL',
						postal_code: '60601',
						country: 'US'
					}
				}
			}
		} as unknown as Stripe.Checkout.Session;
	}

	it('maps line items, total, email, and shipping into the email payload', () => {
		const items = [
			lineItem({ description: 'Trucker — Lavender', quantity: 2, amountTotal: 6400 }),
			lineItem({ description: 'Tour Tee — L', quantity: 1, amountTotal: 2800 })
		];
		const order = orderFromSession(session(), items);
		expect(order.amountTotal).toBe(9800);
		expect(order.customerEmail).toBe('buyer@example.com');
		expect(order.shippingName).toBe('Jane Buyer');
		expect(order.shippingAddress).toContain('123 Main St');
		expect(order.shippingAddress).toContain('Chicago, IL 60601');
		expect(order.lines).toEqual([
			{ description: 'Trucker — Lavender', quantity: 2, amountTotal: 6400 },
			{ description: 'Tour Tee — L', quantity: 1, amountTotal: 2800 }
		]);
	});

	it('tolerates a session with no shipping details', () => {
		const bare = {
			amount_total: 3200,
			customer_details: null,
			collected_information: null
		} as unknown as Stripe.Checkout.Session;
		const order = orderFromSession(bare, [lineItem({ quantity: 1 })]);
		expect(order.shippingName).toBeNull();
		expect(order.shippingAddress).toBeNull();
		expect(order.customerEmail).toBeNull();
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/server/fulfillment.test.ts`
Expected: FAIL — cannot find `./fulfillment`.

- [ ] **Step 3: Implement `fulfillment.ts`**

```ts
import type Stripe from 'stripe';
import type { OrderEmailData, OrderEmailLine } from './email-templates';

export interface StockUpdate {
	productId: string;
	stock: number; // new floored stock level
}

/** New floored stock levels for each expanded line item. Items without an expanded product are skipped. */
export function stockUpdatesFromLineItems(items: Stripe.LineItem[]): StockUpdate[] {
	const updates: StockUpdate[] = [];
	for (const item of items) {
		const product = item.price?.product;
		if (!product || typeof product === 'string' || ('deleted' in product && product.deleted)) {
			continue;
		}
		const current = Number.parseInt(product.metadata?.stock ?? '0', 10) || 0;
		const stock = Math.max(0, current - (item.quantity ?? 0));
		updates.push({ productId: product.id, stock });
	}
	return updates;
}

type ShippingDetails = NonNullable<
	Stripe.Checkout.Session['collected_information']
>['shipping_details'];

function formatAddress(shipping: ShippingDetails): string | null {
	if (!shipping?.address) return null;
	const a = shipping.address;
	const cityLine = `${a.city ?? ''}, ${a.state ?? ''} ${a.postal_code ?? ''}`.trim();
	return [a.line1, a.line2, cityLine, a.country]
		.filter((part): part is string => Boolean(part && part.trim()))
		.join('\n');
}

/** Build the order-notification payload from a completed session and its expanded line items. */
export function orderFromSession(
	session: Stripe.Checkout.Session,
	items: Stripe.LineItem[]
): OrderEmailData {
	const lines: OrderEmailLine[] = items.map((item) => ({
		description: item.description ?? 'Item',
		quantity: item.quantity ?? 0,
		amountTotal: item.amount_total ?? 0
	}));
	const shipping = session.collected_information?.shipping_details ?? null;
	return {
		lines,
		amountTotal: session.amount_total ?? 0,
		customerEmail: session.customer_details?.email ?? null,
		shippingName: shipping?.name ?? null,
		shippingAddress: formatAddress(shipping)
	};
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/server/fulfillment.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Typecheck + commit**

Run: `npm run check`
Expected: 0 errors.

```bash
git add src/lib/server/fulfillment.ts src/lib/server/fulfillment.test.ts
git commit -m "feat(shop): add fulfillment helpers for stock + order payload"
```

---

## Task 5: Webhook endpoint — TDD

**Files:**

- Create: `src/routes/api/stripe/webhook/server.test.ts`
- Create: `src/routes/api/stripe/webhook/+server.ts`

- [ ] **Step 1: Write the failing tests**

`src/routes/api/stripe/webhook/server.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/routes/api/stripe/webhook/server.test.ts`
Expected: FAIL — cannot find `./+server`.

- [ ] **Step 3: Implement `+server.ts`**

```ts
import { json, error } from '@sveltejs/kit';
import type Stripe from 'stripe';
import { stripe } from '$lib/server/stripe';
import { env } from '$env/dynamic/private';
import { sendOrderNotification } from '$lib/server/email';
import { stockUpdatesFromLineItems, orderFromSession } from '$lib/server/fulfillment';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const signature = request.headers.get('stripe-signature') ?? '';
	const payload = await request.text();

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET ?? '');
	} catch (err) {
		console.error('Stripe webhook signature verification failed:', err);
		error(400, 'Invalid signature.');
	}

	if (event.type !== 'checkout.session.completed') {
		return json({ received: true });
	}

	const session = event.data.object as Stripe.Checkout.Session;
	// Best-effort idempotency: log the event id (no database — duplicate deliveries are tolerated).
	console.info(`Fulfilling Stripe checkout session ${session.id} (event ${event.id})`);

	const full = await stripe.checkout.sessions.retrieve(session.id, {
		expand: ['line_items.data.price.product']
	});
	const items = full.line_items?.data ?? [];

	// Decrement stock per item. Stripe merges metadata by key, so other keys are preserved.
	// Each update is independent: a single failure is logged but doesn't abort the rest.
	for (const update of stockUpdatesFromLineItems(items)) {
		try {
			await stripe.products.update(update.productId, {
				metadata: { stock: String(update.stock) }
			});
		} catch (err) {
			console.error(`Failed to update stock for product ${update.productId}:`, err);
		}
	}

	try {
		await sendOrderNotification(orderFromSession(full, items));
	} catch (err) {
		console.error('Failed to send order notification email:', err);
	}

	return json({ received: true });
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/routes/api/stripe/webhook/server.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck + commit**

Run: `npm run check`
Expected: 0 errors.

```bash
git add src/routes/api/stripe/webhook/+server.ts src/routes/api/stripe/webhook/server.test.ts
git commit -m "feat(shop): add stripe webhook for stock decrement + order email"
```

---

## Task 6: Contact action — server-side Resend send — TDD

**Files:**

- Create: `src/routes/contact/server.test.ts`
- Modify: `src/routes/contact/+page.server.ts`

- [ ] **Step 1: Write the failing tests**

`src/routes/contact/server.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { validateMock, sendContactMock } = vi.hoisted(() => ({
	validateMock: vi.fn(),
	sendContactMock: vi.fn()
}));

vi.mock('$lib/server/turnstile', () => ({ validateTurnstileToken: validateMock }));
vi.mock('$lib/server/email', () => ({ sendContactMessage: sendContactMock }));

import { actions } from './+page.server';

function form(fields: Record<string, string>) {
	const data = new FormData();
	for (const [key, value] of Object.entries(fields)) data.set(key, value);
	return {
		request: new Request('http://localhost/contact', { method: 'POST', body: data })
	} as unknown as Parameters<typeof actions.contact>[0];
}

const valid = {
	name: 'Ada',
	email: 'ada@example.com',
	phone: '',
	message: 'Hello Missy',
	'cf-turnstile-response': 'token'
};

beforeEach(() => {
	validateMock.mockReset().mockResolvedValue(true);
	sendContactMock.mockReset().mockResolvedValue(undefined);
});

describe('contact action', () => {
	it('sends the message and returns success when valid', async () => {
		const res = await actions.contact(form(valid));
		expect(res).toMatchObject({ success: true });
		expect(sendContactMock).toHaveBeenCalledWith({
			name: 'Ada',
			email: 'ada@example.com',
			phone: '',
			message: 'Hello Missy'
		});
	});

	it('fails with 400 when required fields are missing and does not send', async () => {
		const res = await actions.contact(form({ ...valid, name: '' }));
		expect(res).toMatchObject({ status: 400 });
		expect(sendContactMock).not.toHaveBeenCalled();
	});

	it('fails with 400 on an invalid email', async () => {
		const res = await actions.contact(form({ ...valid, email: 'not-an-email' }));
		expect(res).toMatchObject({ status: 400 });
		expect(sendContactMock).not.toHaveBeenCalled();
	});

	it('fails with 400 when Turnstile rejects', async () => {
		validateMock.mockResolvedValue(false);
		const res = await actions.contact(form(valid));
		expect(res).toMatchObject({ status: 400 });
		expect(sendContactMock).not.toHaveBeenCalled();
	});

	it('fails with 502 when the email send throws', async () => {
		sendContactMock.mockRejectedValue(new Error('resend down'));
		const res = await actions.contact(form(valid));
		expect(res).toMatchObject({ status: 502 });
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/routes/contact/server.test.ts`
Expected: FAIL — the action still returns success without sending; `sendContactMock` is never called.

- [ ] **Step 3: Rewrite `src/routes/contact/+page.server.ts`**

```ts
import { fail } from '@sveltejs/kit';
import { validateTurnstileToken } from '$lib/server/turnstile';
import { sendContactMessage } from '$lib/server/email';
import type { Actions } from './$types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 10000;

export const actions: Actions = {
	contact: async ({ request }) => {
		const formData = await request.formData();
		const name = (formData.get('name')?.toString() ?? '').trim();
		const email = (formData.get('email')?.toString() ?? '').trim();
		const phone = (formData.get('phone')?.toString() ?? '').trim();
		const message = (formData.get('message')?.toString() ?? '').trim();
		const turnstileToken = formData.get('cf-turnstile-response')?.toString() ?? '';

		if (!name || !email || !message) {
			return fail(400, {
				success: false,
				message: 'Please fill in your name, email, and message.'
			});
		}
		if (!EMAIL_RE.test(email)) {
			return fail(400, { success: false, message: 'Please enter a valid email address.' });
		}
		if (message.length > MAX_MESSAGE) {
			return fail(400, {
				success: false,
				message: 'That message is a bit long — could you trim it down?'
			});
		}
		if (!turnstileToken || !(await validateTurnstileToken(turnstileToken))) {
			return fail(400, {
				success: false,
				message: 'Invalid CAPTCHA. Sorry robot. Please retry if you are in fact, human.'
			});
		}

		try {
			await sendContactMessage({ name, email, phone, message });
		} catch (err) {
			console.error('Contact email send failed:', err);
			return fail(502, {
				success: false,
				message:
					'Something went wrong sending your message. You can email Missy directly at missy.midwestofficial@gmail.com'
			});
		}

		return { success: true, message: 'Message sent! Thanks for your submission :)' };
	}
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/routes/contact/server.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Typecheck + commit**

Run: `npm run check`
Expected: 0 errors.

```bash
git add src/routes/contact/+page.server.ts src/routes/contact/server.test.ts
git commit -m "feat(contact): send contact messages server-side via resend"
```

---

## Task 7: Contact.svelte — inline status, drop EmailJS

**Files:**

- Modify: `src/lib/contact/Contact.svelte` (use the `svelte-file-editor` subagent)
- Delete: `src/lib/email.ts`
- Modify: `.env.example`
- Modify: `package.json` (via npm)

- [ ] **Step 1: Replace `Contact.svelte`**

Replace the entire contents of `src/lib/contact/Contact.svelte` with the following (drops the EmailJS import + client send and the `$effect`/`alert()` path; adds an inline status message; keeps client-side validation and Turnstile reset):

```svelte
<script lang="ts">
	import { Turnstile } from 'svelte-turnstile';
	import { enhance } from '$app/forms';

	const turnstileSiteKey = import.meta.env['VITE_TURNSTILE_SITE_KEY'] as string;

	const phoneRegExp =
		/^(((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?)?$/;

	let formData = $state({
		name: '',
		email: '',
		phone: '',
		message: ''
	});

	let errors = $state({
		name: '',
		email: '',
		phone: '',
		message: ''
	});

	let submitAttempted = $state(false);
	let isSubmitting = $state(false);

	type ContactResult = { success: boolean; message?: string };

	let form = $state<ContactResult | null>(null);
	let turnstileKey = $state(0);

	function validateForm() {
		errors = { name: '', email: '', phone: '', message: '' };
		let isValid = true;

		if (!formData.name.trim()) {
			errors.name = 'Name is required';
			isValid = false;
		}

		if (!formData.email.trim()) {
			errors.email = 'Email is required';
			isValid = false;
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = 'Please enter a valid email';
			isValid = false;
		}

		if (formData.phone && !phoneRegExp.test(formData.phone)) {
			errors.phone = 'Phone number is not valid';
			isValid = false;
		}

		if (!formData.message.trim()) {
			errors.message = 'Message is required';
			isValid = false;
		} else if (formData.message.length > 10000) {
			errors.message = `Whoa, that's a long message. Could you trim it down a bit?`;
			isValid = false;
		}

		return isValid;
	}

	function resetTurnstile() {
		// Force a fresh Turnstile token for the next submission by re-rendering the widget.
		turnstileKey++;
	}
</script>

<section
	id="contact"
	class="grid w-full max-w-screen-2xl grid-cols-1 gap-8 pt-12 pb-16 md:grid-cols-2 md:gap-16 lg:pt-20"
>
	<div>
		<h2 class="mb-8 text-4xl md:mb-12">Contact</h2>
		<p>
			For festival bookings, residencies, workshop offerings or any other inquires please fill out
			this form.
			<br />
			<br />
			You can also visit the linktree below for all her latest music, ticket information and more.
			<br />
			<br />
			<a href="https://linktr.ee/missymidwest" target="_blank">https://linktr.ee/missymidwest</a>
		</p>
	</div>
	<div class="bg-missy-classic-lavender rounded-md p-8">
		<form
			method="POST"
			action="?/contact"
			use:enhance={() => {
				submitAttempted = true;

				if (!validateForm()) {
					return ({ update }) => update({ reset: false });
				}

				isSubmitting = true;

				return async ({ result, update }) => {
					if (result.type === 'success' || result.type === 'failure') {
						form = result.data as ContactResult;
					} else {
						form = { success: false, message: 'Something went wrong. Please try again.' };
					}

					isSubmitting = false;
					resetTurnstile();

					if (form?.success) {
						formData = { name: '', email: '', phone: '', message: '' };
						submitAttempted = false;
					}

					await update({ reset: false });
				};
			}}
		>
			<label class="mb-2 text-xl" for="name">Name</label>
			<input
				id="name"
				name="name"
				type="text"
				class="text-missy-deep-purple bg-slate-50"
				bind:value={formData.name}
				required
			/>
			{#if submitAttempted && errors.name}
				<small class="text-missy-magenta">{errors.name}</small>
			{/if}

			<label class="mt-4 mb-2 text-xl" for="email">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				class="text-missy-deep-purple bg-slate-50"
				bind:value={formData.email}
				required
			/>
			{#if submitAttempted && errors.email}
				<small class="text-missy-magenta">{errors.email}</small>
			{/if}

			<label class="mt-4 mb-2 text-xl" for="phone">Phone (Optional)</label>
			<input
				id="phone"
				name="phone"
				type="text"
				class="text-missy-deep-purple bg-slate-50"
				bind:value={formData.phone}
			/>
			{#if submitAttempted && errors.phone}
				<small class="text-missy-magenta">{errors.phone}</small>
			{/if}

			<label class="mt-4 mb-2 text-xl" for="message">Message</label>
			<textarea
				id="message"
				name="message"
				rows="7"
				class="text-missy-deep-purple bg-slate-50"
				bind:value={formData.message}
				required
			></textarea>
			{#if submitAttempted && errors.message}
				<small class="text-missy-magenta">{errors.message}</small>
			{/if}

			<div class="mt-4">
				{#key turnstileKey}
					<Turnstile siteKey={turnstileSiteKey} theme="auto" />
				{/key}
			</div>

			{#if form}
				<p
					role="status"
					aria-live="polite"
					class="mt-4 rounded-md px-4 py-3 text-sm font-medium {form.success
						? 'bg-missy-deep-purple/80 text-slate-50'
						: 'bg-missy-magenta/90 text-slate-50'}"
				>
					{form.message}
				</p>
			{/if}

			<div class="mt-4 flex justify-end">
				<button
					class="bg-missy-deep-purple/80 shadow-missy-classic-lavender/20 hover:bg-missy-deep-purple/90 hover:shadow-missy-classic-lavender/30 focus:ring-missy-classic-lavender/50 rounded-lg px-6 py-3 font-semibold text-slate-50 shadow-lg backdrop-blur-lg transition-all duration-300 ease-out hover:cursor-pointer hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					type="submit"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Sending...' : 'Submit'}
				</button>
			</div>
		</form>
	</div>
</section>

<style>
	input,
	textarea {
		padding: 12px;
		width: 100%;
	}

	label {
		display: block;
	}

	small {
		display: block;
		font-size: 14px;
		margin-top: 10px;
	}
</style>
```

- [ ] **Step 2: Delete the EmailJS module**

Run: `git rm src/lib/email.ts`
Expected: file staged for deletion.

- [ ] **Step 3: Remove the EmailJS block from `.env.example`**

Delete these lines from `.env.example`:

```
# EmailJS (client-side send of the contact message) — replaced by Resend in Phase 2
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

- [ ] **Step 4: Uninstall the EmailJS dependency**

The command sandbox blocks the npm registry, so run with the sandbox disabled:

Run: `npm uninstall @emailjs/browser`
Expected: `@emailjs/browser` removed from `dependencies`.

- [ ] **Step 5: Confirm no stale references remain**

Run: `grep -rn "emailjs\|EmailJS\|VITE_EMAILJS\|sendEmail" src/ .env.example`
Expected: no matches.

- [ ] **Step 6: Typecheck + commit**

Run: `npm run check`
Expected: 0 errors.

```bash
git add src/lib/contact/Contact.svelte .env.example package.json package-lock.json
git commit -m "feat(contact): inline status feedback and remove emailjs"
```

---

## Task 8: E2E smoke + full verification

**Files:**

- Modify: `e2e/smoke.spec.ts`

- [ ] **Step 1: Add a contact-page render smoke**

Append to `e2e/smoke.spec.ts`:

```ts
test('contact page renders the booking form', async ({ page }) => {
	await page.goto('/contact');
	await expect(page.getByRole('heading', { name: 'Contact', exact: true })).toBeVisible();
	await expect(page.getByLabel('Name')).toBeVisible();
	await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the full unit suite**

Run: `npm test`
Expected: PASS — all prior tests plus email-templates, email, fulfillment, webhook, and contact-action suites.

- [ ] **Step 3: Coverage check on new logic**

Run: `npm run test:coverage`
Expected: `email-templates.ts`, `fulfillment.ts`, and `api/stripe/webhook/+server.ts` at 80%+ line coverage.

- [ ] **Step 4: Typecheck, lint, build**

Run: `npm run check && npm run lint && npm run build`
Expected: svelte-check 0/0; prettier + eslint clean; build succeeds.

- [ ] **Step 5: E2E smoke (sandbox disabled — Chromium can't launch sandboxed)**

Run: `npm run test:e2e`
Expected: all smoke tests pass (home, shop, cart drawer, contact form).

- [ ] **Step 6: Commit**

```bash
git add e2e/smoke.spec.ts
git commit -m "test(contact): add contact page render smoke"
```

---

## Manual verification (after go-live keys exist)

The webhook + emails need real keys. Once `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ORDER_NOTIFY_EMAIL`, `CONTACT_TO_EMAIL` are set and products are seeded:

1. **Webhook (local):** `stripe listen --forward-to localhost:5173/api/stripe/webhook` (prints the `whsec_`). Run a test checkout (2b flow, card `4242…`). Confirm: the terminal shows `checkout.session.completed` → `200`; the purchased product's `stock` metadata dropped by the quantity in the Stripe Dashboard; an order email arrived at `ORDER_NOTIFY_EMAIL`.
2. **Stock floor:** buy a quantity ≥ current stock; confirm metadata floors at `0`, not negative.
3. **Contact form:** submit the contact form on `/contact` with the always-pass Turnstile dev key; confirm an inline success message, and an email at `CONTACT_TO_EMAIL` with the submitter as Reply-To.
4. **Contact failure UX:** temporarily unset `RESEND_API_KEY`; submit; confirm the inline error with the direct-email fallback (no crash, no `alert()`).

---

## Completion

After all tasks pass verification, use **superpowers:finishing-a-development-branch** to merge `phase2-fulfillment` back into `redesign` (NOT `main`). This completes Phase 2 (Stripe shop). Remaining work is Phase 3 (polish: Behold.so Instagram feed, gallery, motion/SEO/perf).

---

## Self-Review (completed against spec §8–§11)

**Spec coverage:**

- §8 Webhook: raw body + signature verify via `constructEvent`, 400 on unverified (Task 5); `checkout.session.completed` → retrieve with `line_items.data.price.product` expanded → `products.update` stock floored at 0 (Tasks 4–5); fires Resend order email (Task 5); 200 quickly, other events 200-ignored (Task 5); best-effort idempotency via logged `event.id` (Task 5); oversell limitation unchanged (documented in spec).
- §9 Order email: internal notification (line items, qty, shipping, total) From `RESEND_FROM_EMAIL` To `ORDER_NOTIFY_EMAIL` (Tasks 2–3, 5); customer gets Stripe's automatic receipt (no code); `email.ts` exposes `sendOrderNotification` + `sendContactMessage` (Task 3).
- §9 Contact swap: server-side Resend via the existing form action (Task 6), Turnstile reused (Task 6), From `RESEND_FROM_EMAIL` To `CONTACT_TO_EMAIL` Reply-To submitter (Tasks 3, 6); `@emailjs/browser` + public key removed (Task 7); server-boundary validation with friendly errors (Task 6).
- §10 Env/security: new vars via `$env/dynamic/private` (server-only) — webhook secret + Resend + recipient addresses (Tasks 1, 3, 5); no publishable key; webhook signature verified; user input HTML-escaped in emails (Task 2); validation friendly + leaks no secrets (Task 6).

**Placeholder scan:** every code step is complete; no TBD/"handle errors"/"similar to".

**Type consistency:** `OrderEmailData`/`OrderEmailLine`/`ContactEmailData`/`RenderedEmail` (Task 2) are imported unchanged by `email.ts` (Task 3) and `fulfillment.ts` (Task 4). `StockUpdate` (Task 4) is consumed by the webhook loop (Task 5). `sendOrderNotification(order)` / `sendContactMessage(msg)` signatures match their call sites (Tasks 5, 6). The webhook test's `products.update('prod_a', { metadata: { stock: '6' } })` matches `stockUpdatesFromLineItems` math (8 − 2 = 6) and the handler's `String(update.stock)` call.

**Intentional decisions:** new secrets use `$env/dynamic/private` (not `static`) so the branch builds before the user provisions Resend/webhook keys — the existing static imports are unchanged. Contact UX modernized to an inline `role="status"` message (per the chosen option), replacing `alert()`. The order email is a clean HTML table (per the chosen option). E2E covers the contact-page render (works without keys); the full webhook + email paths are documented as manual verification since they need real secrets.

```

```
