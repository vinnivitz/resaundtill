import type { Position } from 'geojson';

import type { BlogPostTranslation } from './directus.model';

export type BlogPostItem = {
	id: string;
	translations: BlogPostTranslation[];
	date: Date;
	formattedDate: { day: string; month: string };
	coordinates?: Position;
	thumbnailUrl: string;
};

export type BlogPostItemDetails = {
	id: string;
	translations: BlogPostTranslation[];
	date: Date;
	formattedDate: { day: string; month: string };
	images: string[];
};

export type BlogPostCountrySearchItem = {
	name: string;
	code: string;
	checked: boolean;
	visible: boolean;
	postIds: string[];
};
