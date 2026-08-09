import type { HandleClientError } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/public';
import { handleErrorWithSentry } from '@sentry/sveltekit';

// Errors-only: initialize only when a DSN is configured (prod), so local dev
// and tests stay a no-op. No performance tracing or session replay.
if (env.PUBLIC_SENTRY_DSN) {
	Sentry.init({
		dsn: env.PUBLIC_SENTRY_DSN,
		// Mirror the server default: only an explicit deploy-set var marks real
		// production, so local prod-mode runs report as 'development'.
		environment: env.PUBLIC_SENTRY_ENVIRONMENT ?? 'development',
		tracesSampleRate: 0,
		// Drop transient navigation fetch aborts — SvelteKit's client router
		// fetches each route's __data.json, and in-app browsers (Snapchat,
		// Instagram…) routinely kill that request mid-flight on flaky mobile
		// connections. WebKit reports it as "Load failed", Chromium as "Failed
		// to fetch". The router self-heals with a full-page navigation, so this
		// is unactionable noise rather than a real error.
		ignoreErrors: ['Load failed', 'Failed to fetch']
	});
}

// Graceful recovery for failed dynamic chunk imports. A route's hashed chunk
// can fail to load when it's gone stale after a fresh deploy, or when a flaky
// mobile connection drops the request — Vite surfaces both as a
// `vite:preloadError`. We reload once to fetch the current chunks. The proactive
// version-poll in the root layout prevents most stale-chunk cases up front; this
// is the safety net for the rest.
//
// Two guards, answering different questions:
//
//   - `reloading` (in-flight): `location.reload()` doesn't stop the world, so the
//     failed navigation keeps unwinding — SvelteKit falls back to its error page,
//     whose own nodes live in the same stale build and fail to preload too. Those
//     follow-on errors are pure noise from a page that's already on its way out,
//     so swallow every one of them for this page's remaining life. The same latch
//     gates `handleError` below, which catches the unwinding by another route.
//   - `PRELOAD_RELOAD_KEY` (cross-load cooldown): if we already reloaded moments
//     ago and an import *still* fails on the fresh page, the deployed build is
//     genuinely broken. Let that throw through to Sentry rather than reload again.
const PRELOAD_RELOAD_KEY = 'sk:preload-reloaded-at';
const PRELOAD_RELOAD_COOLDOWN_MS = 10_000;

let reloading = false;

export function handlePreloadError(event: Event) {
	// Already tearing this page down — swallow the cascade.
	if (reloading) {
		event.preventDefault();
		return;
	}

	let lastReload: number;
	try {
		lastReload = Number(sessionStorage.getItem(PRELOAD_RELOAD_KEY)) || 0;
	} catch {
		// Storage blocked (e.g. iOS Safari private mode) — without a durable guard
		// we can't rule out a reload loop, so bail and let the error surface.
		return;
	}

	if (Date.now() - lastReload < PRELOAD_RELOAD_COOLDOWN_MS) return;

	try {
		sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()));
	} catch {
		return;
	}

	// Swallow the throw (keeps it out of Sentry) and reload into fresh chunks.
	reloading = true;
	event.preventDefault();
	location.reload();
}

window.addEventListener('vite:preloadError', handlePreloadError);

// Pin the generic: called bare, it widens to the client|server union and won't
// accept a client-side `NavigationEvent`.
const reportError = handleErrorWithSentry<HandleClientError>();

// Captures unhandled client-side errors. Falls through to the default handler
// when Sentry isn't initialized.
export const handleError: HandleClientError = (input) => {
	// The third guard, and the reason `reloading` isn't only about preload events:
	// Vite's helper is `baseModule().catch(handlePreloadError)`, and that handler
	// only rethrows when the event *wasn't* cancelled. So cancelling above leaves
	// the failed import resolving to `undefined`, and SvelteKit dereferences it —
	// `node.universal` in `load_node`. The reload doesn't stop the world, so that
	// TypeError still unwinds through hydration and lands here. It, and anything
	// else this page throws on its way out, is noise. Returning nothing lets
	// SvelteKit fall back to its default `{ message }`, which the reload discards.
	if (reloading) return;

	return reportError(input);
};
