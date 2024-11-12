// src/stores/countryStore.ts

import { writable } from 'svelte/store';
import type { Readable } from 'svelte/store';
import * as turf from '@turf/turf';
import { GeoGeometryType, type BoundingBoxEntry, type GeoCountry, type GeoFeature, type GeoPoint } from '$lib/models';
import { getHostUrl } from '$lib/utils';

interface CountryStore extends Readable<Map<string, string>> {
	getCountryCode(location: GeoPoint): Promise<string | undefined>;
	getGeoCountry(code: string): Promise<GeoCountry | undefined>;
}

function createCountryStore(): CountryStore {
	const { subscribe, update } = writable<Map<string, string>>(new Map());

	const countryDataCache = new Map<string, GeoCountry>(); // Cache for country GeoJSON data
	const countryCodeCache = new Map<string, string | undefined>(); // Cache for location to country code
	let countryGeoBoundingBoxes: BoundingBoxEntry[] | undefined = undefined; // Will be loaded from JSON file
	let boundingBoxFetchPromise: Promise<BoundingBoxEntry[]> | null = null;
	const countryDataPromises = new Map<string, Promise<GeoCountry | undefined>>();

	// Function to load country bounding boxes

	async function loadCountryGeoBoundingBoxes(): Promise<BoundingBoxEntry[]> {
		// If bounding boxes are already loaded, return them
		if (countryGeoBoundingBoxes) {
			return countryGeoBoundingBoxes;
		}

		// If a fetch is already in progress, return the ongoing promise
		if (boundingBoxFetchPromise) {
			return boundingBoxFetchPromise;
		}

		// Start fetching and store the promise
		boundingBoxFetchPromise = (async () => {
			try {
				const response = await fetch(`${getHostUrl()}/json/geo_bounding_boxes.json`);
				if (!response.ok) {
					throw new Error('Failed to load country bounding boxes');
				}

				const data: BoundingBoxEntry[] = await response.json();
				countryGeoBoundingBoxes = data;
				return countryGeoBoundingBoxes;
			} catch (error) {
				console.error(error);
				countryGeoBoundingBoxes = [];
				return countryGeoBoundingBoxes;
			} finally {
				// Clear the fetch promise after it resolves or rejects
				boundingBoxFetchPromise = null;
			}
		})();

		return boundingBoxFetchPromise;
	}

	// Function to load country GeoJSON data
	async function loadGeoCountry(countryCode: string): Promise<GeoCountry | undefined> {
		// Check if the country data is already in the cache
		if (countryDataCache.has(countryCode)) {
			return countryDataCache.get(countryCode);
		}

		// Check if a fetch is already in progress
		if (countryDataPromises.has(countryCode)) {
			return countryDataPromises.get(countryCode);
		}

		// Start a new fetch and store the promise
		const fetchPromise = (async () => {
			try {
				const response = await fetch(`${getHostUrl()}/json/geo/${countryCode}.json`);
				if (!response.ok) {
					throw new Error(`Failed to load country data for ${countryCode}`);
				}

				const feature: GeoFeature = await response.json();
				const countryData: GeoCountry = {
					code: countryCode,
					feature
				};

				// Store the fetched data in the cache
				countryDataCache.set(countryCode, countryData);
				return countryData;
			} catch (error) {
				console.error(error);
				return undefined;
			} finally {
				// Remove the promise from the cache when done
				countryDataPromises.delete(countryCode);
			}
		})();

		// Store the promise in the cache
		countryDataPromises.set(countryCode, fetchPromise);
		return fetchPromise;
	}

	async function getGeoCountry(code: string): Promise<GeoCountry | undefined> {
		// Check if the data is already cached
		if (countryDataCache.has(code)) {
			return countryDataCache.get(code);
		}

		// Check if a fetch is already in progress
		if (countryDataPromises.has(code)) {
			return countryDataPromises.get(code);
		}

		// Otherwise, fetch and cache the data
		return await loadGeoCountry(code);
	}

	// Main function to get the country code
	async function getCountryCode(location: GeoPoint): Promise<string | undefined> {
		const cacheKey = `${location[0]},${location[1]}`;

		// Check cache first
		if (countryCodeCache.has(cacheKey)) {
			return countryCodeCache.get(cacheKey);
		}

		// Ensure country bounding boxes are loaded
		if (!countryGeoBoundingBoxes) {
			await loadCountryGeoBoundingBoxes();
		}

		// Find candidate countries based on bounding boxes
		const candidates = countryGeoBoundingBoxes!.filter((country) => {
			const bbox = country.bounds;
			const inLongitudeRange = location[0] >= bbox.min_lon && location[0] <= bbox.max_lon;
			const inLatitudeRange = location[1] >= bbox.min_lat && location[1] <= bbox.max_lat;

			return inLongitudeRange && inLatitudeRange;
		});

		for (const country of candidates) {
			const code = country.code;
			let countryData = countryDataCache.get(code);
			if (!countryData) {
				// Load the country data using the updated function
				countryData = await loadGeoCountry(code);
				if (!countryData) {
					continue;
				}
				// The data is already cached in loadGeoCountry
			}

			const point = turf.point(location);
			const polygon = countryData.feature;
			let isInside = false;

			if (polygon.geometry.type === GeoGeometryType.Polygon) {
				isInside = turf.booleanPointInPolygon(point, polygon as any);
			} else if (polygon.geometry.type === GeoGeometryType.MultiPolygon) {
				for (const coords of polygon.geometry.coordinates) {
					const poly = turf.polygon(coords);
					if (turf.booleanPointInPolygon(point, poly)) {
						isInside = true;
						break;
					}
				}
			}

			if (isInside) {
				const isoA2 = countryData.feature.properties.ISO_A2;
				countryCodeCache.set(cacheKey, isoA2);
				update((store) => {
					store.set(cacheKey, isoA2);
					return store;
				});
				return isoA2;
			}
		}

		// If no country found
		countryCodeCache.set(cacheKey, undefined);
		return undefined;
	}

	return {
		subscribe,
		getCountryCode,
		getGeoCountry
	};
}

export const countryStore = createCountryStore();
