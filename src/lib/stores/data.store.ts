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
	type ImageDetails
} from '$lib/models';
import { sdk } from '$lib/sdk';

import { alertStore, geoJsonStore } from './';

export const postsStore = writable<BlogPostEntry[] | undefined>();
export const postToImagesStore = writable<Map<string, ImageDetails[]> | undefined>();
export const imagesStore = writable<ImageDetails[] | undefined>();
export const countriesStore = writable<CountryEntry[] | undefined>();
export const supportInfoStore = writable<SupportInfoEntry | undefined>();
export const galleryShufflePercentageStore = writable<number | undefined>();
export const currentCoordinatesStore = writable<Position | undefined>();
export const mapItemsStore = writable<MapItem[] | undefined>();
export const countryToPostsStore = writable<Map<string, string[]> | undefined>();
export const postToCountryStore = writable<Map<string, string> | undefined>();

const $t = unwrapFunctionStore(_);
let initialized = false;

async function initDataStores(fetch: FetchInterface): Promise<void> {
	if (initialized) return;
	initialized = true;

	async function getPosts(): Promise<void> {
		const posts = await sdk(fetch).request<BlogPostEntry[]>(
			readItems('resaundtill_posts', {
				limit: -1,
				sort: ['-date'],
				fields: ['id', 'date', 'location', 'translations.*']
			})
		);
		postsStore.set(posts);
	}

	async function getImages(): Promise<void> {
		const posts = await sdk(fetch).request<BlogPostEntry<DirectusImageDetails>[]>(
			readItems('resaundtill_posts', { limit: -1, fields: ['id', 'date', 'images.*.*'] })
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
		imagesStore.set(
			[...postToImages.values()].flat().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		);
	}

	async function getCountries(): Promise<void> {
		const countries = await sdk(fetch).request<CountryEntry[]>(
			readItems('resaundtill_countries', {
				fields: ['id', 'code', 'translations.*', 'population', 'area', 'capital', 'currency', 'thumbnail']
			})
		);
		countriesStore.set(countries);
	}

	async function getSupportInfo(): Promise<void> {
		const supportInfo = await sdk(fetch).request<SupportInfoEntry>(
			// @ts-expect-error - Directus SDK typings are incorrect
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

	async function currentCoordinates(): Promise<void> {
		const post = await sdk(fetch).request<BlogPostEntry[]>(
			readItems('resaundtill_posts', {
				limit: 1,
				sort: ['-date'],
				fields: ['location']
			})
		);
		currentCoordinatesStore.set(post[0]?.location?.coordinates || undefined);
	}

	async function mapItems(): Promise<void> {
		const posts = await sdk(fetch).request<BlogPostEntry[]>(
			readItems('resaundtill_posts', {
				limit: -1,
				sort: ['date'],
				fields: ['id', 'location', 'isFlight', 'translations.*', 'date']
			})
		);
		mapItemsStore.set(posts.filter((post) => post.location) as MapItem[]);
	}

	async function countryPostRelations(): Promise<void> {
		const posts = await sdk(fetch).request<BlogPostEntry[]>(
			readItems('resaundtill_posts', {
				limit: -1,
				sort: ['date'],
				fields: ['id', 'countryCode', 'location']
			})
		);
		const countryToPosts = new Map<string, string[]>();
		await Promise.all(
			posts.map(async (post) => {
				if (post.location) {
					post.countryCode = post.countryCode ?? (await geoJsonStore.getCountryCode(post.location.coordinates));
					if (post.countryCode) {
						const postsForCountry = countryToPosts.get(post.countryCode) ?? [];
						postsForCountry.push(post.id);
						countryToPosts.set(post.countryCode, postsForCountry);
					}
				}
			})
		);
		countryToPostsStore.set(countryToPosts);

		const postToCountry = new Map<string, string>();
		for (const [countryCode, postIds] of countryToPosts.entries()) {
			for (const postId of postIds) {
				postToCountry.set(postId, countryCode);
			}
		}
		postToCountryStore.set(postToCountry);
	}

	try {
		await Promise.all([
			currentCoordinates(),
			getPosts(),
			getImages(),
			getCountries(),
			getSupportInfo(),
			getGalleryShufflePercentage(),
			mapItems(),
			countryPostRelations()
		]);
	} catch (error) {
		console.error(error);
		alertStore.setAlert($t('common.api.fetch-failed'));
	}
}

export { initDataStores };
