import { Locale } from '$lib/models/user.model';

/**
 * Returns the locale in `Locale` format
 * @param value  locale code
 * @returns {Locale} The locale
 */
export function getLocale(value: string | null | undefined): Locale {
	return value === 'en' || value === 'en-US' ? Locale.en : Locale.de;
}

/**
 * Returns the locale in `string` format as locale code
 * @param value locale code
 * @returns {string} The locale code
 */
export function getLocaleCode(value: string | null | undefined): string {
	return getLocale(value) === Locale.de ? 'de-DE' : 'en-US';
}

/**
 * Returns the array index of the directus translation depnding on the locale
 * @param value locale code
 * @returns {number} The array index of the directus translation
 */
export function getTranslationIdx(value: string | null | undefined): number {
	return getLocale(value) === Locale.de ? 0 : 1;
}