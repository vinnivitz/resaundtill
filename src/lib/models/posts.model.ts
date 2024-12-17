import type { Point } from 'geojson';

import type { BlogPostTranslation } from './directus.model';

export type MapItem = {
	id: string;
	date: string;
	translations: BlogPostTranslation[];
	nextItemId?: string;
	location: Point;
	isFlight: boolean;
};
