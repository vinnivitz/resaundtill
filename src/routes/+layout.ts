import { error } from '@sveltejs/kit';
import SDK from '$lib/sdk';
import { waitLocale } from 'svelte-i18n';
import { readItems, readSingleton } from '@directus/sdk';
import {
	type BlogPostEntry,
	type DirectusImage,
	type Departure,
	type SupportInfoEntry,
	type GalleryShufflePercentage,
	type CountryEntry
} from '$lib/models';
import { countryStore } from '$lib/stores';
import type { LayoutLoad } from './$types';
import { dataStore } from '$lib/stores/data.store';

export const load: LayoutLoad = async () => {
	await waitLocale();
	dataStore.init();
	// const $postsResult = SDK.request<BlogPostEntry[]>(
	// 	readItems('resaundtill_posts', {
	// 		limit: -1,
	// 		sort: ['date'],
	// 		fields: ['id', 'status', 'date', 'isFlight', 'translations.*', 'images.*.*', 'location', 'countryCode']
	// 	})
	// );
	// const $countryResult = SDK.request<CountryEntry[]>(
	// 	readItems('resaundtill_countries', {
	// 		fields: ['id', 'code', 'translations.*', 'population', 'area', 'capital', 'currency', 'thumbnail']
	// 	})
	// );
	// const $departureResult = SDK.request<Departure>(readSingleton('resaundtill_departure', { fields: ['date'] }));
	// const $supportInfoResult = SDK.request<SupportInfoEntry>(
	// 	// @ts-expect-error - Directus SDK typings are incorrect
	// 	readSingleton('resaundtill_support', { fields: ['id', 'translations.*'] })
	// );
	// const $galleryShufflePercentageResult = SDK.request<GalleryShufflePercentage>(
	// 	readSingleton('resaundtill_gallery_shuffle_percentage')
	// );

	// const [postsResult, countryResult, departureResult, supportInfoResult, galleryShufflePercentageResult] =
	// 	await Promise.all([
	// 		$postsResult,
	// 		$countryResult,
	// 		$departureResult,
	// 		$supportInfoResult,
	// 		$galleryShufflePercentageResult
	// 	]);

	// if (!postsResult || !countryResult || !departureResult || !supportInfoResult || !galleryShufflePercentageResult) {
	// 	throw error(500, 'Could not load data. Please try again later.');
	// }

	// const files: BlogPostImage[] = [];
	// const blogPostThumbnailMap = new Map<string, BlogPostImage>();
	// const countries = new Map<string, CountryEntry>();

	// for (const post of postsResult) {
	// 	if (post.images) {
	// 		files.push(...post.images);
	// 		blogPostThumbnailMap.set(post.id, post.images[0]);
	// 	}
	// 	if (post.location && !post.countryCode) {
	// 		const countryCode = post.countryCode ?? (await countryStore.getCountryCode(post.location.coordinates));
	// 		if (countryCode) {
	// 			post.countryCode = countryCode;
	// 			if (!countries.has(countryCode)) {
	// 				const country = countryResult.find((country) => country.code === post.countryCode);
	// 				if (country) {
	// 					countries.set(post.countryCode, country);
	// 				}
	// 			}
	// 		}
	// 	}
	// }
	// return {
	// 	posts: postsResult,
	// 	countries,
	// 	departure: new Date(departureResult.date),
	// 	supportInfo: supportInfoResult,
	// 	galleryShufflePercentage: galleryShufflePercentageResult.value,
	// 	blogPostThumbnailMap,
	// 	files
	// };
};
