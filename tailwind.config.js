/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: 'class',
	content: ['./src/**/*.{html,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			padding: {
				'p-18': '4.5rem'
			}
		}
	},
	plugins: [require('flowbite/plugin'), require('tailwind-scrollbar-hide')]
};

export default config;
