import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock is hoisted above module init, so the shared mock must be hoisted too.
const { listMock } = vi.hoisted(() => ({ listMock: vi.fn() }));

vi.mock('googleapis', () => ({
	google: {
		calendar: () => ({ events: { list: listMock } }),
		auth: { JWT: class {} }
	}
}));

vi.mock('$env/static/private', () => ({
	MISSY_CALENDAR_CLIENT_EMAIL: 'svc@example.com',
	MISSY_CALENDAR_PRIVATE_KEY: 'key'
}));

import { getUpcomingEvents, getNextEvents, __clearCalendarCache } from './calendar';

beforeEach(() => {
	listMock.mockReset();
	__clearCalendarCache();
});

describe('getUpcomingEvents', () => {
	it('returns the events array on success', async () => {
		listMock.mockResolvedValue({ data: { items: [{ id: '1' }, { id: '2' }] } });
		const result = await getUpcomingEvents();
		expect(result.events).toHaveLength(2);
		expect(result.error).toBeUndefined();
	});

	it('returns an error message and empty events on failure', async () => {
		listMock.mockRejectedValue(new Error('boom'));
		const result = await getUpcomingEvents();
		expect(result.events).toEqual([]);
		expect(result.error).toBe('boom');
	});

	it('caches results within the TTL (one API call for two reads)', async () => {
		listMock.mockResolvedValue({ data: { items: [{ id: '1' }] } });
		await getUpcomingEvents();
		await getUpcomingEvents();
		expect(listMock).toHaveBeenCalledTimes(1);
	});
});

describe('getNextEvents', () => {
	it('returns at most n events', async () => {
		listMock.mockResolvedValue({ data: { items: [{ id: '1' }, { id: '2' }, { id: '3' }] } });
		const next = await getNextEvents(2);
		expect(next.events).toHaveLength(2);
	});
});
