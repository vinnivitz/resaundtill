import { browser } from '$app/environment';
import { Locale, type Translations } from '$lib/models';

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

export function getTranslation<T = Translations>(
	translations: Translations[],
	locale: string | null | undefined
): T | undefined {
	return translations.find((translation) => translation.languages_code === getLocaleCode(locale)) as T;
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
