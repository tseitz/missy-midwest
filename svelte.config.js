import preprocess from 'svelte-preprocess';

import netlify from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [preprocess({})],

	kit: {
		adapter: netlify(),

		trailingSlash: 'never',

		prerender: {
			default: true
		},

		vite: {
			build: {
				target: 'es2019',
				minify: 'esbuild'
			}
		}
	}
};

export default config;
