import type { Collections } from '$lib/models';
import { getApiUrl } from '$lib/utils';
import { createDirectus, rest } from '@directus/sdk';

export default createDirectus<Collections>(getApiUrl()).with(rest());
