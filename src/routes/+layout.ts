import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import SDK from '$lib/sdk';
import { waitLocale } from 'svelte-i18n';
import { readItems, readSingleton } from '@directus/sdk';
import {
	type BlogPostEntry,
	type BlogPostImage,
	type Departure,
	type SupportInfoEntry,
	type GalleryShufflePercentage
} from '$lib/models';

export const load: LayoutLoad = async () => {
	await waitLocale();

	const postsResult = await SDK.request<BlogPostEntry[]>(
		readItems('resaundtill_posts', {
			limit: -1,
			sort: ['date'],
			fields: ['id', 'status', 'date', 'isFlight', 'translations.*', 'images.*.*', 'location']
		})
	);

	const departureResult = await SDK.request<Departure>(readSingleton('resaundtill_departure'));
	const supportInfoResult = await SDK.request<SupportInfoEntry>(
		// @ts-expect-error - Directus SDK typings are incorrect
		readSingleton('resaundtill_support', { fields: ['id', 'translations.*'] })
	);
	const galleryShufflePercentageResult = await SDK.request<GalleryShufflePercentage>(
		readSingleton('resaundtill_gallery_shuffle_percentage')
	);

	if (!postsResult || !departureResult || !supportInfoResult || !galleryShufflePercentageResult) {
		throw error(500, 'Could not load data. Please try again later.');
	}

	const files = [];
	const blogPostThumbnailMap = new Map<string, BlogPostImage>();

	for (const post of postsResult) {
		if (post.images) {
			files.push(...post.images);
			blogPostThumbnailMap.set(post.id, post.images[0]);
		}
	}

	return {
		posts: postsResult,
		departure: new Date(departureResult.date),
		supportInfo: supportInfoResult,
		galleryShufflePercentage: galleryShufflePercentageResult.value,
		blogPostThumbnailMap,
		files
	};
};
