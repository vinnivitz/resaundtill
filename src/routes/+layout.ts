import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import { SDK, auth } from '$lib/sdk';
import { BlogPostStatus, type BlogPostEntry } from '$lib/sdk/types';
import { waitLocale } from 'svelte-i18n';
import type { ID } from '@directus/sdk';

export const load: LayoutLoad = async () => {
	await waitLocale();

	await auth();

	const postsResult = await SDK.items('resaundtill_posts').readByQuery({
		limit: -1,
		filter: { status: BlogPostStatus.public },
		sort: ['date'],
		fields: '*.*.*'
	});

	const files = [];
	for (const post of postsResult.data as BlogPostEntry[]) {
		if (post.images) {
			files.push(...post.images);
		}
	}

	const departureResult = new Date((await SDK.singleton('resaundtill_departure').read())!.date);

	const supportInfoResponse = await SDK.singleton('resaundtill_support').read({ fields: '*.*' });

	if (!postsResult.data || !departureResult || !supportInfoResponse)
		throw error(500, 'Could not load data. Please try again later.');

	return {
		posts: postsResult.data as BlogPostEntry[],
		departure: departureResult,
		files,
		supportInfo: supportInfoResponse
	};
};
