import { fail } from '@sveltejs/kit';
import { validateTurnstileToken } from '$lib/server/turnstile';
import { sendContactMessage } from '$lib/server/email';
import type { Actions } from './$types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 10000;

export const actions: Actions = {
	contact: async ({ request }) => {
		const formData = await request.formData();
		const name = (formData.get('name')?.toString() ?? '').trim();
		const email = (formData.get('email')?.toString() ?? '').trim();
		const phone = (formData.get('phone')?.toString() ?? '').trim();
		const message = (formData.get('message')?.toString() ?? '').trim();
		const turnstileToken = formData.get('cf-turnstile-response')?.toString() ?? '';

		if (!name || !email || !message) {
			return fail(400, {
				success: false,
				message: 'Please fill in your name, email, and message.'
			});
		}
		if (!EMAIL_RE.test(email)) {
			return fail(400, { success: false, message: 'Please enter a valid email address.' });
		}
		if (message.length > MAX_MESSAGE) {
			return fail(400, {
				success: false,
				message: 'That message is a bit long — could you trim it down?'
			});
		}
		if (!turnstileToken || !(await validateTurnstileToken(turnstileToken))) {
			return fail(400, {
				success: false,
				message: 'Invalid CAPTCHA. Sorry robot. Please retry if you are in fact, human.'
			});
		}

		try {
			await sendContactMessage({ name, email, phone, message });
		} catch (err) {
			console.error('Contact email send failed:', err);
			return fail(502, {
				success: false,
				message:
					'Something went wrong sending your message. You can email Missy directly at missy.midwestofficial@gmail.com'
			});
		}

		return { success: true, message: 'Message sent! Thanks for your submission :)' };
	}
};
