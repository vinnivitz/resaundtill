import { waitLocale } from 'svelte-i18n';

import { initApiStores } from '$lib/stores';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	await waitLocale();
	initApiStores(fetch);
};
