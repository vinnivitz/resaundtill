import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import { SDK, auth } from '$lib/sdk';
import { BlogPostStatus, type BlogPostEntry } from '$lib/sdk/types';
import { locale, waitLocale } from 'svelte-i18n';
import { browser } from '$app/environment';

export const load: LayoutLoad = async () => {
	if (browser) {
		locale.set(window.navigator.language);
	}

	await waitLocale();

	await auth();

	const postsResult = await SDK.items('resaundtill_posts').readByQuery({
		limit: -1,
		filter: { status: BlogPostStatus.public },
		sort: ['date'],
		fields: '*.*'
	});

	const departureResult = new Date((await SDK.singleton('resaundtill_departure').read())!.date);

	const filesResponse = await SDK.files.readByQuery();

	const supportInfoResponse = await SDK.singleton('resaundtill_support').read({ fields: '*.*'});

	if (!postsResult.data || !departureResult || !filesResponse.data || !supportInfoResponse)
		throw error(500, 'Could not load data. Please try again later.');

	return {
		posts: postsResult.data as BlogPostEntry[],
		departure: departureResult,
		files: filesResponse.data,
		supportInfo: supportInfoResponse
	};
};
