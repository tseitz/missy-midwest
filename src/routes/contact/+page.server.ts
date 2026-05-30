import { fail } from '@sveltejs/kit';
import { validateTurnstileToken } from '$lib/server/turnstile';
import type { Actions } from './$types';

export const actions: Actions = {
	contact: async ({ request }) => {
		const formData = await request.formData();
		const turnstileToken = formData.get('cf-turnstile-response')?.toString() || '';

		if (!turnstileToken || !(await validateTurnstileToken(turnstileToken))) {
			return fail(400, {
				success: false,
				message: 'Invalid CAPTCHA. Sorry robot. Please retry if you are in fact, human.'
			});
		}

		return {
			success: true,
			message: 'Message sent! Thanks for your submission :)'
		};
	}
};
