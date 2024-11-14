import { createDirectus, rest, type DirectusClient, type FetchInterface, type RestClient } from '@directus/sdk';

import type { Collections } from '$lib/models';
import { getApiUrl } from '$lib/utils';

export function sdk(fetch: FetchInterface): DirectusClient<Collections> & RestClient<Collections> {
	return createDirectus<Collections>(getApiUrl(), { globals: { fetch } }).with(rest());
}
