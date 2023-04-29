import { error } from '@sveltejs/kit';
import { SDK } from '$lib/sdk';
import type { PageLoad } from '../$types';

export const load: PageLoad = async () => {
	const response = await SDK.files.readByQuery();

	if (!response.data) throw error(500);

	const files = response.data;

	return { files };
};
