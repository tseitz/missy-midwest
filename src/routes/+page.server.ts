import { fail } from '@sveltejs/kit';
import { validateTurnstileToken } from '$lib/server/turnstile';
import { sendEmail } from '$lib/server/email';
import { getUpcomingEvents } from '$lib/server/calendar';

export const load = async () => {
	return await getUpcomingEvents();
};

export const actions = {
	contact: async ({ request }) => {
		const formData = await request.formData();

		// Get form fields
		const name = formData.get('name')?.toString() || '';
		const email = formData.get('email')?.toString() || '';
		const phone = formData.get('phone')?.toString() || '';
		const message = formData.get('message')?.toString() || '';
		const turnstileToken = formData.get('cf-turnstile-response')?.toString() || '';

		// Validate Turnstile token
		if (!turnstileToken || !(await validateTurnstileToken(turnstileToken))) {
			return fail(400, {
				success: false,
				message: 'Invalid CAPTCHA. Sorry robot. Please retry if you are in fact, human.'
			});
		}

		// Send email
		try {
			const emailSent = await sendEmail({ name, email, phone, message });
			if (emailSent) {
				return {
					success: true,
					message: 'Message sent! Thanks for your submission :)'
				};
			} else {
				return fail(500, {
					success: false,
					message:
						'Something went wrong. You can email Missy directly at missy.midwestofficial@gmail.com'
				});
			}
		} catch (error) {
			console.error('Email send error:', error);
			return fail(500, {
				success: false,
				message: 'Something went wrong. Please try again.'
			});
		}
	}
};
