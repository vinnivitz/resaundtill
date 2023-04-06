/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: 'class',
	content: ['./src/**/*.{html,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [require('flowbite/plugin')],
	darkMode: 'class'
};

export default config;
