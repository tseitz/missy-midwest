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
		tracesSampleRate: 0
	});
}

// Captures unhandled client-side errors. Falls through to the default handler
// when Sentry isn't initialized.
export const handleError = handleErrorWithSentry();
