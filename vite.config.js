import { sentrySvelteKit } from '@sentry/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import viteImagemin from 'vite-plugin-imagemin';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const isTest = !!process.env.VITEST;

// Upload source maps to Sentry only when an auth token is present (set in
// Netlify's env). Without it the plugin is a harmless no-op, so local builds
// and PR previews never fail for missing credentials.
const sentryPlugins =
	!isTest && process.env.SENTRY_AUTH_TOKEN
		? [
				sentrySvelteKit({
					sourceMapsUploadOptions: {
						org: process.env.SENTRY_ORG,
						project: process.env.SENTRY_PROJECT,
						authToken: process.env.SENTRY_AUTH_TOKEN
					}
				})
			]
		: [];

export default defineConfig({
	// imagemin + devtools-json are build/dev-only and crash under Vitest on some Node versions
	plugins: isTest
		? [tailwindcss(), sveltekit()]
		: [...sentryPlugins, tailwindcss(), sveltekit(), devtoolsJson(), viteImagemin()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./vitest.setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined
});
