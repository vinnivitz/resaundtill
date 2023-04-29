import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { SDK } from '$lib/sdk';
import { BlogPostStatus, type BlogPostEntry } from '$lib/sdk/types';

export const load: PageLoad = async () => {
	const response = await SDK.items('resaundtill').readByQuery({
		limit: -1,
		filter: { status: BlogPostStatus.public },
		sort: ['date'],
		//@ts-ignore
		fields: '*.*'
	});

	if (!response.data) throw error(500);

	const posts = response.data;

	return { posts };
};
