import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import viteImagemin from 'vite-plugin-imagemin';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const isTest = !!process.env.VITEST;

export default defineConfig({
	// imagemin + devtools-json are build/dev-only and crash under Vitest on some Node versions
	plugins: isTest
		? [tailwindcss(), sveltekit()]
		: [tailwindcss(), sveltekit(), devtoolsJson(), viteImagemin()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./vitest.setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined
});
