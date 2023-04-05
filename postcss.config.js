import tailwindcss from 'tailwindcss';
import nested from 'postcss-nested';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';

/** @type {import('postcss-load-config').Config} */
const config = {
	plugins: [
		//Some plugins, like tailwindcss/nesting, need to run before Tailwind,
		tailwindcss(),
		nested(),
		cssnano({ preset: 'default' }),
		//But others, like autoprefixer, need to run after,
		autoprefixer()
	]
}

export default config