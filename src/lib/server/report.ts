import * as Sentry from '@sentry/sveltekit';

/**
 * Single seam for external-boundary failures: logs server-side and reports to
 * Sentry (a no-op when Sentry isn't initialized, e.g. local dev / tests). A
 * broken feed, API, or fulfillment step surfaces as an alert rather than
 * failing silently. `context` is a short, stable label; `detail` is the
 * specific cause (usually an error message).
 */
export function reportFailure(context: string, detail: string): void {
	const message = `${context}: ${detail}`;
	console.error(message);
	Sentry.captureMessage(message, 'error');
}

/** Narrow an unknown thrown value to a human-readable string. */
export function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : 'Unknown error';
}
