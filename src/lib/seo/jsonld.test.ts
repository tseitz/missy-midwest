import { describe, it, expect } from 'vitest';
import { musicGroupJsonLd } from './jsonld';

describe('musicGroupJsonLd', () => {
	it('builds a MusicGroup schema with absolute url + image and social sameAs', () => {
		const ld = musicGroupJsonLd('https://missymidwest.com');
		expect(ld['@type']).toBe('MusicGroup');
		expect(ld.name).toBe('Missy Midwest');
		expect(ld.url).toBe('https://missymidwest.com');
		expect(ld.image).toBe('https://missymidwest.com/landing/missy-fan-crop.webp');
		expect(ld.sameAs).toContain('https://www.instagram.com/missy.midwest/');
		expect(ld.sameAs.length).toBeGreaterThanOrEqual(5);
	});
});
