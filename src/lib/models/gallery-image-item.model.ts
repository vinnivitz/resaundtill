import type { ID } from '@directus/sdk';

export type GalleryImageItem = {
	id: ID;
	title?: string;
	description?: string;
	src: string;
	thumb: string;
	loaded: boolean;
	height: number;
	width: number;
};
