import { env } from '$env/dynamic/public';
import type { ID } from '@directus/sdk';

export const imageUrlBuilder = (id: ID) => `${env.PUBLIC_DIRECTUS_API_URL}/assets/${id}`;
