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

// Captures unhandled client-side errors. Falls through to the default handler
// when Sentry isn't initialized.
export const handleError = handleErrorWithSentry();
