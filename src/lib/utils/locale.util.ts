import { Locale, type Translations } from '$lib/models';

import { browser } from '$app/environment';

/**
 * Returns the locale in `Locale` format
 * @param value  locale code
 * @returns {Locale} The locale
 */
export function getLocale(value: string | null | undefined): Locale {
	return value === 'en' || value === 'en-US' ? Locale.EN : Locale.DE;
}

export function getTranslation<T = Translations>(
	translations: Translations[] | undefined,
	locale: string | null | undefined
): T | undefined {
	if (!translations) return;
	return (
		(translations.find((translation) => translation.languages_code === getLocaleCode(locale)) as T) ??
		(translations.find((translation) => ['de-DE', 'en-US'].includes(translation.languages_code)) as T)
	);
}
/**
 * Determines the current locale and saves it to local storage
 * @returns The current locale
 */
export function determineLocale(): Locale {
	const locale = browser
		? getLocale(localStorage.getItem('locale')) || getLocale(globalThis.navigator.language) || Locale.DE
		: Locale.DE;
	if (browser) {
		localStorage.setItem('locale', locale);
	}
	return locale;
}

/**
 * Returns the locale in `string` format as locale code
 * @param value locale code
 * @returns {string} The locale code
 */
function getLocaleCode(value: string | null | undefined): string {
	return getLocale(value) === Locale.DE ? 'de-DE' : 'en-US';
}
