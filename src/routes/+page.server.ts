import { fail } from '@sveltejs/kit';
import { validateTurnstileToken } from '$lib/server/turnstile';
import { getUpcomingEvents } from '$lib/server/calendar';

export const load = async () => {
	return await getUpcomingEvents();
};

export const actions = {
	contact: async ({ request }) => {
		const formData = await request.formData();

		// Get Turnstile token
		const turnstileToken = formData.get('cf-turnstile-response')?.toString() || '';

		// Validate Turnstile token
		if (!turnstileToken || !(await validateTurnstileToken(turnstileToken))) {
			return fail(400, {
				success: false,
				message: 'Invalid CAPTCHA. Sorry robot. Please retry if you are in fact, human.'
			});
		}

		// Return success - email will be sent from client-side
		return {
			success: true,
			message: 'Message sent! Thanks for your submission :)'
		};
	}
};
