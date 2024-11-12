import type { BlogPostTranslation, CountryEntryTranslation } from './directus.model';
import type { GeoPoint } from './geojson.model';

export type BlogPostItem = {
	id: string;
	translations: BlogPostTranslation[];
	date: Date;
	formattedDate: string;
	coordinates?: GeoPoint;
	thumbnailUrl: string;
};

export type BlogPostItemDetails = {
	id: string;
	translations: BlogPostTranslation[];
	date: Date;
	formattedDate: string;
	images: string[];
};

export type BlogPostCountrySearchItem = {
	name: string;
	code: string;
	checked: boolean;
	postIds: string[];
};
