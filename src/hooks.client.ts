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
// `vite:preloadError`. We reload once to fetch the current chunks. A short
// cooldown (tracked in sessionStorage) guards against an infinite reload loop:
// if we already reloaded moments ago and an import *still* failed, the deployed
// build is genuinely broken, so we let the error throw through to Sentry rather
// than reload again. The proactive version-poll in the root layout prevents most
// stale-chunk cases up front; this is the safety net for the rest.
const PRELOAD_RELOAD_KEY = 'sk:preload-reloaded-at';
const PRELOAD_RELOAD_COOLDOWN_MS = 10_000;

window.addEventListener('vite:preloadError', (event: Event) => {
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
	event.preventDefault();
	location.reload();
});

// Captures unhandled client-side errors. Falls through to the default handler
// when Sentry isn't initialized.
export const handleError = handleErrorWithSentry();
