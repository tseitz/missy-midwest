import { describe, it, expect, vi, beforeEach } from 'vitest';

const { getUpcomingEventsMock, getPosterImageMock } = vi.hoisted(() => ({
	getUpcomingEventsMock: vi.fn(),
	getPosterImageMock: vi.fn()
}));

vi.mock('$lib/server/calendar', () => ({ getUpcomingEvents: getUpcomingEventsMock }));
vi.mock('$lib/server/drive', () => ({ getPosterImage: getPosterImageMock }));
// asset() is identity in tests — we just assert the redirect target path.
vi.mock('$app/paths', () => ({ asset: (path: string) => path }));

import { GET } from './+server';

const KNOWN_ID = 'aBcD1234_efGhIjKlMnOp';
const DEFAULT_POSTER = '/shows/default-event.webp';

/** The route passes { params: { fileId } } among other RequestEvent fields. */
function request(fileId: string) {
	return { params: { fileId } } as unknown as Parameters<typeof GET>[0];
}

beforeEach(() => {
	getUpcomingEventsMock.mockReset();
	getPosterImageMock.mockReset();
	getUpcomingEventsMock.mockResolvedValue({
		events: [{ id: 'evt1', attachments: [{ fileId: KNOWN_ID }] }]
	});
});

describe('GET /api/event-poster/[fileId]', () => {
	it('streams the poster bytes with caching headers for a known event poster', async () => {
		const bytes = Buffer.from([1, 2, 3, 4]);
		getPosterImageMock.mockResolvedValue({ bytes, contentType: 'image/webp' });

		const res = await GET(request(KNOWN_ID));

		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toBe('image/webp');
		expect(res.headers.get('cache-control')).toMatch(/s-maxage=\d+/);
		expect(Buffer.from(await res.arrayBuffer())).toEqual(bytes);
	});

	it('redirects to the default poster for a file id not attached to any event', async () => {
		await expect(GET(request('unknownFileId123'))).rejects.toMatchObject({
			status: 302,
			location: DEFAULT_POSTER
		});
		expect(getPosterImageMock).not.toHaveBeenCalled();
	});

	it('redirects to the default poster when the Drive download fails', async () => {
		getPosterImageMock.mockResolvedValue(null);

		await expect(GET(request(KNOWN_ID))).rejects.toMatchObject({
			status: 302,
			location: DEFAULT_POSTER
		});
	});
});
