import flowbitePlugin from 'flowbite/plugin';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [flowbitePlugin]
};
