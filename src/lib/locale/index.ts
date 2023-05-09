import { browser } from '$app/environment';
import { Locale } from '$lib/models/user.model';
import { init, register } from 'svelte-i18n';

const defaultLocale = Locale.de;

register('en', () => import('.//en.json'));
register('de', () => import('.//de.json'));

init({
	fallbackLocale: defaultLocale,
	initialLocale: browser ? window.navigator.language : defaultLocale
});
