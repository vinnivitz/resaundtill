import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { DirectusImageTransformation } from '$lib/models';
import type { BlogPostImage } from '$lib/sdk/types';
import type { ID } from '@directus/sdk';

/**
 * Get the URL of the Directus API depending on the environment
 * @returns {string} The URL of the Directus API
 */
export function getURL(): string {
	return env.PUBLIC_SERVER === 'true'
		? browser
			? env.PUBLIC_EXTERNAL_DIRECTUS_API_URL!
			: env.PUBLIC_INTERNAL_DIRECTUS_API_URL!
		: env.PUBLIC_EXTERNAL_DIRECTUS_API_URL!;
}

/**
 * Compose the static URL to an image
 * @param id  The ID of the Directus image
 * @param asThumbnail  Whether to return the thumbnail version of the image
 * @returns {string | null} The composed static URL to the image or `null` if no ID was provided
 */
export function imageUrlBuilder(id: ID, transformation = DirectusImageTransformation.DEFAULT): string | null {
	return id
		? `${getURL()}/assets/${id}?key=resaundtill-${
				transformation === DirectusImageTransformation.THUMBNAIL
					? 'thumbnail'
					: transformation === DirectusImageTransformation.PREVIEW
					? 'preview'
					: 'webp'
		  }`
		: null;
}

export function getLatestImageofArray(images: BlogPostImage[]): BlogPostImage | null {
	if (images.length === 0) {
		return null;
	}
	return images.reduce((latest, current) => {
		const latestDate = new Date(current.directus_files_id.uploaded_on).getTime();
		const currentDate = new Date(latest.directus_files_id.uploaded_on).getTime();
		return currentDate > latestDate ? current : latest;
	});
}
