// src/stores/dataStore.ts
import { writable } from 'svelte/store';
import SDK from '$lib/sdk';
import { readItems, readSingleton } from '@directus/sdk';
import {
	type BlogPostEntry,
	type Departure,
	type SupportInfoEntry,
	type GalleryShufflePercentage,
	type CountryEntry,
	type MapItem,
	type GeoPoint
} from '$lib/models';
import type { DataModel, DataStore } from '$lib/models/data-store.model';
import { countryStore } from './';

let initialized = false;

function createDataStore(): DataStore {
	const { subscribe, update } = writable<DataModel>();

	async function init(): Promise<void> {
		if (initialized) {
			return;
		}
		initialized = true;

		async function getPosts(): Promise<void> {
			try {
				const posts = await SDK.request<BlogPostEntry[]>(
					readItems('resaundtill_posts', {
						limit: -1,
						sort: ['-date'],
						fields: ['id', 'date', 'translations.*']
					})
				);
				update((state) => ({ ...state, posts }));
				console.log('posts updated');
			} catch (error) {
				console.error(error);
			}
		}

		async function getImages(): Promise<void> {
			try {
				const posts = await SDK.request<BlogPostEntry[]>(
					readItems('resaundtill_posts', { fields: ['id', 'images.*'] })
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
				update((state) => ({ ...state, postToImages }));

				const images = Array.from(postToImages.values()).flat();
				update((state) => ({ ...state, images }));
				console.log('images updated');
			} catch (error) {
				console.error(error);
				update((state) => ({ ...state, files: [], postToImages: new Map() }));
			}
		}

		async function getCountries(): Promise<void> {
			try {
				const countries = await SDK.request<CountryEntry[]>(
					readItems('resaundtill_countries', {
						fields: ['id', 'code', 'translations.*', 'population', 'area', 'capital', 'currency', 'thumbnail']
					})
				);
				update((state) => ({ ...state, countries }));
				console.log('countries updated');
			} catch (error) {
				console.error(error);
				update((state) => ({ ...state, countries: [] }));
			}
		}

		async function getDeparture(): Promise<void> {
			try {
				const departure = await SDK.request<Departure>(readSingleton('resaundtill_departure', { fields: ['date'] }));
				update((state) => ({ ...state, departure: new Date(departure.date) }));
				console.log('departure updated');
			} catch (error) {
				console.error(error);
				update((state) => ({ ...state, departure: new Date() }));
			}
		}

		async function getSupportInfo(): Promise<void> {
			try {
				const supportInfo = await SDK.request<SupportInfoEntry>(
					// @ts-expect-error - Directus SDK typings are incorrect
					readSingleton('resaundtill_support', { fields: ['id', 'translations.*'] })
				);
				update((state) => ({ ...state, supportInfo }));
				console.log('support updated');
			} catch (error) {
				console.error(error);
				update((state) => ({ ...state, supportInfo: { id: '', translations: [] } }));
			}
		}

		async function getGalleryShufflePercentage(): Promise<void> {
			try {
				const galleryShufflePercentage = await SDK.request<GalleryShufflePercentage>(
					readSingleton('resaundtill_gallery_shuffle_percentage')
				);
				update((state) => ({ ...state, galleryShufflePercentage: galleryShufflePercentage.value }));
				console.log('shuffle updated');
			} catch (error) {
				console.error(error);
				update((state) => ({ ...state, galleryShufflePercentage: 0 }));
			}
		}

		async function currentCoordinates(): Promise<void> {
			try {
				const post = await SDK.request<BlogPostEntry[]>(
					readItems('resaundtill_posts', {
						limit: 1,
						sort: ['-date'],
						fields: ['location']
					})
				);
				update((state) => ({ ...state, currentCoordinates: post[0]?.location?.coordinates as GeoPoint }));
				console.log('coordinates updated');
			} catch (error) {
				console.error(error);
				update((state) => ({ ...state, currentCoordinates: undefined }));
			}
		}

		async function mapItems(): Promise<void> {
			try {
				const posts = await SDK.request<BlogPostEntry[]>(
					readItems('resaundtill_posts', {
						limit: -1,
						sort: ['date'],
						fields: ['id', 'location', 'isFlight']
					})
				);
				update((state) => ({ ...state, mapItems: posts.filter((post) => post.location) as MapItem[] }));
				console.log('map updated');
			} catch (error) {
				console.error(error);
				update((state) => ({ ...state, mapItems: [] }));
			}
		}

		async function countryPostRelations(): Promise<void> {
			try {
				const posts = await SDK.request<BlogPostEntry[]>(
					readItems('resaundtill_posts', {
						limit: -1,
						sort: ['date'],
						fields: ['id', 'countryCode']
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
				update((state) => ({ ...state, countryToPosts }));

				const postToCountry = new Map<string, string>();
				for (const [countryCode, postIds] of countryToPosts.entries()) {
					for (const postId of postIds) {
						postToCountry.set(postId, countryCode);
					}
				}
				update((state) => ({ ...state, postToCountry }));
				console.log('country post updated');
			} catch (error) {
				console.log('error', error);
				update((state) => ({ ...state, countryToPosts: new Map() }));
			}
		}

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
	}

	return {
		subscribe,
		init
	};
}

export const dataStore = createDataStore();
