import type { FetchInterface } from '@directus/sdk';
import type { Position } from 'geojson';
import type { Readable } from 'svelte/store';

import type { BlogPostEntry, CountryEntry, MapItem, SupportInfoEntry } from './';

export type DataModel = {
	posts: BlogPostEntry[];
	countries: CountryEntry[];
	departure: Date;
	supportInfo: SupportInfoEntry;
	galleryShufflePercentage: number;
	postToImages: Map<string, string[]>;
	images: string[];
	currentCoordinates: Position | undefined;
	mapItems: MapItem[];
	countryToPosts: Map<string, string[]>;
	postToCountry: Map<string, string>;
};

export type DataStore = Readable<DataModel> & { init: (fetch: FetchInterface) => Promise<boolean> };
