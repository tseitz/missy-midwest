// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';

import preprocess from 'svelte-preprocess';

import netlify from '@sveltejs/adapter-netlify';

/** @type {import('vite').UserConfig} */
const config = {
    plugins: [sveltekit()],

    preprocess: preprocess({}),

    kit: {
      adapter: netlify(),

      prerender: {
        enabled: true
      },
    },

    build: {
      target: 'es2019',
      minify: 'esbuild'
    }
};

export default config;
