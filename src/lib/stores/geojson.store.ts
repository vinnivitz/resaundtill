// src/stores/countryStore.ts

import * as turf from '@turf/turf';
import type { Feature, MultiPolygon, Polygon, Position } from 'geojson';
import { writable } from 'svelte/store';
import type { Readable } from 'svelte/store';

import type { BoundingBoxEntry, CustomGeoJsonProperties, GeoCountry } from '$lib/models';
import { getHostUrl } from '$lib/utils';

import { alertStore } from './alert.store';

type GeoJsonStore = Readable<Map<string, string>> & {
	getCountryCode(location: Position): Promise<string | undefined>;
	getGeoCountry(code: string): Promise<GeoCountry | undefined>;
};

function createGeoJsonStore(): GeoJsonStore {
	const { subscribe, update } = writable<Map<string, string>>(new Map());

	const countryDataCache = new Map<string, GeoCountry>();
	const countryCodeCache = new Map<string, string | undefined>();
	let countryGeoBoundingBoxes: BoundingBoxEntry[] | undefined = undefined;
	let boundingBoxFetchPromise: Promise<BoundingBoxEntry[]> | undefined = undefined;
	const countryDataPromises = new Map<string, Promise<GeoCountry | undefined>>();

	async function loadCountryGeoBoundingBoxes(): Promise<BoundingBoxEntry[]> {
		if (countryGeoBoundingBoxes) {
			return countryGeoBoundingBoxes;
		}

		if (boundingBoxFetchPromise) {
			return boundingBoxFetchPromise;
		}

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
				alertStore.setAlert('Failed to load data.');
				return countryGeoBoundingBoxes;
			} finally {
				boundingBoxFetchPromise = undefined;
			}
		})();

		return boundingBoxFetchPromise;
	}

	async function loadGeoCountry(countryCode: string): Promise<GeoCountry | undefined> {
		if (countryDataCache.has(countryCode)) {
			return countryDataCache.get(countryCode);
		}

		if (countryDataPromises.has(countryCode)) {
			return countryDataPromises.get(countryCode);
		}

		const fetchPromise = (async () => {
			try {
				const response = await fetch(`${getHostUrl()}/json/geo/${countryCode}.json`);
				if (!response.ok) {
					alertStore.setAlert(`Failed to load country data for ${countryCode}`);
					throw new Error(response.statusText);
				}

				const feature: Feature<Polygon | MultiPolygon, CustomGeoJsonProperties> = await response.json();
				const countryData: GeoCountry = {
					code: countryCode,
					feature
				};

				countryDataCache.set(countryCode, countryData);
				return countryData;
			} catch (error) {
				console.error(error);
				alertStore.setAlert(`Failed to load country data`);
			} finally {
				countryDataPromises.delete(countryCode);
			}
		})();

		countryDataPromises.set(countryCode, fetchPromise);
		return fetchPromise;
	}

	async function getGeoCountry(code: string): Promise<GeoCountry | undefined> {
		if (countryDataCache.has(code)) {
			return countryDataCache.get(code);
		}

		if (countryDataPromises.has(code)) {
			return countryDataPromises.get(code);
		}

		return await loadGeoCountry(code);
	}

	async function getCountryCode(location: Position): Promise<string | undefined> {
		const cacheKey = `${location[0]},${location[1]}`;

		if (countryCodeCache.has(cacheKey)) {
			return countryCodeCache.get(cacheKey);
		}

		if (!countryGeoBoundingBoxes) {
			await loadCountryGeoBoundingBoxes();
		}

		const candidates = getCandidates(location);

		for (const country of candidates) {
			const code = country.code;
			let countryData = countryDataCache.get(code);
			if (!countryData) {
				countryData = await loadGeoCountry(code);
				if (!countryData) {
					continue;
				}
			}

			if (isInsidePolygon(location, countryData.feature.geometry)) {
				const isoA2 = countryData.feature.properties.ISO_A2;
				countryCodeCache.set(cacheKey, isoA2);
				update((store) => {
					store.set(cacheKey, isoA2);
					return store;
				});
				return isoA2;
			}
		}

		countryCodeCache.set(cacheKey, undefined);
		return undefined;
	}

	function getCandidates(location: Position): BoundingBoxEntry[] {
		return countryGeoBoundingBoxes!.filter((country) => {
			const bbox = country.bounds;
			const inLongitudeRange = location[0] >= bbox.min_lon && location[0] <= bbox.max_lon;
			const inLatitudeRange = location[1] >= bbox.min_lat && location[1] <= bbox.max_lat;

			return inLongitudeRange && inLatitudeRange;
		});
	}

	return {
		subscribe,
		getCountryCode,
		getGeoCountry
	};
}

function isInsidePolygon(location: Position, polygon: Polygon | MultiPolygon): boolean {
	const point = turf.point(location);

	if (polygon.type === 'Polygon') {
		return turf.booleanPointInPolygon(point, polygon);
	} else if (polygon.type === 'MultiPolygon') {
		for (const coords of polygon.coordinates) {
			const poly = turf.polygon(coords);
			if (turf.booleanPointInPolygon(point, poly)) {
				return true;
			}
		}
	}

	return false;
}

export const geoJsonStore = createGeoJsonStore();
