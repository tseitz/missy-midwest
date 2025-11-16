import {
	MISSY_EMAIL_USER_ID,
	MISSY_EMAIL_SERVICE_ID,
	MISSY_EMAIL_TEMPLATE_ID
} from '$env/static/private';

export interface EmailFormData {
	name: string;
	email: string;
	phone: string;
	message: string;
}

/**
 * Send email via EmailJS API server-side
 */
export async function sendEmail(formData: EmailFormData): Promise<boolean> {
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

