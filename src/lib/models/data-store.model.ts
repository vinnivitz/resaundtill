import type { Readable } from 'svelte/store';
import type { BlogPostEntry, CountryEntry, GeoPoint, MapItem, SupportInfoEntry } from './';

export type DataModel = {
	posts: BlogPostEntry[];
	countries: CountryEntry[];
	departure: Date;
	supportInfo: SupportInfoEntry;
	galleryShufflePercentage: number;
	postToImages: Map<string, string[]>;
	images: string[];
	currentCoordinates: GeoPoint | undefined;
	mapItems: MapItem[];
	countryToPosts: Map<string, string[]>;
	postToCountry: Map<string, string>;
};

export type DataStore = Readable<DataModel> & { init: () => Promise<void> };
