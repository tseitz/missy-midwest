import { json as json$1 } from '@sveltejs/kit';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function POST({ request }) {
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
		return json$1({
			message: 'Message sent! Thanks for your submission :)'
		});
	}

	return json$1({
		error: 'Recaptcha failed. Sorry robot. Please retry if you are in fact, human.'
	}, {
		status: 403
	});
}
