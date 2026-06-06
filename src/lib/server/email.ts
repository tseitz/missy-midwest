import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import {
	renderOrderNotification,
	renderContactMessage,
	type OrderEmailData,
	type ContactEmailData
} from './email-templates';

const resend = new Resend(env.RESEND_API_KEY ?? '');

/** Email Missy a notification for a completed order. Throws if Resend reports an error. */
export async function sendOrderNotification(order: OrderEmailData): Promise<void> {
	const { subject, html } = renderOrderNotification(order);
	const { error } = await resend.emails.send({
		from: env.RESEND_FROM_EMAIL ?? '',
		to: env.ORDER_NOTIFY_EMAIL ?? '',
		subject,
		html
	});
	if (error) throw new Error(`Resend order email failed: ${error.message}`);
}

/** Forward a contact-form message to Missy with the submitter set as reply-to. */
export async function sendContactMessage(msg: ContactEmailData): Promise<void> {
	const { subject, html } = renderContactMessage(msg);
	const { error } = await resend.emails.send({
		from: env.RESEND_FROM_EMAIL ?? '',
		to: env.CONTACT_TO_EMAIL ?? '',
		replyTo: msg.email,
		subject,
		html
	});
	if (error) throw new Error(`Resend contact email failed: ${error.message}`);
}
