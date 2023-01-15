const config = {
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/tw-elements/dist/js/**/*.js'],

	theme: {
		extend: {
			colors: {
				missy: {
					400: '#88428c',
					500: '#4f2449'
				}
			}
		}
	},

	plugins: [require('daisyui'), require('tw-elements/dist/plugin')]
};

module.exports = config;
