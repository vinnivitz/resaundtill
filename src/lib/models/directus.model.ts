import type { Point } from 'geojson';

export type Translations = {
	languages_code: string;
};

export type Departure = {
	id: string;
	date: string;
};

export type GalleryShufflePercentage = {
	id: string;
	value: number;
};

export type SupportInfoEntry = {
	id: string;
	translations: SupportTranslation[];
};

export type BlogPostEntry<T = string> = {
	id: string;
	status: BlogPostStatus;
	date: string;
	isFlight: boolean;
	translations: BlogPostTranslation[];
	location?: Point;
	images?: DirectusImage<T>[];
	countryCode?: string;
};

export type CountryEntry = {
	id: string;
	translations: CountryEntryTranslation[];
	code: string;
	thumbnail?: string;
	capital: string;
	area: number;
	population: number;
	currency: string;
};

export type CountryEntryTranslation = Translations & {
	id: string;
	name: string;
	description?: string;
};

export type BlogPostTranslation = Translations & {
	id: string;
	title: string;
	description?: string;
};

export type SupportTranslation = Translations & {
	id: string;
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
	date: string;
};

export type DirectusImage<T = string> = {
	id: string;
	directus_files_id: T;
	resaundtill_posts_id: string;
};

export enum BlogPostStatus {
	PUBLIC = 'public',
	PRIVATE = 'private'
}

export type Collections = {
	resaundtill_posts: BlogPostEntry[];
	resaundtill_countries: CountryEntry[];
	resaundtill_departure: Departure;
	resaundtill_support: SupportInfoEntry;
	resaundtill_gallery_shuffle_percentage: GalleryShufflePercentage;
};
