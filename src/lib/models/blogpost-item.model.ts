import type { BlogPostTranslation } from './directus.model';

export type BlogPostItem = {
	id: string;
	translations: BlogPostTranslation[];
	imageUrl: string;
	formattedDate: { day: number; month: string };
};
