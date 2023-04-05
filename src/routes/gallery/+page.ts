import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { SDK } from '$lib/sdk';

export const load: PageLoad = async () => {
	const response = await SDK.files.readByQuery();

	if (!response.data) throw error(500);

	const files = response.data;

	return { files };
};
