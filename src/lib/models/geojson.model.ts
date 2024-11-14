import type { Feature, FeatureCollection, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson';

export type CustomFeatureCollection = FeatureCollection<Polygon | MultiPolygon, CustomGeoJsonProperties> & {
	type: FeatureCollection;
	features: Feature<Polygon | MultiPolygon, CustomGeoJsonProperties>[];
};

export type CustomGeoJsonProperties = GeoJsonProperties & {
	ADMIN: string;
	ISO_A3: string;
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
