import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

/**
 * Get the URL of the Directus API depending on the environment
 * @returns {string} The URL of the Directus API
 */
export const getURL = (): string => {
	if (env.PUBLIC_SERVER === 'true') {
		return browser ? env.PUBLIC_EXTERNAL_DIRECTUS_API_URL : env.PUBLIC_INTERNAL_DIRECTUS_API_URL;
	} else {
		return env.PUBLIC_EXTERNAL_DIRECTUS_API_URL;
	}
};
