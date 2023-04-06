import { browser } from '$app/environment';
import { init, register } from 'svelte-i18n';

const defaultLocale = 'de';

register('en', () => import('.//en.json'));
register('de', () => import('.//de.json'));

init({
	fallbackLocale: defaultLocale,
	initialLocale: browser ? window.navigator.language : defaultLocale
});
