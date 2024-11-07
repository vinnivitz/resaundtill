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
		coordinates: GeoPoint[][][];
		type: GeoGeometryType;
	};
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

export type GeoGeometry =
	| {
			coordinates: GeoPoint[][][];
			type: GeoGeometryType.MultiPolygon;
	  }
	| {
			coordinates: GeoPoint[][];
			type: GeoGeometryType.Polygon;
	  };

export enum GeoFeatureType {
	FeatureCollection = 'FeatureCollection',
	Feature = 'Feature'
}

export type GeoPoint = [number, number];

export enum GeoGeometryType {
	MultiPolygon = 'MultiPolygon',
	Polygon = 'Polygon',
	Point = 'Point'
}

export type GeoCountry = {
	code: string;
	feature: GeoFeature;
};
