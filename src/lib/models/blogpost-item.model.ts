import type { BlogPostTranslation } from './directus.model';

export type BlogPostItem = {
	id: string;
	translations: BlogPostTranslation[];
	imageUrl: string;
	date: Date;
	formattedDate: { day: number; month: string };
	countryCode: string;
};

export type BlogPostCountrySearchItem = {
	name: string;
	code: string;
	checked: boolean;
	postIds: string[];
};
