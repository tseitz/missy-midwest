import preprocess from 'svelte-preprocess';

import netlify from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [preprocess({})],

	kit: {
		adapter: netlify(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',

		trailingSlash: 'never',

		vite: {
			build: {
				target: 'es2019'
			}
		}
	}
};

export default config;
