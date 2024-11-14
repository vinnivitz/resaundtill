import { waitLocale } from 'svelte-i18n';

import { initDataStores } from '$lib/stores';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	await waitLocale();
	initDataStores(fetch);
};
