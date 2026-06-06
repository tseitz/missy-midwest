import { MISSY_TURNSTILE_SECRET_KEY } from '$env/static/private';
import { z } from 'zod';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Cloudflare's siteverify response — we only depend on `success`. */
const siteverifySchema = z.object({ success: z.boolean() });

/**
 * Validate a Cloudflare Turnstile token server-side. This is the only bot gate
 * on the contact form, so it fails *closed*: any network error, non-2xx
 * response, or unexpected payload shape returns `false` rather than throwing.
 */
export async function validateTurnstileToken(token: string): Promise<boolean> {
	try {
		const response = await fetch(SITEVERIFY_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ secret: MISSY_TURNSTILE_SECRET_KEY, response: token })
		});
		if (!response.ok) return false;
		const parsed = siteverifySchema.safeParse(await response.json());
		return parsed.success && parsed.data.success;
	} catch {
		return false;
	}
}
