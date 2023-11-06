import type { ID } from '@directus/sdk';
import { getURL } from './get-url.util';

/**
 * Compose the static URL to an image
 * @param id  The ID of the Directus image
 * @param asThumbnail  Whether to return the thumbnail version of the image
 * @returns {string | null} The composed static URL to the image or `null` if no ID was provided
 */
export const imageUrlBuilder = (id: ID, asThumbnail = false): string | null =>
	id ? `${getURL()}/assets/${id}?key=resaundtill-${asThumbnail ? 'thumbnail' : 'webp'}` : null;
