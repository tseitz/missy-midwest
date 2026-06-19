import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-netlify';

const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			$lib: 'src/lib'
		},
		// Poll for new deploys so the client can tell when its cached, hashed
		// chunks have gone stale. When a newer build is detected, `updated.current`
		// ($app/state) flips to true and the root layout upgrades the next
		// navigation to a full-page load — so a tab left open across a deploy never
		// tries to import a chunk filename that no longer exists. 5 min is plenty
		// for a low-traffic site and keeps the version.json polling negligible.
		version: {
			pollInterval: 300_000
		}
	}
};

export default config;
