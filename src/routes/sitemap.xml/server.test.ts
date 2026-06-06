import { describe, it, expect, vi, beforeEach } from 'vitest';

const { listGroupsMock } = vi.hoisted(() => ({ listGroupsMock: vi.fn() }));
vi.mock('$lib/server/catalog', () => ({ listGroups: listGroupsMock }));

import { GET } from './+server';

function event() {
	return {
		url: new URL('https://missymidwest.com/sitemap.xml')
	} as unknown as Parameters<typeof GET>[0];
}

beforeEach(() => listGroupsMock.mockReset());

describe('GET /sitemap.xml', () => {
	it('lists static routes and shop group urls', async () => {
		listGroupsMock.mockResolvedValue({
			groups: [{ slug: 'classic-trucker' }, { slug: 'tour-tee' }]
		});
		const res = await GET(event());
		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toContain('application/xml');
		const body = await res.text();
		expect(body).toContain('<loc>https://missymidwest.com/</loc>');
		expect(body).toContain('<loc>https://missymidwest.com/shop</loc>');
		expect(body).toContain('<loc>https://missymidwest.com/shop/classic-trucker</loc>');
		expect(body).toContain('<loc>https://missymidwest.com/shop/tour-tee</loc>');
	});

	it('degrades to static routes when the catalog errors', async () => {
		listGroupsMock.mockResolvedValue({ groups: [], error: 'stripe down' });
		const res = await GET(event());
		const body = await res.text();
		expect(body).toContain('<loc>https://missymidwest.com/</loc>');
		expect(body).not.toContain('/shop/');
	});
});
