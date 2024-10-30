export type GeoFeatureCollection = {
	type: GeoFeatureType.FeatureCollection;
	features: GeoFeature[];
};

export type GeoFeature = {
	type: GeoFeatureType.Feature;
	properties: {
		ADMIN: string;
		ISO_A3: string;
		ISO_A2: string;
	};
	geometry: {
		coordinates: number[][][][];
		type: GeoGeometryType;
	};
};

export enum GeoFeatureType {
	Feature = 'Feature',
	FeatureCollection = 'FeatureCollection'
}

export enum GeoGeometryType {
	Point = 'Point',
	LineString = 'LineString',
	Polygon = 'Polygon',
	MultiPoint = 'MultiPoint',
	MultiLineString = 'MultiLineString',
	MultiPolygon = 'MultiPolygon'
}
