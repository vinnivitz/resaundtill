import type { Collections } from '$lib/models';
import { getURL } from '$lib/utils';
import { createDirectus, rest } from '@directus/sdk';

export default createDirectus<Collections>(getURL()).with(rest());
