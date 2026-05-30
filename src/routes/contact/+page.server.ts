import { fail } from '@sveltejs/kit';
import { validateTurnstileToken } from '$lib/server/turnstile';
import { sendContactMessage } from '$lib/server/email';
import type { Actions } from './$types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 10000;
const MAX_NAME = 200;

/** Collapse newlines to a space so single-line fields can't inject email headers (Subject/Reply-To). */
function singleLine(value: string): string {
	return value.replace(/[\r\n]+/g, ' ').trim();
}

export const actions: Actions = {
	contact: async ({ request }) => {
		const formData = await request.formData();
		const name = singleLine(formData.get('name')?.toString() ?? '');
		const email = singleLine(formData.get('email')?.toString() ?? '');
		const phone = singleLine(formData.get('phone')?.toString() ?? '');
		const message = (formData.get('message')?.toString() ?? '').trim();
		const turnstileToken = formData.get('cf-turnstile-response')?.toString() ?? '';

		if (!name || !email || !message) {
			return fail(400, {
				success: false,
				message: 'Please fill in your name, email, and message.'
			});
		}
		if (name.length > MAX_NAME) {
			return fail(400, { success: false, message: 'Please use a shorter name.' });
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
