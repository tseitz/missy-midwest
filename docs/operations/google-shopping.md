# Google Shopping tab (free listings)

How Missy Midwest merch gets onto Google's Search **Shopping** tab. Free — this
is not Google Ads.

## Why this exists

Google emailed Search Console (`sc-noreply@google.com`, 2026-08-24, "Your
products aren't on the Search Shopping tab") saying products from the site were
missing from the Shopping tab. The site is a custom SvelteKit + Stripe
storefront, so Google's one-click Shopify / WooCommerce connector does not
apply. We feed Google by hand instead.

## How the pieces fit

```
                    ┌→  /product-feed.xml  ──────→  Merchant Center  →  Shopping tab
Stripe catalog  ────┤     (scheduled fetch, 24h)          ↑
                    └→  /shop/<group> page  ──────────────┘
                          Product JSON-LD      (price/stock cross-check)
```

Four things must all be true:

1. **A product feed is served at `/product-feed.xml`.** Built by
   `buildProductFeed()` in `src/lib/shop/product-feed.ts`, served by
   `src/routes/product-feed.xml/+server.ts`. **This is the primary channel** —
   Merchant Center fetches it on a schedule.
2. **Every product page carries Product structured data.** Built by
   `productJsonLd()` in `src/lib/seo/jsonld.ts`, rendered by
   `src/routes/shop/[group]/+page.svelte`. Merchant Center reads this to verify
   the feed's price and availability against the real page; a mismatch suspends
   the account.
3. **A shipping policy and a return policy are published on the site.**
   `/shipping-returns` (`src/routes/shipping-returns/+page.svelte`), linked from
   the footer and from every product page.
4. **A Merchant Center account is claimed for the domain and linked to Search
   Console.** Manual, browser-only — see the runbook below.

### Why a feed and not the website crawl

Merchant Center can also discover products by crawling the site's structured
data ("Add products from missymidwest.com"). We do **not** use it. That card
only appears once Google has already crawled and detected valid structured
data, and practitioners report it takes weeks to pick up new products or
propagate a price change. A fetched feed updates every 24 hours and fails
loudly. The structured data still earns its keep as the cross-check in step 2.

## The product feed

One `<item>` per **variant**, not per group — every color and size has its own
price, stock, and landing URL, and Merchant Center treats an item as one buyable
thing. `g:item_group_id` (the group slug) is what re-joins them into a single
product with a color picker.

Notable choices:

- **`g:identifier_exists` is `no`, and `g:mpn` is the Stripe Product ID.** Custom
  merch has no barcode. This pair is the accepted substitute for a GTIN.
- **`g:age_group` and `g:gender` are hardcoded** to `adult` / `unisex`. Apparel
  listings are rejected in the US without them.
- **A variant with no image is dropped.** Merchant Center rejects an imageless
  item anyway, and rejections count against the account's health score.
- **A Stripe outage returns 503, never an empty feed.** An empty feed tells
  Merchant Center every product was discontinued. Google retries on its next
  scheduled fetch and keeps the last good copy.
- **Everything is XML-escaped.** One `&` in a Stripe description would otherwise
  reject the entire file, not just that row.

## The structured data

`productJsonLd(group, origin)` emits one of two shapes:

| Group                       | Shape          | Why                                                                                                      |
| --------------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| 1 variant                   | `Product`      | A `ProductGroup` that varies by nothing is invalid.                                                      |
| 2+ variants (color or size) | `ProductGroup` | Each variant has its own price and stock, so a sold-out color must list separately from an in-stock one. |

Every `Offer` carries the four fields Merchant Center will otherwise reject on:

- `price` / `priceCurrency` — bare decimal, no `$`, from the Stripe price.
- `availability` — `InStock` when stock > 0, else `OutOfStock`.
- `shippingDetails` — flat US rate from `SHIPPING_RATE_CENTS`.
- `hasMerchantReturnPolicy` — `MerchantReturnNotPermitted` (all sales final).

`SHIPPING_RATE_CENTS` lives in `src/lib/shop/config.ts` and is the single source
for the Stripe Checkout shipping option, the structured data, and the published
policy page. **Merchant Center suspends accounts whose feed price disagrees with
the page price**, so never fork this number.

We do not send GTINs. These are custom-made merch with no barcode; `brand` +
`sku` (the Stripe Product ID) is the accepted substitute. In Merchant Center,
answer "no" when asked whether products have GTINs.

## Runbook: first-time Merchant Center setup

Do this once, in a browser, signed in as the Google account that owns Search
Console for `missymidwest.com`.

1. **Deploy first.** Merchant Center fetches live URLs; it cannot see localhost.
   Confirm `https://missymidwest.com/product-feed.xml` returns XML, and run a
   product URL through the
   [Rich Results Test](https://search.google.com/test/rich-results) — it should
   report a valid `Product` or `ProductGroup`.
2. **Create the account** at
   [merchants.google.com](https://merchants.google.com) — **not**
   `merchantcenter.google.com`, which does not resolve. Business name
   `Missy Midwest`, country United States, currency USD.
3. **Claim the website.** Merchant Center → _Business info_ → _Website_. Because
   the domain is already verified in Search Console under the same Google
   account, this should verify with one click.
4. **Add the feed.** _Products_ → _Add products_ → **Add products from a file**
   → _Enter a link to your file_, and paste
   `https://missymidwest.com/product-feed.xml`. Leave the schedule on daily and
   authentication on "no username and password". (In the onboarding wizard this
   is the "Select how you want to add your products" step. The cards are a
   carousel — the website-crawl card hides behind the `>` arrow, and only
   appears at all once Google has detected structured data. Ignore it; see
   "Why a feed and not the website crawl" above.)
5. **Set shipping.** Country United States. For delivery times pick **"Enter
   specific delivery times manually"** — handling 1–3 business days, transit
   3–7, which is what `/shipping-returns` promises. "By carrier" would let
   Google estimate its own times, which can then contradict the page. Then set
   the rate to a flat `SHIPPING_RATE_CENTS`.

   **Do not try to declare local pickup here.** Stripe Checkout offers free
   local pickup, but Merchant Center only exposes a pickup policy to accounts
   enrolled in local inventory ads / free local listings, which needs a verified
   Business Profile with real store locations and store codes. Missy has no
   storefront, so pickup is unreachable and the shipping-only setup is correct.
   The `$10` in the feed is the shipped price; pickup is a checkout-time
   discount Google never needs to model.

6. **Set the return policy.** _Shipping and returns_ → _Returns_ → "no returns
   accepted". This must match `/shipping-returns` word for word in meaning, or
   the account gets flagged.
7. **Link Search Console.** In Search Console → _Shopping_ → _Get started_, pick
   the Merchant Center account. (This is the button the original email linked
   to. It only works after step 2.)
8. **Wait.** Google reviews over roughly 3–5 business days. Check _Products_ →
   _Diagnostics_ for rejections.

## Runbook: after adding a new product

Nothing to do. New Stripe products flow into `/shop`, the sitemap, the
structured data, and `/product-feed.xml` automatically. Merchant Center refetches
the feed daily. To hurry it along, use _Data sources_ → the feed → _Fetch now_.

## Failure modes

| Symptom                            | Cause                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| "Missing return policy"            | Step 6 not done, or `/shipping-returns` unreachable.                                                   |
| "Price mismatch"                   | The feed and the page disagree — usually a stale build, or someone forked `SHIPPING_RATE_CENTS`.       |
| "Missing value: gtin"              | A warning, not a rejection. Safe to ignore for custom merch.                                           |
| One product missing from the feed  | That variant has no image in Stripe. `buildProductFeed` drops imageless items on purpose.              |
| Product in the feed but not listed | Still in review, or the variant is `out_of_stock` — Google hides out-of-stock items.                   |
| Feed fetch returns 503             | Stripe is unreachable. Deliberate: an empty feed would read as "everything discontinued".              |
| All products vanish                | `SHOP_ENABLED` is `false` in `src/lib/shop/config.ts`, so the feed 404s and `/shop/<group>` redirects. |

## Related

- [shop-stripe.md](shop-stripe.md) — the catalog and inventory model behind all
  of this.
