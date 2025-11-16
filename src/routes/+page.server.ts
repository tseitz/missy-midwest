import { google } from 'googleapis';
import {
	MISSY_CALENDAR_CLIENT_EMAIL,
	MISSY_CALENDAR_PRIVATE_KEY,
	MISSY_TURNSTILE_SECRET_KEY,
	MISSY_EMAIL_USER_ID,
	MISSY_EMAIL_SERVICE_ID,
	MISSY_EMAIL_TEMPLATE_ID
} from '$env/static/private';
import { fail } from '@sveltejs/kit';

const calendar = google.calendar('v3');

// Validate Turnstile token
async function validateTurnstileToken(token: string): Promise<boolean> {
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

// Send email via EmailJS (server-side)
async function sendEmail(formData: {
	name: string;
	email: string;
	phone: string;
	message: string;
}) {
	const response = await fetch(`https://api.emailjs.com/api/v1.0/email/send`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			service_id: MISSY_EMAIL_SERVICE_ID,
			template_id: MISSY_EMAIL_TEMPLATE_ID,
			user_id: MISSY_EMAIL_USER_ID,
			template_params: formData
		})
	});
	return response.ok;
}

export const load = async () => {
	const client = new google.auth.JWT(
		MISSY_CALENDAR_CLIENT_EMAIL,
		undefined,
		MISSY_CALENDAR_PRIVATE_KEY.replace(/\\n/g, '\n'),
		['https://www.googleapis.com/auth/calendar.readonly']
	);

	try {
		const response = await calendar.events.list({
			auth: client,
			calendarId: 'missy.midwestofficial@gmail.com',
			timeMin: new Date().toISOString(),
			// maxResults: 20,
			singleEvents: true,
			orderBy: 'startTime'
		});

		return {
			body: response.data.items
		};
	} catch (error) {
		console.error(error);
		return {
			status: 500,
			body: error instanceof Error ? error.message : 'Unknown error'
		};
	}
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
