import type { Point } from "geojson";

export type MapItem = {
	location: Point;
	isFlight: boolean;
	id: string;
};
