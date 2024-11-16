export type GalleryImageItem = {
	id: string;
	postId: string;
	title?: string;
	description?: string;
	src: string;
	thumb: string;
	requested: boolean;
	loaded: boolean;
	height: number;
	width: number;
	date: string;
	progress: number;
};
