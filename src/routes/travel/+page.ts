import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { SDK } from '$lib/sdk';
import { BlogPostStatus, type BlogPostEntry } from '$lib/sdk/types';

export const load: PageLoad = async () => {
	const response = await SDK.items('resaundtill').readByQuery({
		limit: -1,
		filter: { status: BlogPostStatus.public, date: { _gt: new Date() } },
		sort: ['date'],
		//@ts-ignore
		fields: '*.*'
	});

	if (!response.data) throw error(500);

	const posts: BlogPostEntry[] = response.data;

	return { posts };
};