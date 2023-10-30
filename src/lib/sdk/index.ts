import { env } from '$env/dynamic/public';
import { Directus } from '@directus/sdk';
import type { CustomDirectusTypes } from './types';
import { error } from '@sveltejs/kit';

const endpoint = env.PUBLIC_DIRECTUS_API_URL;

export const SDK = new Directus<CustomDirectusTypes>(endpoint!);

export const auth = async () => {
	try {
		await SDK.auth.static(env.PUBLIC_DIRECTUS_API_TOKEN!);
	} catch (err) {
		throw error(500, 'Authentication to Data Server failed. Please try again later.');
	}
};
