import { createDirectus, rest, type FetchInterface } from '@directus/sdk';

import type { Collections } from '$lib/models';
import { getApiUrl } from '$lib/utils';

export const sdk = (fetch: FetchInterface) => createDirectus<Collections>(getApiUrl(), { globals: { fetch } }).with(rest());
