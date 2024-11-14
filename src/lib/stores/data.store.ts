import { readItems, readSingleton, type FetchInterface } from '@directus/sdk';
import type { Position } from 'geojson';
import { writable } from 'svelte/store';

import {
	type BlogPostEntry,
	type Departure,
	type SupportInfoEntry,
	type GalleryShufflePercentage,
	type CountryEntry,
	type MapItem
} from '$lib/models';
import { sdk } from '$lib/sdk';

import { countryStore } from './';

// Define individual stores for each property
export const postsStore = writable<BlogPostEntry[] | null>(null);
export const postToImagesStore = writable<Map<string, string[]> | null>(null);
export const imagesStore = writable<string[] | null>(null);
export const countriesStore = writable<CountryEntry[] | null>(null);
export const departureStore = writable<Date | null>(null);
export const supportInfoStore = writable<SupportInfoEntry | null>(null);
export const galleryShufflePercentageStore = writable<number | null>(null);
export const currentCoordinatesStore = writable<Position | null>(null);
export const mapItemsStore = writable<MapItem[]>([]);
export const countryToPostsStore = writable<Map<string, string[]> | null>(null);
export const postToCountryStore = writable<Map<string, string> | null>(null);

let initialized = false;

async function initDataStores(fetch: FetchInterface): Promise<boolean> {
	if (initialized) return true;
	initialized = true;

	async function getPosts(): Promise<void> {
		const posts = await sdk(fetch).request<BlogPostEntry[]>(
			readItems('resaundtill_posts', {
				limit: -1,
				sort: ['-date'],
				fields: ['id', 'date', 'translations.*']
			})
		);
		postsStore.set(posts);
	}

	async function getImages(): Promise<void> {
		const posts = await sdk(fetch).request<BlogPostEntry[]>(
			readItems('resaundtill_posts', { limit: -1, fields: ['id', 'images.*'] })
		);
		const postToImages = new Map<string, string[]>();
		posts.forEach((post) => {
			if (post.images) {
				postToImages.set(
					post.id,
					post.images.map((image) => image.directus_files_id)
				);
			}
		});
		postToImagesStore.set(postToImages);
		imagesStore.set(Array.from(postToImages.values()).flat());
	}

	async function getCountries(): Promise<void> {
		const countries = await sdk(fetch).request<CountryEntry[]>(
			readItems('resaundtill_countries', {
				fields: ['id', 'code', 'translations.*', 'population', 'area', 'capital', 'currency', 'thumbnail']
			})
		);
		countriesStore.set(countries);
	}

	async function getDeparture(): Promise<void> {
		const departure = await sdk(fetch).request<Departure>(readSingleton('resaundtill_departure', { fields: ['date'] }));
		departureStore.set(new Date(departure.date));
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
		currentCoordinatesStore.set(post[0]?.location?.coordinates || null);
	}

	async function mapItems(): Promise<void> {
		const posts = await sdk(fetch).request<BlogPostEntry[]>(
			readItems('resaundtill_posts', {
				limit: -1,
				sort: ['date'],
				fields: ['id', 'location', 'isFlight']
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
					post.countryCode = post.countryCode ?? (await countryStore.getCountryCode(post.location.coordinates));
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
			getDeparture(),
			getSupportInfo(),
			getGalleryShufflePercentage(),
			mapItems(),
			countryPostRelations()
		]);
		return true;
	} catch (error) {
		console.log('error', error);
		return false;
	}
}

export { initDataStores };
