import type { GeoGeometryType, GeoPoint } from './geojson.model';

export type MapItem = {
	location: { type: GeoGeometryType.Point; coordinates: GeoPoint };
	isFlight: boolean;
	id: string;
};
