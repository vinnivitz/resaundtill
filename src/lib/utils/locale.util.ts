import { browser } from '$app/environment';
import { Locale } from '$lib/models';

/**
 * Returns the locale in `Locale` format
 * @param value  locale code
 * @returns {Locale} The locale
 */
export function getLocale(value: string | null | undefined): Locale {
	return value === 'en' || value === 'en-US' ? Locale.EN : Locale.DE;
}

/**
 * Returns the locale in `string` format as locale code
 * @param value locale code
 * @returns {string} The locale code
 */
export function getLocaleCode(value: string | null | undefined): string {
	return getLocale(value) === Locale.DE ? 'de-DE' : 'en-US';
}

/**
 * Returns the array index of the directus translation depnding on the locale
 * @param value locale code
 * @returns {number} The array index of the directus translation
 */
export function getTranslationIdx(value: string | null | undefined): number {
	return getLocale(value) === Locale.DE ? 0 : 1;
}

/**
 * Determines the current locale and saves it to local storage
 * @returns The current locale
 */
export function determineLocale(): Locale {
	const locale = browser
		? getLocale(localStorage.getItem('locale')) || getLocale(window.navigator.language) || Locale.DE
		: Locale.DE;
	if (browser) {
		localStorage.setItem('locale', locale);
	}
	return locale;
}
