import type { Point } from 'geojson';

export type Translations = {
	languages_code: string;
};

export type GalleryShufflePercentage = {
	value: number;
};

export type SupportInfoEntry = {
	translations: SupportTranslation[];
};

export type BlogPostEntry<T = string> = {
	id: string;
	date: string;
	isFlight: boolean;
	translations: BlogPostTranslation[];
	location?: Point;
	images?: DirectusImage<T>[];
	countryCode?: string;
	previousPostId?: string;
	nextPostId?: string;
};

export type CountryEntry = {
	index: number;
	translations: CountryEntryTranslation[];
	code: string;
	thumbnail?: string;
	area: number;
	population: number;
	previousCountryCode?: string;
	nextCountryCode?: string;
};

export type CountryEntryTranslation = Translations & {
	name: string;
	capital: string;
	currency: string;
	description?: string;
};

export type BlogPostTranslation = Translations & {
	title: string;
	description?: string;
};

export type SupportTranslation = Translations & {
	content: string;
};

export type DirectusImageDetails = {
	id: string;
	uploaded_on: string;
	height: number;
	width: number;
	title?: string;
	description?: string;
};

export type ImageDetails = DirectusImageDetails & {
	postId: string;
};

export type DirectusImage<T = string> = {
	directus_files_id: T;
};

export type Collections = {
	resaundtill_posts: BlogPostEntry[];
	resaundtill_countries: CountryEntry[];
	resaundtill_support: SupportInfoEntry;
	resaundtill_gallery_shuffle_percentage: GalleryShufflePercentage;
};
