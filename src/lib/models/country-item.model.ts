import type { BlogPostEntry } from './directus.model';
import type { MapItem } from './posts.model';

export type CountryItemDetails = {
	code: string;
	name: string;
	description?: string;
	population: number;
	area: number;
	capital: string;
	currency: string;
	posts?: BlogPostEntry[];
	mapItems?: MapItem[];
	previousCountryCode?: string;
	nextCountryCode?: string;
};

export type CountryItem = {
	code: string;
	name: string;
	thumbnailUrl: string;
};
