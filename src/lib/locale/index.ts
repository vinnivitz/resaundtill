import { init, register } from 'svelte-i18n';

import { Locale } from '$lib/models';
import { determineLocale } from '$lib/utils';

const defaultLocale = Locale.DE;

register('de', () => import('.//de.json'));
register('en', () => import('.//en.json'));

init({
	fallbackLocale: defaultLocale,
	initialLocale: determineLocale()
});
