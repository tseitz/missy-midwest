import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import SoundCloudFeed from './SoundCloudFeed.svelte';

describe('SoundCloudFeed', () => {
	it('embeds the artist profile so new uploads appear automatically', () => {
		const { container } = render(SoundCloudFeed);
		const iframe = container.querySelector('iframe');
		expect(iframe).not.toBeNull();
		// The widget points at the user profile (not a single track id)
		expect(decodeURIComponent(iframe!.getAttribute('src') || '')).toContain(
			'soundcloud.com/missymidwest'
		);
	});
});
