import type { ID } from '@directus/sdk';
import { getURL } from './get-url.util';

/**
 * Compose the static URL to an image
 * @param id  The ID of the Directus image
 * @returns {string} The composed static URL to the image
 */
export const imageUrlBuilder = (id: ID): string => `${getURL()}/assets/${id}`;
