// src/stores/countryStore.ts

import { writable } from 'svelte/store';
import type { Readable } from 'svelte/store';
import * as turf from '@turf/turf';
import { GeoGeometryType, type BoundingBoxEntry, type GeoCountry, type GeoFeature, type GeoPoint } from '$lib/models';
import { getHostUrl } from '$lib/utils';

interface CountryStore extends Readable<Map<string, string>> {
	getCountryCode(location: GeoPoint): Promise<string | undefined>;
	countryDataCache: Map<string, GeoCountry>;
}

function createCountryStore(): CountryStore {
	const { subscribe, update } = writable<Map<string, string>>(new Map());

	const countryDataCache = new Map<string, GeoCountry>(); // Cache for country GeoJSON data
	const countryCodeCache = new Map<string, string | undefined>(); // Cache for location to country code
	let countryGeoBoundingBoxes: BoundingBoxEntry[] | undefined = undefined; // Will be loaded from JSON file

	// Function to load country bounding boxes
	async function loadCountryGeoBoundingBoxes(): Promise<BoundingBoxEntry[]> {
		if (countryGeoBoundingBoxes) {
			return countryGeoBoundingBoxes;
		}

		try {
			const response = await fetch(`${getHostUrl()}/json/geo_bounding_boxes.json`); // Adjust the path
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
		}
	}

	// Function to load country GeoJSON data
	async function loadGeoCountry(countryCode: string): Promise<GeoCountry | undefined> {
		try {
			const response = await fetch(`${getHostUrl()}/json/geo/${countryCode}.json`); // Adjust the path as needed
			if (!response.ok) {
				throw new Error(`Failed to load country data for ${countryCode}`);
			}

			const feature: GeoFeature = await response.json();

			const countryData: GeoCountry = {
				code: countryCode,
				feature
			};

			return countryData;
		} catch (error) {
			console.error(error);
			return undefined;
		}
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
				// Load the country data
				countryData = await loadGeoCountry(code);
				if (!countryData) {
					continue;
				}
				countryDataCache.set(code, countryData);
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
		countryDataCache
	};
}

export const countryStore = createCountryStore();
