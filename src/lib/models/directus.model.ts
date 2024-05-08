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

export type BlogPostTranslation = {
	id: string;
	title: string;
	description?: string;
	languages_code: { code: string; name: string };
};

export type SupportTranslation = {
	id: string;
	content: string;
	languages_code: string;
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
	resaundtill_departure: Departure;
	resaundtill_support: SupportInfoEntry;
	resaundtill_gallery_shuffle_percentage: GalleryShufflePercentage;
};
