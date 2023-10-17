const config = {
	content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/tw-elements/dist/js/**/*.js'],

	daisyui: {
		themes: [
			{
				missy: {
					primary: '#88428c',
					secondary: '#ec4899',
					accent: '#1fb2a6',
					neutral: '#2a323c',
					'base-100': '#1d232a',
					info: '#3abff8',
					success: '#36d399',
					warning: '#fbbd23',
					error: '#f87272'
				}
			},
			'halloween'
		]
	},

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
