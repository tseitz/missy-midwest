import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock is hoisted above module init, so the shared mocks must be hoisted too.
const { filesGetMock, captureMessage } = vi.hoisted(() => ({
	filesGetMock: vi.fn(),
	captureMessage: vi.fn()
}));

vi.mock('googleapis', () => ({
	google: {
		drive: () => ({ files: { get: filesGetMock } }),
		auth: { JWT: class {} }
	}
}));

vi.mock('$env/static/private', () => ({
	MISSY_CALENDAR_CLIENT_EMAIL: 'svc@example.com',
	MISSY_CALENDAR_PRIVATE_KEY: 'key'
}));

vi.mock('@sentry/sveltekit', () => ({ captureMessage }));

import { getPosterImage } from './drive';

const FILE_ID = 'aBcD1234_efGhIjKlMnOp';
const IMG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

/** Mirror googleapis: metadata calls resolve the fields, `alt: 'media'` resolves bytes. */
function driveReturning(meta: { mimeType?: string; size?: string }) {
	filesGetMock.mockImplementation((params: { alt?: string }) => {
		if (params.alt === 'media') {
			return Promise.resolve({ data: IMG_BYTES.buffer });
		}
		return Promise.resolve({ data: meta });
	});
}

beforeEach(() => {
	filesGetMock.mockReset();
	captureMessage.mockClear();
});

describe('getPosterImage', () => {
	it('returns the image bytes and content type for an image file', async () => {
		driveReturning({ mimeType: 'image/webp', size: '2048' });

		const poster = await getPosterImage(FILE_ID);

		expect(poster).not.toBeNull();
		expect(poster?.contentType).toBe('image/webp');
		expect(Uint8Array.from(poster!.bytes)).toEqual(IMG_BYTES);
		expect(captureMessage).not.toHaveBeenCalled();
	});

	it('rejects an invalid file id without touching Drive or alerting', async () => {
		const poster = await getPosterImage('not a real id!');

		expect(poster).toBeNull();
		expect(filesGetMock).not.toHaveBeenCalled();
		expect(captureMessage).not.toHaveBeenCalled();
	});

	it('rejects a non-image file and alerts', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		driveReturning({ mimeType: 'application/pdf', size: '2048' });

		const poster = await getPosterImage(FILE_ID);

		expect(poster).toBeNull();
		expect(captureMessage).toHaveBeenCalledWith(expect.stringMatching(/image/i), 'error');
	});

	it('rejects an oversized file and alerts', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		driveReturning({ mimeType: 'image/png', size: String(50 * 1024 * 1024) });

		const poster = await getPosterImage(FILE_ID);

		expect(poster).toBeNull();
		expect(captureMessage).toHaveBeenCalledWith(
			expect.stringMatching(/exceed|large|size/i),
			'error'
		);
	});

	it('returns null and alerts when the Drive API throws', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		filesGetMock.mockRejectedValue(new Error('drive boom'));

		const poster = await getPosterImage(FILE_ID);

		expect(poster).toBeNull();
		expect(captureMessage).toHaveBeenCalledWith(expect.stringMatching(/drive boom/), 'error');
	});
});
