import type { Position } from 'geojson';

import type { BlogPostTranslation, ImageDetails } from './directus.model';

export type BlogPostItem = {
	id: string;
	title: string;
	date: Date;
	coordinates?: Position;
	thumbnailUrl: string;
};

export type BlogPostItemDetails = {
	id: string;
	translations: BlogPostTranslation[];
	date: Date;
	images: ImageDetails[];
	previousPostId?: string;
	nextPostId?: string;
};

export type BlogPostCountrySearchItem = {
	name: string;
	code: string;
	checked: boolean;
	visible: boolean;
	postIds: string[];
};
