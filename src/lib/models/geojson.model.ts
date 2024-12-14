import type { Feature, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson';

export type CustomGeoJsonProperties = GeoJsonProperties & {
	ISO_A2: string;
};

export type BoundingBoxEntry = {
	code: string;
	bounds: GeoBoundingBox;
};

export type GeoBoundingBox = {
	min_lon: number;
	min_lat: number;
	max_lon: number;
	max_lat: number;
};

export type GeoCountry = {
	code: string;
	feature: Feature<Polygon | MultiPolygon, CustomGeoJsonProperties>;
};
