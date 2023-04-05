import { env } from '$env/dynamic/public'
import { Directus } from '@directus/sdk'
import type { CustomDirectusTypes } from './types';

const endpoint = env.PUBLIC_DIRECTUS_API_URL;

export const SDK = new Directus<CustomDirectusTypes>(endpoint);