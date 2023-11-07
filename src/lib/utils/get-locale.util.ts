import { Locale } from '$lib/models/user.model';

export function getLocale(value: string | null | undefined): Locale {
	return value === ('en' || 'en-US') ? Locale.en : Locale.de;
}

export function getLocaleCode(value: string | null | undefined): string {
	return getLocale(value) === Locale.de ? 'de-DE' : 'en-US';
}
