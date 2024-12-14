import { readItems, readSingleton, type FetchInterface } from '@directus/sdk';
import type { Position } from 'geojson';
import { writable } from 'svelte/store';
import { _, unwrapFunctionStore } from 'svelte-i18n';

import {
	type BlogPostEntry,
	type SupportInfoEntry,
	type GalleryShufflePercentage,
	type CountryEntry,
	type MapItem,
	type DirectusImageDetails,
	type ImageDetails,
	type CountryPost
} from '$lib/models';
import { sdk } from '$lib/sdk';

import { alertStore, geoJsonStore } from '.';

export const postsStore = writable<BlogPostEntry[] | undefined>();
export const postToImagesStore = writable<Map<string, ImageDetails[]> | undefined>();
export const imagesStore = writable<ImageDetails[] | undefined>();
export const countriesStore = writable<CountryEntry[] | undefined>();
export const supportInfoStore = writable<SupportInfoEntry | undefined>();
export const galleryShufflePercentageStore = writable<number | undefined>();
export const currentCoordinatesStore = writable<Position | undefined>();
export const mapItemsStore = writable<MapItem[] | undefined>();
export const countryToPostsStore = writable<Map<string, CountryPost[]> | undefined>();
export const postToCountryStore = writable<Map<string, string> | undefined>();

const $t = unwrapFunctionStore(_);
let initialized = false;

export async function initApiStores(fetch: FetchInterface): Promise<void> {
	if (initialized) return;
	initialized = true;

	async function fetchPosts(): Promise<void> {
		let posts = await sdk(fetch).request<BlogPostEntry[]>(
			readItems('resaundtill_posts', {
				limit: -1,
				sort: ['date'],
				fields: ['id', 'date', 'location', 'isFlight', 'countryCode', 'translations.*']
			})
		);
		posts = posts.map((post, index) => {
			const previousPost = posts[index - 1];
			const nextPost = posts[index + 1];
			return {
				...post,
				previousPostId: previousPost?.id,
				nextPostId: nextPost?.id
			};
		});
		postsStore.set(posts.toReversed());
		currentCoordinatesStore.set(posts[0]?.location?.coordinates);
		const postIdToLocationMap = new Map(posts.map((post) => [post.id, post.location]));
		mapItemsStore.set(
			posts
				.filter((post) => post.location)
				.map((post) => ({
					id: post.id,
					date: post.date,
					location: post.location!,
					isFlight: post.isFlight,
					translations: post.translations,
					previousLocation: post.previousPostId ? postIdToLocationMap.get(post.previousPostId) : undefined,
					nextLocation: post.nextPostId ? postIdToLocationMap.get(post.nextPostId) : undefined
				}))
		);
		await setCountryPostRelations(posts);
	}

	async function getImages(): Promise<void> {
		const posts = await sdk(fetch).request<BlogPostEntry<DirectusImageDetails>[]>(
			readItems('resaundtill_posts', { limit: -1, sort: '-date', fields: ['id', 'images.*.*'] })
		);
		const postToImages = new Map<string, ImageDetails[]>();
		for (const post of posts) {
			if (post.images) {
				postToImages.set(
					post.id,
					post.images.map((image) => ({ ...image.directus_files_id, postId: post.id, date: post.date }))
				);
			}
		}
		postToImagesStore.set(postToImages);
		imagesStore.set([...postToImages.values()].flat());
	}

	async function getCountries(): Promise<void> {
		const countries = await sdk(fetch).request<CountryEntry[]>(
			readItems('resaundtill_countries', {
				fields: ['id', 'index', 'code', 'translations.*', 'population', 'area', 'capital', 'currency', 'thumbnail']
			})
		);
		countriesStore.set(countries.sort((a, b) => a.index - b.index));
	}

	async function getSupportInfo(): Promise<void> {
		const supportInfo = await sdk(fetch).request<SupportInfoEntry>(
			// @ts-expect-error - translations with wildcard is not recognized correctly
			readSingleton('resaundtill_support', { fields: ['id', 'translations.*'] })
		);
		supportInfoStore.set(supportInfo);
	}

	async function getGalleryShufflePercentage(): Promise<void> {
		const galleryShufflePercentage = await sdk(fetch).request<GalleryShufflePercentage>(
			readSingleton('resaundtill_gallery_shuffle_percentage')
		);
		galleryShufflePercentageStore.set(galleryShufflePercentage.value);
	}

	async function setCountryPostRelations(posts: BlogPostEntry[]): Promise<void> {
		const countryToPosts = new Map<string, CountryPost[]>();
		await Promise.all(
			posts.map(async (post) => {
				post.countryCode =
					post.countryCode ??
					(post.location ? await geoJsonStore.getCountryCode(post.location.coordinates) : undefined);
				if (post.countryCode) {
					const postsForCountry = countryToPosts.get(post.countryCode) ?? [];
					postsForCountry.push({ id: post.id, previousPostId: post.previousPostId, nextPostId: post.nextPostId });
					countryToPosts.set(post.countryCode, postsForCountry);
				}
			})
		);
		countryToPostsStore.set(countryToPosts);

		const postToCountry = new Map<string, string>();
		for (const [countryCode, countryPosts] of countryToPosts.entries()) {
			for (const countryPost of countryPosts) {
				postToCountry.set(countryPost.id, countryCode);
			}
		}
		postToCountryStore.set(postToCountry);
	}

	try {
		await Promise.all([fetchPosts(), getImages(), getCountries(), getSupportInfo(), getGalleryShufflePercentage()]);
	} catch (error) {
		console.error(error);
		alertStore.setAlert($t('common.api.fetch-failed'));
	}
}
