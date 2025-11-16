import { MISSY_TURNSTILE_SECRET_KEY } from '$env/static/private';

/**
 * Validate Cloudflare Turnstile token server-side
 */
export async function validateTurnstileToken(token: string): Promise<boolean> {
	const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			secret: MISSY_TURNSTILE_SECRET_KEY,
			response: token
		})
	});
	const data = await response.json();
	return data.success;
}

