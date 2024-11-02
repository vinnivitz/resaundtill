import type { GeoPoint } from '$lib/models';

export function isPointInPolygon(point: GeoPoint, coordinates: GeoPoint[][][]): boolean {
	const [x, y] = point;
	let inside = false;

	// First Dimension: Iterate over each polygon
	for (const polygon of coordinates) {
		// polygon is of type GeoPoint[][] (array of rings)

		// Second Dimension: Iterate over each ring in the polygon
		for (const ring of polygon) {
			// ring is of type GeoPoint[] (array of points)

			let j = ring.length - 1;

			// Third Dimension: Iterate over each edge of the ring
			for (let i = 0; i < ring.length; i++) {
				const xi = ring[i][0]; // longitude of current point
				const yi = ring[i][1]; // latitude of current point
				const xj = ring[j][0]; // longitude of previous point
				const yj = ring[j][1]; // latitude of previous point

				// Ray-casting algorithm
				const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

				if (intersect) {
					inside = !inside;
				}
				j = i;
			}
		}
	}

	return inside;
}
