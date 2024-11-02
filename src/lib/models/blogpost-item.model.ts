import type { BlogPostTranslation } from './directus.model';

export type BlogPostItem = {
	id: string;
	translations: BlogPostTranslation[];
	imageUrl: string;
	date: Date;
	formattedDate: { day: number; month: string };
};
