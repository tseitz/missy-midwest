import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock is hoisted above module init, so the shared mocks must be hoisted too.
const { listMock, captureMessage } = vi.hoisted(() => ({
	listMock: vi.fn(),
	captureMessage: vi.fn()
}));

// calendar.ts imports `calendar`; google-auth.ts imports `auth` — both from here.
vi.mock('@googleapis/calendar', () => ({
	calendar: () => ({ events: { list: listMock } }),
	auth: { JWT: class {} }
}));

vi.mock('$env/static/private', () => ({
	MISSY_CALENDAR_CLIENT_EMAIL: 'svc@example.com',
	MISSY_CALENDAR_PRIVATE_KEY: 'key'
}));

vi.mock('@sentry/sveltekit', () => ({ captureMessage }));

import { getUpcomingEvents, getNextEvents, __clearCalendarCache } from './calendar';

/** A minimally valid Google Calendar event — the fields the boundary validates. */
function calEvent(id: string) {
	return { id, summary: `Show ${id}`, start: { dateTime: '2026-06-14T20:00:00-05:00' } };
}

beforeEach(() => {
	listMock.mockReset();
	captureMessage.mockClear();
	__clearCalendarCache();
});

describe('getUpcomingEvents', () => {
	it('returns the validated events array on success', async () => {
		listMock.mockResolvedValue({ data: { items: [calEvent('1'), calEvent('2')] } });
		const result = await getUpcomingEvents();
		expect(result.events).toHaveLength(2);
		expect(result.error).toBeUndefined();
		expect(captureMessage).not.toHaveBeenCalled();
	});

	it('projects each event to only the UI fields, stripping Google bloat', async () => {
		listMock.mockResolvedValue({
			data: {
				items: [
					{
						id: '1',
						summary: 'Beach Party',
						start: { dateTime: '2026-06-14T20:00:00-05:00', timeZone: 'America/Chicago' },
						htmlLink: 'https://cal/1',
						location: 'The Lake, MN',
						attachments: [
							{ fileId: 'abc', fileUrl: 'u', iconLink: 'i', mimeType: 'image/png', title: 't' }
						],
						// Bulk Google fields that must not survive into the payload:
						kind: 'calendar#event',
						etag: '"123"',
						status: 'confirmed',
						created: '2026-05-05T15:46:51.000Z',
						updated: '2026-05-05T15:46:51.209Z',
						organizer: { email: 'o@x', self: true },
						creator: { email: 'c@x', self: true },
						reminders: { useDefault: true },
						iCalUID: 'uid@google',
						sequence: 0
					}
				]
			}
		});

		const { events } = await getUpcomingEvents();

		expect(events).toEqual([
			{
				id: '1',
				summary: 'Beach Party',
				start: { dateTime: '2026-06-14T20:00:00-05:00' },
				htmlLink: 'https://cal/1',
				location: 'The Lake, MN',
				attachments: [{ fileId: 'abc' }]
			}
		]);
	});

	it('drops malformed events and reports possible schema drift', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		listMock.mockResolvedValue({ data: { items: [calEvent('1'), { id: 'x' }] } });
		const result = await getUpcomingEvents();
		expect(result.events).toHaveLength(1);
		expect(captureMessage).toHaveBeenCalledWith(expect.stringMatching(/validation/i), 'error');
	});

	it('returns an error message and empty events on failure', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		listMock.mockRejectedValue(new Error('boom'));
		const result = await getUpcomingEvents();
		expect(result.events).toEqual([]);
		expect(result.error).toBe('boom');
		expect(captureMessage).toHaveBeenCalledWith(expect.stringMatching(/boom/), 'error');
	});

	it('caches results within the TTL (one API call for two reads)', async () => {
		listMock.mockResolvedValue({ data: { items: [calEvent('1')] } });
		await getUpcomingEvents();
		await getUpcomingEvents();
		expect(listMock).toHaveBeenCalledTimes(1);
	});
});

describe('getNextEvents', () => {
	it('returns at most n events', async () => {
		listMock.mockResolvedValue({
			data: { items: [calEvent('1'), calEvent('2'), calEvent('3')] }
		});
		const next = await getNextEvents(2);
		expect(next.events).toHaveLength(2);
	});
});
