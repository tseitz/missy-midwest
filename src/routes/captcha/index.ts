import dotenv from 'dotenv';

dotenv.config();

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function post({ request }) {
	const data = await request.json();

	const reply = await fetch(
		`https://www.google.com/recaptcha/api/siteverify?secret=${process.env['MISSY_CAPTCHA_SECRET_KEY']}&response=${data.token}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);

	const validation = await reply.json();

	if (validation.success) {
		return {
			status: 200,
			body: {
				message: 'Message sent! Thanks for your submission :)'
			}
		};
	}

	return {
		status: 403,
		body: {
			error: 'Recaptcha failed. Sorry robot. Please retry if you are in fact, human.'
		}
	};
}
