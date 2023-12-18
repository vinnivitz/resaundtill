import { browser } from '$app/environment';
import { Locale } from '$lib/models';
import type { BlogPostTranslation, SupportTranslation } from '$lib/sdk/types';

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

export function getTranslation<T = SupportTranslation | BlogPostTranslation>(
	translations: (SupportTranslation | BlogPostTranslation)[],
	locale: string | null | undefined
): T | undefined {
	const result = translations.find(
		(translation) =>
			(translation as BlogPostTranslation).languages_code.code === getLocaleCode(locale) ||
			translation.languages_code === getLocaleCode(locale)
	) as T;
	return result;
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
