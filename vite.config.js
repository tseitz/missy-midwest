import { sveltekit } from '@sveltejs/kit/vite';
import viteImagemin from 'vite-plugin-imagemin';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), viteImagemin()],
	kit: {
		optimizeDeps: {
			include: ['lodash.get', 'lodash.isequal', 'lodash.clonedeep']
		}
	}
};

export default config;
