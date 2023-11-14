import { Locale } from '$lib/models/user.model';
import { determineLocale } from '$lib/utils';
import { init, register } from 'svelte-i18n';

const defaultLocale = Locale.DE;

register('de', () => import('.//de.json'));
register('en', () => import('.//en.json'));

init({
	fallbackLocale: defaultLocale,
	initialLocale: determineLocale()
});
