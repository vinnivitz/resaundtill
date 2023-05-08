import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import { SDK, auth } from '$lib/sdk';
import { BlogPostStatus } from '$lib/sdk/types';
import { locale, waitLocale } from 'svelte-i18n';
import { browser } from '$app/environment';

export const load: LayoutLoad = async () => {
	if (browser) {
		locale.set(window.navigator.language);
	}

	await waitLocale();

	await auth();

	const postsResult = await SDK.items('posts').readByQuery({
		limit: -1,
		filter: { status: BlogPostStatus.public },
		sort: ['date'],
		//@ts-ignore
		fields: '*.*'
	});

	const departureResult = new Date((await SDK.singleton('departure').read())!.date);

	const filesResponse = await SDK.files.readByQuery();

	const supportInfoResponse = await SDK.singleton('support').read();

	if (!postsResult.data || !departureResult || !filesResponse.data || !supportInfoResponse)
		throw error(500, 'Could not load data. Please try again later.');

	return {
		posts: postsResult.data,
		departure: departureResult,
		files: filesResponse.data,
		supportInfo: supportInfoResponse
	};
};
