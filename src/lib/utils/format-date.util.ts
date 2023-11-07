import { getLocaleCode } from './get-locale.util';

export type FormatDateOptions = {
	w?: boolean;
	d?: boolean;
	m?: boolean;
	y?: boolean;
};

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
