import { describe, it, expect, vi, beforeEach } from 'vitest';

// Toggle `dev` per test via a hoisted getter (same pattern as the shop flag mock).
const state = vi.hoisted(() => ({ dev: false }));
vi.mock('$app/environment', () => ({
	get dev() {
		return state.dev;
	}
}));

import { netlifyImage, netlifyImageSrcset } from './netlify-image';

beforeEach(() => {
	state.dev = false;
});

describe('netlifyImage', () => {
	it('wraps a same-origin path in the Netlify Image CDN endpoint (prod)', () => {
		const url = netlifyImage('/api/event-poster/abc123', { width: 1200 });
		expect(url).toBe('/.netlify/images?url=%2Fapi%2Fevent-poster%2Fabc123&w=1200&fm=webp&q=75');
	});

	it('honors format and quality overrides', () => {
		const url = netlifyImage('/x.png', { width: 600, format: 'avif', quality: 60 });
		expect(url).toBe('/.netlify/images?url=%2Fx.png&w=600&fm=avif&q=60');
	});

	it('passes the raw path through in dev (the /.netlify/images endpoint is prod-only)', () => {
		state.dev = true;
		expect(netlifyImage('/api/event-poster/abc123', { width: 1200 })).toBe(
			'/api/event-poster/abc123'
		);
	});
});

describe('netlifyImageSrcset', () => {
	it('builds a width-descriptor srcset across the given widths (prod)', () => {
		const srcset = netlifyImageSrcset('/p.jpg', [640, 1280]);
		expect(srcset).toBe(
			'/.netlify/images?url=%2Fp.jpg&w=640&fm=webp&q=75 640w, ' +
				'/.netlify/images?url=%2Fp.jpg&w=1280&fm=webp&q=75 1280w'
		);
	});
});
