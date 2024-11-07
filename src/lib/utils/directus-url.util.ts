import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { DirectusImageTransformation } from '$lib/models';

/**
 * Get the URL of the Directus API depending on the environment
 * @returns {string} The URL of the Directus API
 */
export function getApiUrl(): string {
	return env.PUBLIC_SERVER === 'true'
		? browser
			? env.PUBLIC_EXTERNAL_DIRECTUS_API_URL
			: env.PUBLIC_INTERNAL_DIRECTUS_API_URL
		: env.PUBLIC_EXTERNAL_DIRECTUS_API_URL;
}

export function getHostUrl(): string {
	return env.PUBLIC_SERVER === 'true' ? env.PUBLIC_EXTERNAL_HOST_URL : env.PUBLIC_INTERNAL_HOST_URL;
}

/**
 * Compose the static URL to an image
 * @param id  The id of the Directus image
 * @param asThumbnail  Whether to return the thumbnail version of the image
 * @returns {string} The composed static URL to the image
 */
export function imageUrlBuilder(id: string, transformation = DirectusImageTransformation.DEFAULT): string {
	return `${getApiUrl()}/assets/${id}?key=resaundtill-${
		transformation === DirectusImageTransformation.THUMBNAIL
			? 'thumbnail'
			: transformation === DirectusImageTransformation.PREVIEW
				? 'preview'
				: 'webp'
	}`;
}
