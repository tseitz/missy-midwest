import { describe, it, expect, vi, beforeEach } from 'vitest';

const { validateMock, sendContactMock } = vi.hoisted(() => ({
	validateMock: vi.fn(),
	sendContactMock: vi.fn()
}));

vi.mock('$lib/server/turnstile', () => ({ validateTurnstileToken: validateMock }));
vi.mock('$lib/server/email', () => ({ sendContactMessage: sendContactMock }));

import { actions } from './+page.server';

function form(fields: Record<string, string>) {
	const body = new URLSearchParams(fields).toString();
	return {
		request: new Request('http://localhost/contact', {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body
		})
	} as unknown as Parameters<typeof actions.contact>[0];
}

const valid = {
	name: 'Ada',
	email: 'ada@example.com',
	phone: '',
	message: 'Hello Missy',
	'cf-turnstile-response': 'token'
};

beforeEach(() => {
	validateMock.mockReset().mockResolvedValue(true);
	sendContactMock.mockReset().mockResolvedValue(undefined);
});

describe('contact action', () => {
	it('sends the message and returns success when valid', async () => {
		const res = await actions.contact(form(valid));
		expect(res).toMatchObject({ success: true });
		expect(sendContactMock).toHaveBeenCalledWith({
			name: 'Ada',
			email: 'ada@example.com',
			phone: '',
			message: 'Hello Missy'
		});
	});

	it('fails with 400 when required fields are missing and does not send', async () => {
		const res = await actions.contact(form({ ...valid, name: '' }));
		expect(res).toMatchObject({ status: 400 });
		expect(sendContactMock).not.toHaveBeenCalled();
	});

	it('fails with 400 on an invalid email', async () => {
		const res = await actions.contact(form({ ...valid, email: 'not-an-email' }));
		expect(res).toMatchObject({ status: 400 });
		expect(sendContactMock).not.toHaveBeenCalled();
	});

	it('fails with 400 when Turnstile rejects', async () => {
		validateMock.mockResolvedValue(false);
		const res = await actions.contact(form(valid));
		expect(res).toMatchObject({ status: 400 });
		expect(sendContactMock).not.toHaveBeenCalled();
	});

	it('fails with 502 when the email send throws', async () => {
		sendContactMock.mockRejectedValue(new Error('resend down'));
		const res = await actions.contact(form(valid));
		expect(res).toMatchObject({ status: 502 });
	});

	it('strips newlines from single-line fields to prevent email header injection', async () => {
		await actions.contact(
			form({
				...valid,
				name: 'Ada\r\nBcc: evil@example.com',
				email: 'ada@example.com\r\n',
				phone: '555-1212\nX'
			})
		);
		const sent = sendContactMock.mock.calls[0][0];
		expect(sent.name).not.toMatch(/[\r\n]/);
		expect(sent.email).not.toMatch(/[\r\n]/);
		expect(sent.phone).not.toMatch(/[\r\n]/);
		expect(sent.email).toBe('ada@example.com');
	});

	it('rejects an over-long name with 400', async () => {
		const res = await actions.contact(form({ ...valid, name: 'A'.repeat(201) }));
		expect(res).toMatchObject({ status: 400 });
		expect(sendContactMock).not.toHaveBeenCalled();
	});
});
