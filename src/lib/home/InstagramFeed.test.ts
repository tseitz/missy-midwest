import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import InstagramFeed from './InstagramFeed.svelte';
import type { InstagramPost } from './instagram';

const post = (overrides: Partial<InstagramPost> = {}): InstagramPost => ({
	id: 'p1',
	permalink: 'https://www.instagram.com/reel/DY7uK1Rk6BU/',
	imageUrl: 'https://scontent.cdninstagram.com/large-1.jpg',
	caption: 'like hello???',
	isVideo: true,
	...overrides
});

describe('InstagramFeed', () => {
	it('renders the placeholder grid when there are no posts', () => {
		const { container } = render(InstagramFeed, { props: { posts: [] } });
		expect(container.querySelectorAll('[data-testid="ig-placeholder"]')).toHaveLength(6);
		expect(container.querySelectorAll('[data-testid="ig-post"]')).toHaveLength(0);
		expect(container.querySelector('img')).toBeNull();
	});

	it('opens each post on Instagram in a new tab', () => {
		const posts = [
			post({ id: 'a', permalink: 'https://www.instagram.com/reel/a/' }),
			post({ id: 'b', permalink: 'https://www.instagram.com/reel/b/' })
		];
		const { container } = render(InstagramFeed, { props: { posts } });

		const tiles = container.querySelectorAll<HTMLAnchorElement>('[data-testid="ig-post"]');
		expect(tiles).toHaveLength(2);
		expect(tiles[0].href).toBe('https://www.instagram.com/reel/a/');
		expect(tiles[0].getAttribute('target')).toBe('_blank');
		// Security: new-tab links must not leak the opener.
		expect(tiles[0].getAttribute('rel')).toContain('noopener');

		const img = tiles[0].querySelector('img');
		expect(img?.getAttribute('src')).toBe('https://scontent.cdninstagram.com/large-1.jpg');
		expect(img?.getAttribute('loading')).toBe('lazy');
		expect(container.querySelectorAll('[data-testid="ig-placeholder"]')).toHaveLength(0);
	});

	it('gives each tile an accessible label from the caption', () => {
		const { container } = render(InstagramFeed, {
			props: { posts: [post({ caption: 'big drop' })] }
		});
		const tile = container.querySelector('[data-testid="ig-post"]');
		expect(tile?.getAttribute('aria-label')).toBe('View Instagram post: big drop');
	});
});
