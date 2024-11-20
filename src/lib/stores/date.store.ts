import 'dayjs/locale/en';
import 'dayjs/locale/de';

import dayjs from 'dayjs';
import { writable, type Readable } from 'svelte/store';
import { locale } from 'svelte-i18n';

import { getLocale } from '$lib/utils';

function createDateStore(): Readable<(date: Date | string | undefined, formatString?: string) => string> {
	const { subscribe, set } = writable((date: Date | string | undefined, formatString = 'DD. MMMM YYYY') =>
		dayjs(date).format(formatString)
	);

	locale.subscribe(async (newLocale) => {
		dayjs.locale(getLocale(newLocale));
		set((date, formatString = 'DD. MMMM YYYY') => dayjs(date).format(formatString));
	});

	return {
		subscribe
	};
}

export const dateStore = createDateStore();
