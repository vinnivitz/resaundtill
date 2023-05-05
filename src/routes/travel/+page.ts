import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { SDK, auth } from '$lib/sdk';
import { BlogPostStatus, type BlogPostEntry } from '$lib/sdk/types';

export const load: PageLoad = async () => {
	await auth();

	const response = await SDK.items('posts').readByQuery({
		limit: -1,
		filter: { status: BlogPostStatus.public },
		sort: ['date'],
		//@ts-ignore
		fields: '*.*'
	});

	if (!response.data) throw error(500);

	const posts = response.data as BlogPostEntry[];

	return { posts };
};
