import { Locale } from '$lib/models/user.model';
import { getLocale } from './get-locale.util';

export function getTranslationIdx(value: string | null | undefined): number {
	return getLocale(value) === Locale.de ? 0 : 1;
}
