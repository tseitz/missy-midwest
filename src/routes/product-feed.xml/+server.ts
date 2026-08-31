import { error } from '@sveltejs/kit';
import { listGroups } from '$lib/server/catalog';
import { buildProductFeed } from '$lib/shop/product-feed';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	if (!SHOP_ENABLED) error(404, 'Not found');

	const { groups, error: catalogError } = await listGroups();
	// Serving an empty feed would tell Merchant Center every product was
	// discontinued, so a Stripe outage must fail loudly instead. Google retries
	// a 503 on its next scheduled fetch and leaves the last good feed in place.
	if (catalogError) error(503, 'Product catalog is temporarily unavailable');

	return new Response(buildProductFeed(groups, url.origin), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=900'
		}
	});
};
