import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/private';
import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry } from '@sentry/sveltekit';

// Errors-only: initialize only when a DSN is configured (prod), so local dev
// and tests stay a no-op. No performance tracing or session replay.
if (env.SENTRY_DSN) {
	Sentry.init({
		dsn: env.SENTRY_DSN,
		// Default to 'development' so a run only counts as production when a deploy
		// explicitly sets SENTRY_ENVIRONMENT (set per Netlify context). This keeps
		// local prod-mode runs (vite preview / netlify dev) out of the production
		// error feed even when a DSN is present in the local env.
		environment: env.SENTRY_ENVIRONMENT ?? 'development',
		tracesSampleRate: 0
	});
}

// Sentry's request handler must run first so it can scope errors to the request.
export const handle = sequence(Sentry.sentryHandle());

// Captures unhandled server-side errors. Falls through to the default handler
// when Sentry isn't initialized.
export const handleError = handleErrorWithSentry();
