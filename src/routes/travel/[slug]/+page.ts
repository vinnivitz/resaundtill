import type { PageLoad } from './$types';

import { SDK } from '$lib/sdk';
import { error } from '@sveltejs/kit';
import { BlogPostStatus } from '$lib/sdk/types';

export const load: PageLoad = async ({ params }) => {
	const response = await SDK.items('resaundtill').readByQuery({
		limit: 1,
		// @ts-ignore
		fields: '*.*.*',
		filter: { id: params.slug, status: BlogPostStatus.public }
	});


	if (!response.data) throw error(500);

	const post = response.data[0];

	if (!post) throw error(404);

	console.log('post', post);

	return { post };
};
