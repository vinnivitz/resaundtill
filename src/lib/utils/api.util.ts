import { DirectusImageTransformation } from '$lib/models';

import { browser } from '$app/environment';

import { env } from '$env/dynamic/public';

/**
 * Get the URL of the Directus API depending on the environment
 * @returns {string} The URL of the Directus API
 */
export function getApiUrl(): string {
	if (env.PUBLIC_SERVER === 'true') {
		return browser ? env.PUBLIC_EXTERNAL_DIRECTUS_API_URL : env.PUBLIC_INTERNAL_DIRECTUS_API_URL;
	}
	return env.PUBLIC_EXTERNAL_DIRECTUS_API_URL;
}

export function getHostUrl(): string {
	if (env.PUBLIC_SERVER === 'true') {
		return browser ? env.PUBLIC_EXTERNAL_HOST_URL : env.PUBLIC_INTERNAL_HOST_URL;
	}
	return env.PUBLIC_INTERNAL_HOST_URL;
}

/**
 * Compose the static URL to an image
 * @param id  The id of the Directus image
 * @param asThumbnail  Whether to return the thumbnail version of the image
 * @returns {string} The composed static URL to the image
 */

export function imageUrlBuilder(
	id?: string,
	transformation: DirectusImageTransformation = DirectusImageTransformation.DEFAULT,
	fallback = 'images/gallery/travel.jpg'
): string {
	if (!id) {
		return `${getHostUrl()}/${fallback}`;
	}
	const key = DirectusImageTransformation.DEFAULT === transformation ? '' : `?key=resaundtill-${transformation}`;
	return `${getApiUrl()}/assets/${id}${key}`;
}
