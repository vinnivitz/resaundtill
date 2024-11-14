import { waitLocale } from 'svelte-i18n';

import type { LayoutLoad } from './$types';
import { initDataStores } from '$lib/stores';

export const load: LayoutLoad = async ({ fetch }) => {
	await waitLocale();
	initDataStores(fetch);
};
