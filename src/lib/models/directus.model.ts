export type Translations = {
	languages_code: string;
};

export type Departure = {
	id: string;
	date: string;
};

export type DirectusLocation = {
	coordinates: number[];
	type: string;
};

export type GalleryShufflePercentage = {
	id: string;
	value: number;
};

export type SupportInfoEntry = {
	id: string;
	translations: SupportTranslation[];
};

export type BlogPostEntry = {
	id: string;
	status: BlogPostStatus;
	date: string;
	isFlight: boolean;
	translations: BlogPostTranslation[];
	location?: DirectusLocation;
	images?: BlogPostImage[];
};

export type CountryEntry = {
	id: string;
	translations: CountryEntryTranslation[];
	code: string;
	thumbnail?: string;
	entries: CountryEntryBlogPost[];
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

export type CountryEntryBlogPost = {
	id: string;
	resaundtill_countries_id: string;
	resaundtill_posts_id: string;
};

export type DirectusImage = {
	id: string;
	uploaded_on: string;
	height: number;
	width: number;
	title?: string;
	description?: string;
};

export type BlogPostImage = {
	id: string;
	directus_files_id: DirectusImage;
	resaundtill_id: BlogPostEntry;
};

export enum BlogPostStatus {
	public = 'public',
	private = 'private'
}

export type Collections = {
	resaundtill_posts: BlogPostEntry[];
	resaundtill_countries: CountryEntry[];
	resaundtill_departure: Departure;
	resaundtill_support: SupportInfoEntry;
	resaundtill_gallery_shuffle_percentage: GalleryShufflePercentage;
};
