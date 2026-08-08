import Stripe from 'stripe';

/**
 * Shared Stripe client for the `scripts/` CLI tools.
 *
 * Stripe's default Node HTTP client calls `https.request` directly and ignores
 * `HTTPS_PROXY`, so inside a sandboxed shell that routes egress through a proxy
 * (e.g. Claude Code) DNS is attempted outside the tunnel and every call dies
 * with `getaddrinfo ENOTFOUND api.stripe.com`. The fetch-based client goes
 * through undici, which *does* honour the proxy — but only when Node's built-in
 * env-proxy support is switched on, so run those sessions with:
 *
 *   NODE_USE_ENV_PROXY=1 node --env-file=.env scripts/set-stock.mjs list
 *
 * Outside a proxied shell nothing changes: we keep Stripe's default client.
 */
export function createStripe() {
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) {
		console.error(
			'STRIPE_SECRET_KEY is required. Run: node --env-file=.env scripts/<tool>.mjs ...'
		);
		process.exit(1);
	}

	const proxied = !!(process.env.HTTPS_PROXY || process.env.https_proxy);
	if (proxied && !process.env.NODE_USE_ENV_PROXY) {
		console.warn(
			'Warning: HTTPS_PROXY is set but NODE_USE_ENV_PROXY is not — Stripe calls will likely\n' +
				'fail with ENOTFOUND. Re-run with NODE_USE_ENV_PROXY=1 to route through the proxy.'
		);
	}

	return new Stripe(key, proxied ? { httpClient: Stripe.createFetchHttpClient() } : {});
}
