import type { CountryEntryTranslation } from './directus.model';

export type CountryItem = {
	id: string;
	code: string;
	imageUrl: string;
	translations: CountryEntryTranslation[];
};
