import emailjs from '@emailjs/browser';

export interface EmailFormData {
	name: string;
	email: string;
	phone: string;
	message: string;
}

/**
 * Send email via EmailJS API client-side
 * EmailJS requires browser-based API calls
 */
export async function sendEmail(
	formData: EmailFormData,
	serviceId: string,
	templateId: string,
	publicKey: string
): Promise<boolean> {
	try {
		const response = await emailjs.send(
			serviceId,
			templateId,
			{
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				message: formData.message
			},
			publicKey
		);

		return response.status === 200;
	} catch (error) {
		console.error('EmailJS error:', error);
		return false;
	}
}
