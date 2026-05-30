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
});
