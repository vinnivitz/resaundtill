import type { FormatDateOptions } from '$lib/models';
import { getLocaleCode } from './locale.util';

/**
 * Format a date to a formatted string depending on the locale
 * @param date date to format
 * @param locale locale code
 * @param options options to format the date
 * @returns {string} The formatted date
 */
export const formatDate = (
	date: Date,
	locale: string | null | undefined,
	options: FormatDateOptions = { w: true, d: true, m: true, y: true }
) => {
	return `${options.w ? date.toLocaleString(getLocaleCode(locale), { weekday: 'long' }) : ''}, ${
		options.d ? (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) : ''
	}.${options.m ? date.toLocaleString(getLocaleCode(locale), { month: 'long' }) : ''}.${
		options.y ? date.getFullYear() : ''
	}`;
};
