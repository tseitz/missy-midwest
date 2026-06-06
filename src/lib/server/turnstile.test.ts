import { describe, it, expect, afterEach, vi } from 'vitest';

vi.mock('$env/static/private', () => ({ MISSY_TURNSTILE_SECRET_KEY: 'secret' }));

import { validateTurnstileToken } from './turnstile';

function mockFetch(impl: () => Partial<Response>) {
	const fn = vi.fn(() => Promise.resolve(impl() as Response));
	vi.stubGlobal('fetch', fn);
	return fn;
}

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('validateTurnstileToken', () => {
	it('returns true when Cloudflare reports success', async () => {
		const fetchSpy = mockFetch(() => ({
			ok: true,
			json: () => Promise.resolve({ success: true })
		}));
		expect(await validateTurnstileToken('tok')).toBe(true);
		expect(fetchSpy).toHaveBeenCalledOnce();
	});

	it('returns false when Cloudflare reports failure', async () => {
		mockFetch(() => ({ ok: true, json: () => Promise.resolve({ success: false }) }));
		expect(await validateTurnstileToken('tok')).toBe(false);
	});

	it('fails closed on a non-OK response', async () => {
		mockFetch(() => ({ ok: false, status: 500, json: () => Promise.resolve({ success: true }) }));
		expect(await validateTurnstileToken('tok')).toBe(false);
	});

	it('fails closed on an unexpected payload shape', async () => {
		mockFetch(() => ({ ok: true, json: () => Promise.resolve({ nope: 1 }) }));
		expect(await validateTurnstileToken('tok')).toBe(false);
	});

	it('fails closed when the request throws', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.reject(new Error('network down')))
		);
		expect(await validateTurnstileToken('tok')).toBe(false);
	});
});
